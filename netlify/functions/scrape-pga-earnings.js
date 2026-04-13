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

// 2026 Masters exact payout table (purse: $22.5M)
const MASTERS_2026_PAYOUTS = {
  1: 4500000, 2: 2430000, 3: 1530000, 4: 1080000, 5: 900000,
  6: 810000, 7: 753750, 8: 697500, 9: 652500, 10: 607500,
  11: 562500, 12: 517500, 13: 472500, 14: 427500, 15: 405000,
  16: 382500, 17: 360000, 18: 337500, 19: 315000, 20: 292500,
  21: 270000, 22: 252000, 23: 234000, 24: 216000, 25: 198000,
  26: 180000, 27: 173250, 28: 166500, 29: 159750, 30: 153000,
  31: 146250, 32: 139500, 33: 132750, 34: 127125, 35: 121500,
  36: 115875, 37: 110250, 38: 105750, 39: 101250, 40: 96750,
  41: 92250, 42: 87750, 43: 83250, 44: 78750, 45: 74250,
  46: 69750, 47: 65250, 48: 61650, 49: 58500, 50: 56700,
  51: 55250, 52: 54000, 53: 53100, 54: 52200
};

// Standard PGA payout structure by position (percentage of purse)
const PAYOUT_TABLE = [
  0.18, 0.108, 0.068, 0.048, 0.04, 0.036, 0.0335, 0.031, 0.0287, 0.0265,
  0.0245, 0.0225, 0.0207, 0.019, 0.0177, 0.0165, 0.0155, 0.0145, 0.0135, 0.0125,
  0.0117, 0.011, 0.01035, 0.0097, 0.0091, 0.0085, 0.00795, 0.0074, 0.0069, 0.0064
];
const RANGE_PAYOUTS = [
  { start: 31, end: 35, pct: 0.005875 },
  { start: 36, end: 40, pct: 0.005025 },
  { start: 41, end: 45, pct: 0.004325 },
  { start: 46, end: 50, pct: 0.00375 },
  { start: 51, end: 55, pct: 0.00335 },
  { start: 56, end: 60, pct: 0.00305 },
  { start: 61, end: 65, pct: 0.00285 },
];
const MIN_PAYOUT_PCT = 0.0027;

function getMastersPayoutForPosition(pos) {
  return MASTERS_2026_PAYOUTS[pos] || 0;
}

function getPayoutForPosition(pos, purse) {
  if (pos >= 1 && pos <= 30) return Math.round(purse * PAYOUT_TABLE[pos - 1]);
  for (const r of RANGE_PAYOUTS) {
    if (pos >= r.start && pos <= r.end) return Math.round(purse * r.pct);
  }
  if (pos > 65) return Math.round(purse * MIN_PAYOUT_PCT);
  return 0;
}

function calculateTiedEarnings(position, tiedCount, purse, isMasters) {
  let total = 0;
  for (let i = 0; i < tiedCount; i++) {
    total += isMasters
      ? getMastersPayoutForPosition(position + i)
      : getPayoutForPosition(position + i, purse);
  }
  return Math.round(total / tiedCount);
}

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

    const purse = (tournament.purse_millions || 20) * 1000000;
    const isMasters = tournament.is_major && tournament.short_name === 'Masters';

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
      score: c.score || '',
      order: c.order || 999
    }));

    // Step 3: For each picked golfer, find their ESPN match
    const matchedPicked = pickedList.map(pg => {
      const espnMatch = findEspnMatch(pg.name, espnGolfers);
      return { ...pg, espnMatch };
    });

    // Step 4: Fetch status for ALL competitors to calculate positions and ties
    const allCompetitorIds = competitors.map(c => c.id);
    const statusMap = {};
    const fetchBatchSize = 25;

    for (let i = 0; i < allCompetitorIds.length; i += fetchBatchSize) {
      const batch = allCompetitorIds.slice(i, i + fetchBatchSize);
      await Promise.all(batch.map(async (cId) => {
        try {
          const url = `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${cId}/status`;
          const res = await fetch(url);
          if (res.ok) {
            statusMap[cId] = await res.json();
          }
        } catch (e) { /* ignore */ }
      }));
    }

    // Step 5: Try to get ESPN earnings for picked golfers
    const espnEarningsMap = {};
    const pickedEspnIds = matchedPicked.filter(pg => pg.espnMatch).map(pg => pg.espnMatch.espnId);

    for (let i = 0; i < pickedEspnIds.length; i += fetchBatchSize) {
      const batch = pickedEspnIds.slice(i, i + fetchBatchSize);
      await Promise.all(batch.map(async (cId) => {
        try {
          const statsUrl = `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${cId}/statistics?lang=en&region=us`;
          const statsRes = await fetch(statsUrl);
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            const stats = statsData.splits?.categories?.[0]?.stats || [];
            const earningsStat = stats.find(s => s.name === 'amount' || s.name === 'officialAmount');
            if (earningsStat && earningsStat.value > 0) {
              espnEarningsMap[cId] = earningsStat.value;
            }
          }
        } catch (e) { /* ignore */ }
      }));
    }

    // Check if ESPN provided any earnings
    const hasEspnEarnings = Object.keys(espnEarningsMap).length > 0;

    // Step 6: Calculate positions and ties from FULL field (for fallback earnings)
    const sortedCompetitors = [...competitors].sort((a, b) => (a.order || 999) - (b.order || 999));
    const scoreGroups = {};

    sortedCompetitors.forEach(c => {
      const st = statusMap[c.id];
      const statusName = st?.type?.name || '';
      if (statusName === 'STATUS_CUT' || statusName === 'STATUS_WITHDRAWN' || statusName === 'STATUS_DISQUALIFIED') {
        return;
      }
      const score = c.score || 'X';
      if (!scoreGroups[score]) scoreGroups[score] = [];
      scoreGroups[score].push(c.id);
    });

    const positionMap = {};
    let currentPos = 1;
    const scoreOrder = Object.keys(scoreGroups).sort((a, b) => {
      const aFirst = sortedCompetitors.find(c => scoreGroups[a].includes(c.id));
      const bFirst = sortedCompetitors.find(c => scoreGroups[b].includes(c.id));
      return (aFirst?.order || 999) - (bFirst?.order || 999);
    });

    scoreOrder.forEach(score => {
      const ids = scoreGroups[score];
      const tiedCount = ids.length;
      const isTied = tiedCount > 1;
      ids.forEach(id => {
        positionMap[id] = {
          position: isTied ? `T${currentPos}` : `${currentPos}`,
          positionNum: currentPos,
          tiedCount
        };
      });
      currentPos += tiedCount;
    });

    // Step 7: Build results — use ESPN earnings if available, otherwise calculate from position
    const results = matchedPicked.map(pg => {
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

      const espnId = pg.espnMatch.espnId;
      const st = statusMap[espnId];
      const statusName = st?.type?.name || '';
      const isCut = statusName === 'STATUS_CUT';
      const isWD = statusName === 'STATUS_WITHDRAWN' || statusName === 'STATUS_DISQUALIFIED';

      const posInfo = positionMap[espnId];
      const position = isCut ? 'CUT' : isWD ? 'WD' : (posInfo?.position || st?.position?.displayName || '-');
      const positionNum = posInfo?.positionNum || 999;
      const tiedCount = posInfo?.tiedCount || 1;

      let earnings = 0;
      if (hasEspnEarnings) {
        // Use actual ESPN earnings
        earnings = espnEarningsMap[espnId] || 0;
      } else if (!isCut && !isWD && positionNum < 999) {
        // Fallback: calculate from position + payout table
        earnings = calculateTiedEarnings(positionNum, tiedCount, purse, isMasters);
      }

      return {
        espn_name: pg.espnMatch.name,
        espn_id: espnId,
        score: pg.espnMatch.score,
        earnings,
        position,
        matched_db_name: pg.name,
        matched_db_id: pg.id,
        confidence_score: pg.espnMatch.confidence,
        is_picked: true,
        earnings_source: hasEspnEarnings ? 'espn' : 'calculated'
      };
    });

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
        earnings_source: hasEspnEarnings ? 'espn' : 'calculated',
        results: results
      })
    };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message, stack: err.stack }) };
  }
};

