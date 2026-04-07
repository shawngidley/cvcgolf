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

    // Get our golfers from the database (ones picked for this tournament)
    const { data: lineups } = await supabase
      .from('lineups')
      .select('golfer_id, golfers(id, name)')
      .eq('tournament_id', tournament_id);

    const dbGolfers = {};
    if (lineups) {
      lineups.forEach(l => {
        if (l.golfers) dbGolfers[l.golfers.id] = l.golfers.name;
      });
    }

    // Also get ALL golfers for broader matching
    const { data: allGolfers } = await supabase
      .from('golfers')
      .select('id, name')
      .eq('is_active', true);

    const allGolferNames = (allGolfers || []).map(g => ({ id: g.id, name: g.name }));

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

    // Step 2: Get competitor list from ESPN with names
    const competitors = espnEvent.competitions?.[0]?.competitors || [];

    // Build ESPN name -> data map
    const espnGolfers = competitors.map(c => ({
      espnId: c.id,
      name: c.athlete?.displayName || c.athlete?.fullName || '',
      score: c.score || ''
    }));

    // Step 3: Pre-match all ESPN golfers to our DB
    const matchedGolfers = espnGolfers.map(eg => ({
      ...eg,
      match: fuzzyMatch(eg.name, allGolferNames)
    }));

    // Fetch earnings in batches of 20 to avoid rate limiting
    const results = [];
    const batchSize = 20;

    for (let i = 0; i < matchedGolfers.length; i += batchSize) {
      const batch = matchedGolfers.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(async (eg) => {
        try {
          const { earnings, position } = await fetchGolferEarnings(eventId, eg.espnId);
          return {
            espn_name: eg.name,
            espn_id: eg.espnId,
            score: eg.score,
            earnings,
            position,
            matched_db_name: eg.match ? eg.match.name : null,
            matched_db_id: eg.match ? eg.match.id : null,
            confidence_score: eg.match ? eg.match.confidence : 0,
            is_picked: eg.match ? !!dbGolfers[eg.match.id] : false
          };
        } catch {
          return {
            espn_name: eg.name,
            espn_id: eg.espnId,
            score: eg.score,
            earnings: 0,
            position: null,
            matched_db_name: eg.match ? eg.match.name : null,
            matched_db_id: eg.match ? eg.match.id : null,
            confidence_score: eg.match ? eg.match.confidence : 0,
            is_picked: eg.match ? !!dbGolfers[eg.match.id] : false
          };
        }
      }));
      results.push(...batchResults);
    }

    // Sort: picked golfers first, then by earnings desc
    results.sort((a, b) => {
      if (a.is_picked !== b.is_picked) return b.is_picked - a.is_picked;
      return (b.earnings || 0) - (a.earnings || 0);
    });

    const unmatched = results.filter(r => r.is_picked === false && r.confidence_score < 0.8 && r.earnings > 0);

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
        picked_golfers: results.filter(r => r.is_picked).length,
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

function fuzzyMatch(espnName, dbGolfers) {
  if (!espnName) return null;

  const normalize = (s) => s.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const espnNorm = normalize(espnName);
  const espnParts = espnNorm.split(' ');
  const espnFirst = espnParts[0];
  const espnLast = espnParts[espnParts.length - 1];

  let bestMatch = null;
  let bestScore = 0;

  for (const g of dbGolfers) {
    const dbNorm = normalize(g.name);

    // Exact match
    if (espnNorm === dbNorm) {
      return { id: g.id, name: g.name, confidence: 1.0 };
    }

    const dbParts = dbNorm.split(' ');
    const dbFirst = dbParts[0];
    const dbLast = dbParts[dbParts.length - 1];

    // Compare last names using Levenshtein
    const lastLev = levenshtein(espnLast, dbLast);
    const lastMaxLen = Math.max(espnLast.length, dbLast.length);
    const lastSimilarity = 1 - (lastLev / lastMaxLen);

    // Last names must be very similar (e.g. "mccarty" vs "mccarthy" = ok, "lee" vs "smith" = no)
    if (lastSimilarity < 0.7) continue;

    // Compare first names using Levenshtein
    const firstLev = levenshtein(espnFirst, dbFirst);
    const firstMaxLen = Math.max(espnFirst.length, dbFirst.length);
    const firstSimilarity = 1 - (firstLev / firstMaxLen);

    // First names must share at least the same initial — reject completely different first names
    // e.g. "matt" vs "denny" = reject, "kh" vs "min" = reject
    if (espnFirst[0] !== dbFirst[0]) continue;

    // First name must also be reasonably similar (not just same initial)
    // Allow abbreviated names (e.g. "jt" matching "justin") but not "matt" vs "maverick"
    const isAbbreviated = espnFirst.length <= 2 || dbFirst.length <= 2;
    if (!isAbbreviated && firstSimilarity < 0.6) continue;

    // Calculate weighted score: 40% first name, 60% last name
    let score;
    if (espnFirst === dbFirst && espnLast === dbLast) {
      score = 0.95;
    } else if (espnFirst === dbFirst && lastSimilarity >= 0.85) {
      // Same first name, very similar last name (e.g. typo or accent difference)
      score = 0.9;
    } else {
      score = (firstSimilarity * 0.4) + (lastSimilarity * 0.6);
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = { id: g.id, name: g.name, confidence: parseFloat(score.toFixed(2)) };
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
