// Netlify function - Scrape PGA Tour earnings from ESPN API
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://iqahjyoytzhhkvwmujha.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { tournament_id } = JSON.parse(event.body);
    if (!tournament_id) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Missing tournament_id' }) };
    }

    // Get tournament info
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournament_id)
      .single();

    if (!tournament) {
      return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ error: 'Tournament not found' }) };
    }

    // Get unique golfers picked for this tournament from lineups
    const { data: lineups } = await supabase
      .from('lineups')
      .select('golfer_id, golfers(id, name)')
      .eq('tournament_id', tournament_id);

    const pickedGolfers = {};
    if (lineups) {
      lineups.forEach(l => {
        if (l.golfers) pickedGolfers[l.golfers.id] = { id: l.golfers.id, name: l.golfers.name };
      });
    }
    const pickedList = Object.values(pickedGolfers);

    if (pickedList.length === 0) {
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true, results: [], total_golfers: 0, picked_golfers: 0, warning: 'No golfers picked for this tournament' }) };
    }

    // Step 1: Find the ESPN event for this tournament date
    const dateStr = tournament.start_date.replace(/-/g, '');
    const scoreboardUrl = `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?dates=${dateStr}`;

    const scoreboardRes = await fetch(scoreboardUrl);
    if (!scoreboardRes.ok) {
      return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ error: 'Failed to fetch ESPN scoreboard', status: scoreboardRes.status }) };
    }

    const scoreboardData = await scoreboardRes.json();
    const espnEvent = scoreboardData.events?.[0];

    if (!espnEvent) {
      return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ error: 'No ESPN event found for this date' }) };
    }

    const eventId = espnEvent.id;
    const eventName = espnEvent.name;
    const isComplete = espnEvent.status?.type?.completed === true;

    // Step 2: Get competitor list from ESPN
    const competitors = espnEvent.competitions?.[0]?.competitors || [];
    const espnGolfers = competitors.map(c => ({
      espnId: c.id,
      name: c.athlete?.displayName || c.athlete?.fullName || '',
      score: c.score || ''
    }));

    // Step 3: For each picked golfer, find their ESPN match
    const matchedPicked = pickedList.map(pg => {
      const espnMatch = findEspnMatch(pg.name, espnGolfers);
      return { ...pg, espnMatch };
    });

    // Step 4: Fetch earnings only for picked golfers that matched an ESPN competitor
    const results = [];
    const batchSize = 20;

    for (let i = 0; i < matchedPicked.length; i += batchSize) {
      const batch = matchedPicked.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(async (pg) => {
        if (!pg.espnMatch) {
          return {
            espn_name: null,
            espn_id: null,
            score: null,
            earnings: 0,
            position: null,
            matched_db_name: pg.name,
            matched_db_id: pg.id,
            confidence_score: 0,
            is_picked: true
          };
        }
        try {
          const { earnings, position } = await fetchGolferEarnings(eventId, pg.espnMatch.espnId);
          return {
            espn_name: pg.espnMatch.name,
            espn_id: pg.espnMatch.espnId,
            score: pg.espnMatch.score,
            earnings,
            position,
            matched_db_name: pg.name,
            matched_db_id: pg.id,
            confidence_score: pg.espnMatch.confidence,
            is_picked: true
          };
        } catch {
          return {
            espn_name: pg.espnMatch.name,
            espn_id: pg.espnMatch.espnId,
            score: pg.espnMatch.score,
            earnings: 0,
            position: null,
            matched_db_name: pg.name,
            matched_db_id: pg.id,
            confidence_score: pg.espnMatch.confidence,
            is_picked: true
          };
        }
      }));
      results.push(...batchResults);
    }

    // Sort by earnings desc
    results.sort((a, b) => (b.earnings || 0) - (a.earnings || 0));

    const unmatched = results.filter(r => !r.espn_id);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        success: true,
        espn_event: eventName,
        espn_event_id: eventId,
        is_complete: isComplete,
        tournament_id: tournament_id,
        tournament_name: tournament.name,
        total_golfers: results.length,
        picked_golfers: results.length,
        unmatched_count: unmatched.length,
        results: results
      })
    };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message, stack: err.stack }) };
  }
};