// Hardcoded name corrections: ESPN name -> DB name (or null to skip entirely)
const NAME_CORRECTIONS = {
  'Matt McCarty': 'Matt McCarty',
  'Denny McCarthy': 'Denny McCarthy',
  'Nico Echavarria': 'Nico Echavarria',
  'K.H. Lee': null,
  'Ryan Palmer': null,
  'Gordon Sargent': null,
};

const DB_NAME_LOCKS = {
  'denny mccarthy': 'denny mccarthy',
  'matt mccarty': 'matt mccarty',
};

const NAME_CORRECTIONS_NORM = {};
Object.entries(NAME_CORRECTIONS).forEach(([espn, db]) => {
  const key = espn.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
  NAME_CORRECTIONS_NORM[key] = db ? db.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim() : null;
});

function findEspnMatch(dbName, espnGolfers) {
  if (!dbName || !espnGolfers.length) return null;

  const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();

  const dbNorm = normalize(dbName);
  const dbParts = dbNorm.split(' ');
  const dbFirst = dbParts[0];
  const dbLast = dbParts[dbParts.length - 1];

  if (dbNorm in DB_NAME_LOCKS) {
    const requiredEspn = DB_NAME_LOCKS[dbNorm];
    const exactEspn = espnGolfers.find(eg => normalize(eg.name) === requiredEspn);
    return exactEspn ? { ...exactEspn, confidence: 1.0 } : null;
  }

  for (const eg of espnGolfers) {
    const espnNorm = normalize(eg.name);
    if (espnNorm in NAME_CORRECTIONS_NORM) {
      const correctedDb = NAME_CORRECTIONS_NORM[espnNorm];
      if (correctedDb === null) continue;
      if (correctedDb === dbNorm) {
        return { ...eg, confidence: 1.0 };
      }
      continue;
    }
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const eg of espnGolfers) {
    const espnNorm = normalize(eg.name);
    if (!espnNorm) continue;
    if (espnNorm in NAME_CORRECTIONS_NORM) continue;

    if (dbNorm === espnNorm) {
      return { ...eg, confidence: 1.0 };
    }

    const espnParts = espnNorm.split(' ');
    const espnFirst = espnParts[0];
    const espnLast = espnParts[espnParts.length - 1];

    const lastLev = levenshtein(dbLast, espnLast);
    const lastMaxLen = Math.max(dbLast.length, espnLast.length);
    const lastSimilarity = 1 - (lastLev / lastMaxLen);
    if (lastSimilarity < 0.7) continue;

    if (dbFirst[0] !== espnFirst[0]) continue;

    const firstLev = levenshtein(dbFirst, espnFirst);
    const firstMaxLen = Math.max(dbFirst.length, espnFirst.length);
    const firstSimilarity = 1 - (firstLev / firstMaxLen);

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
