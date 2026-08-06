// Netlify function - Fetch official PGA Tour earnings from the Live Golf Data API
const { createClient } = require('@supabase/supabase-js');
const { getSchedule, getLeaderboard, getEarnings, findScheduleEntry, buildPlayersFromLeaderboard, findGolferMatch } = require('./lib/rapidapi-golf');

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

    // Step 1: Find the Live Golf Data schedule entry for this tournament
    const year = new Date(tournament.start_date + 'T00:00:00Z').getFullYear();
    let scheduleEntry;
    try {
      const schedule = await getSchedule(year);
      scheduleEntry = findScheduleEntry(schedule.schedule, tournament);
    } catch (e) {
      return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ error: `Schedule lookup failed: ${e.message}` }) };
    }

    if (!scheduleEntry) {
      return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ error: 'No matching tournament found in schedule' }) };
    }

    // Step 2: Fetch the final leaderboard (position/score) and official earnings
    let leaderboard, earningsData;
    try {
      [leaderboard, earningsData] = await Promise.all([
        getLeaderboard(scheduleEntry.tournId, year),
        getEarnings(scheduleEntry.tournId, year)
      ]);
    } catch (e) {
      return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ error: `Live Golf Data fetch failed: ${e.message}` }) };
    }

    const rows = leaderboard.leaderboardRows || [];
    if (rows.length === 0) {
      return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ error: 'No leaderboard rows found for this event' }) };
    }

    const isComplete = leaderboard.status === 'Official';

    const officialEarningsMap = {};
    (earningsData.leaderboard || []).forEach(p => { officialEarningsMap[p.playerId] = p.earnings || 0; });
    const hasOfficialEarnings = Object.keys(officialEarningsMap).length > 0;

    const apiPlayers = buildPlayersFromLeaderboard(rows);

    // Official earnings take precedence; fall back to the calculated payout
    // table only when the earnings endpoint hasn't posted amounts yet.
    apiPlayers.forEach(p => {
      if (hasOfficialEarnings) {
        p.earnings = officialEarningsMap[p.playerId] || 0;
      } else if (!p.isCut && !p.isWD && p.positionNum !== 999) {
        p.earnings = calculateTiedEarnings(p.positionNum, p.tiedCount, purse, isMasters);
      } else {
        p.earnings = 0;
      }
    });

    // Step 3: For each picked golfer, find their match on the leaderboard
    const matchedPicked = pickedList.map(pg => {
      const apiMatch = findGolferMatch(pg.name, apiPlayers);
      return { ...pg, apiMatch };
    });

    // Step 4: Build results
    const results = matchedPicked.map(pg => {
      if (!pg.apiMatch) {
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

      return {
        espn_name: pg.apiMatch.name,
        espn_id: pg.apiMatch.playerId,
        score: pg.apiMatch.score,
        earnings: pg.apiMatch.earnings,
        position: pg.apiMatch.position,
        matched_db_name: pg.name,
        matched_db_id: pg.id,
        confidence_score: pg.apiMatch.confidence,
        is_picked: true,
        earnings_source: hasOfficialEarnings ? 'espn' : 'calculated'
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
        espn_event: scheduleEntry.name,
        espn_event_id: scheduleEntry.tournId,
        is_complete: isComplete,
        tournament_id: tournament_id,
        tournament_name: tournament.name,
        total_golfers: results.length,
        picked_golfers: results.length,
        unmatched_count: unmatched.length,
        earnings_source: hasOfficialEarnings ? 'espn' : 'calculated',
        results: results
      })
    };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message, stack: err.stack }) };
  }
};