async function fetchGolferEarnings(eventId, competitorId) {
  let earnings = 0;
  let position = null;

  try {
    // Fetch statistics for earnings
    const statsUrl = `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${competitorId}/statistics?lang=en&region=us`;
    const statsRes = await fetch(statsUrl);
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      const stats = statsData.splits?.categories?.[0]?.stats || [];
      const earningsStat = stats.find(s => s.name === 'amount' || s.name === 'officialAmount');
      if (earningsStat) {
        earnings = earningsStat.value || 0;
      }
    }
  } catch (e) { /* ignore stats fetch errors */ }

  try {
    // Fetch status for position
    const statusUrl = `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${competitorId}/status?lang=en&region=us`;
    const statusRes = await fetch(statusUrl);
    if (statusRes.ok) {
      const statusData = await statusRes.json();
      position = statusData.position?.displayName || null;
      // Check if cut
      if (statusData.type?.name === 'STATUS_CUT') {
        position = 'CUT';
      }
    }
  } catch (e) { /* ignore status fetch errors */ }

  return { earnings, position };
}

// Hardcoded name corrections: ESPN name -> DB name (or null to skip entirely)
const NAME_CORRECTIONS = {
  'Matt McCarty': 'Matt McCarty',
  'Nico Echavarria': 'Nico Echavarria',
  'K.H. Lee': null,       // ignore - not in our league
  'Ryan Palmer': null,     // ignore - not in our league
  'Gordon Sargent': null,  // ignore - not in our league
};

// Build normalized lookup from NAME_CORRECTIONS
const NAME_CORRECTIONS_NORM = {};
Object.entries(NAME_CORRECTIONS).forEach(([espn, db]) => {
  const key = espn.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
  NAME_CORRECTIONS_NORM[key] = db ? db.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim() : null;
});

// Find the best ESPN competitor match for a given DB golfer name
function findEspnMatch(dbName, espnGolfers) {
  if (!dbName || !espnGolfers.length) return null;

  const normalize = (s) => s.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const dbNorm = normalize(dbName);
  const dbParts = dbNorm.split(' ');
  const dbFirst = dbParts[0];
  const dbLast = dbParts[dbParts.length - 1];

  // Check NAME_CORRECTIONS first — direct ESPN-to-DB mapping
  for (const eg of espnGolfers) {
    const espnNorm = normalize(eg.name);
    if (espnNorm in NAME_CORRECTIONS_NORM) {
      const correctedDb = NAME_CORRECTIONS_NORM[espnNorm];
      // null means skip this ESPN golfer entirely
      if (correctedDb === null) continue;
      // If the correction points to our DB golfer, it's a match
      if (correctedDb === dbNorm) {
        return { ...eg, confidence: 1.0 };
      }
      // Otherwise this ESPN golfer is reserved for a different DB golfer — skip
      continue;
    }
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const eg of espnGolfers) {
    const espnNorm = normalize(eg.name);
    if (!espnNorm) continue;

    // Skip ESPN golfers that are handled by NAME_CORRECTIONS
    if (espnNorm in NAME_CORRECTIONS_NORM) continue;

    // Exact string match
    if (dbNorm === espnNorm) {
      return { ...eg, confidence: 1.0 };
    }

    const espnParts = espnNorm.split(' ');
    const espnFirst = espnParts[0];
    const espnLast = espnParts[espnParts.length - 1];

    // Last names must be very similar
    const lastLev = levenshtein(dbLast, espnLast);
    const lastMaxLen = Math.max(dbLast.length, espnLast.length);
    const lastSimilarity = 1 - (lastLev / lastMaxLen);
    if (lastSimilarity < 0.7) continue;

    // First names must share the same initial
    if (dbFirst[0] !== espnFirst[0]) continue;

    // First name similarity check — must be at least 70% similar
    const firstLev = levenshtein(dbFirst, espnFirst);
    const firstMaxLen = Math.max(dbFirst.length, espnFirst.length);
    const firstSimilarity = 1 - (firstLev / firstMaxLen);

    // Allow abbreviated names (e.g. "jt" matching "justin") but require 70% for full names
    const isAbbreviated = dbFirst.length <= 2 || espnFirst.length <= 2;
    if (!isAbbreviated && firstSimilarity < 0.7) continue;

    let score;
    if (dbFirst === espnFirst && dbLast === espnLast) {
      score = 0.95;
    } else if (dbFirst === espnFirst && lastSimilarity >= 0.85) {
      score = 0.9;
    } else {
      score = (firstSimilarity * 0.4) + (lastSimilarity * 0.6);
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = { ...eg, confidence: parseFloat(score.toFixed(2)) };
    }
  }

  return bestMatch && bestScore >= 0.5 ? bestMatch : null;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}
