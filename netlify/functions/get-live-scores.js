// Netlify function - Get live tournament scores for CVC Fantasy Golf
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

// PGA payout structure by position (percentage of purse)
const PAYOUT_TABLE = [
  0.18,    // 1st
  0.108,   // 2nd
  0.068,   // 3rd
  0.048,   // 4th
  0.04,    // 5th
  0.036,   // 6th
  0.0335,  // 7th
  0.031,   // 8th
  0.0287,  // 9th
  0.0265,  // 10th
  0.0245,  // 11th
  0.0225,  // 12th
  0.0207,  // 13th
  0.019,   // 14th
  0.0177,  // 15th
  0.0165,  // 16th
  0.0155,  // 17th
  0.0145,  // 18th
  0.0135,  // 19th
  0.0125,  // 20th
  0.0117,  // 21st
  0.011,   // 22nd
  0.01035, // 23rd
  0.0097,  // 24th
  0.0091,  // 25th
  0.0085,  // 26th
  0.00795, // 27th
  0.0074,  // 28th
  0.0069,  // 29th
  0.0064,  // 30th
];
// 31-35: 0.005875 each, 36-40: 0.005025, 41-45: 0.004325, 46-50: 0.00375
const RANGE_PAYOUTS = [
  { start: 31, end: 35, pct: 0.005875 },
  { start: 36, end: 40, pct: 0.005025 },
  { start: 41, end: 45, pct: 0.004325 },
  { start: 46, end: 50, pct: 0.00375 },
];

function getPayoutForPosition(pos, purse) {
  if (pos >= 1 && pos <= 30) return Math.round(purse * PAYOUT_TABLE[pos - 1]);
  for (const r of RANGE_PAYOUTS) {
    if (pos >= r.start && pos <= r.end) return Math.round(purse * r.pct);
  }
  return 0;
}

function calculateTiedEarnings(position, tiedCount, purse) {
  let total = 0;
  for (let i = 0; i < tiedCount; i++) {
    total += getPayoutForPosition(position + i, purse);
  }
  return Math.round(total / tiedCount);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: '' };

  try {
    // Get current tournament
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('*')
      .eq('is_current', true)
      .single();

    if (!tournament) {
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: false, error: 'No current tournament' }) };
    }

    const purse = (tournament.purse_millions || 20) * 1000000;

    // Get all players and their lineups for this tournament
    const [playersRes, lineupsRes] = await Promise.all([
      supabase.from('players').select('id, name').neq('is_guest', true).order('name'),
      supabase.from('lineups').select('player_id, slot, golfer_id, golfers(id, name)').eq('tournament_id', tournament.id).order('slot')
    ]);

    const players = playersRes.data || [];
    const lineups = lineupsRes.data || [];

    // Build lineup map: player_id -> [{ golfer_id, name, slot }]
    const lineupMap = {};
    lineups.forEach(l => {
      if (!lineupMap[l.player_id]) lineupMap[l.player_id] = [];
      lineupMap[l.player_id].push({ golfer_id: l.golfer_id, name: l.golfers?.name || 'Unknown', slot: l.slot });
    });

    // Fetch ESPN scoreboard to find current event
    const scoreboardUrl = 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard';
    const scoreboardRes = await fetch(scoreboardUrl);

    if (!scoreboardRes.ok) {
      return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ success: false, error: 'Failed to fetch ESPN scoreboard' }) };
    }

    const data = await scoreboardRes.json();
    const espnEvent = data.events?.[0];

    if (!espnEvent) {
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: false, error: 'No ESPN event found' }) };
    }

    const eventId = espnEvent.id;
    const eventStatus = espnEvent.status?.type?.name || '';
    const isComplete = espnEvent.status?.type?.completed === true;
    const isInProgress = eventStatus === 'STATUS_IN_PROGRESS';

    const competition = espnEvent.competitions?.[0];
    const competitors = competition?.competitors || [];
    const roundDisplay = competition?.status?.type?.shortDetail || espnEvent.status?.type?.shortDetail || '';

    // Get unique golfer IDs we need to look up (only our picked golfers)
    const allPickedNames = new Set();
    Object.values(lineupMap).forEach(lineup => lineup.forEach(l => allPickedNames.add(l.name)));

    const normalize = (s) => s.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();

    // Match our golfers to ESPN competitors (basic info from scoreboard)
    function findEspnCompetitor(dbName) {
      const dbNorm = normalize(dbName);
      const dbParts = dbNorm.split(' ');
      const dbLast = dbParts[dbParts.length - 1];

      let match = competitors.find(c => normalize(c.athlete?.displayName || '') === dbNorm);
      if (match) return match;

      match = competitors.find(c => {
        const parts = normalize(c.athlete?.displayName || '').split(' ');
        return parts[parts.length - 1] === dbLast && parts[0]?.[0] === dbParts[0]?.[0];
      });
      return match || null;
    }

    // Fetch detailed status for each picked golfer's ESPN competitor
    const pickedCompetitorIds = new Set();
    const competitorMatchMap = {}; // dbName -> ESPN competitor
    allPickedNames.forEach(name => {
      const c = findEspnCompetitor(name);
      if (c) {
        competitorMatchMap[name] = c;
        pickedCompetitorIds.add(c.id);
      }
    });

    // Batch fetch status for all picked competitors from core API
    const statusMap = {};
    const statusFetches = [...pickedCompetitorIds].map(async (cId) => {
      try {
        const url = `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${cId}/status`;
        const res = await fetch(url);
        if (res.ok) {
          statusMap[cId] = await res.json();
        }
      } catch (e) { /* ignore individual failures */ }
    });
    await Promise.all(statusFetches);

    // Build ESPN golfer data combining scoreboard + status
    const espnGolfers = competitors.map(c => {
      const st = statusMap[c.id];
      const statusName = st?.type?.name || '';
      const isCut = statusName === 'STATUS_CUT';
      const isWD = statusName === 'STATUS_WITHDRAWN' || statusName === 'STATUS_DISQUALIFIED';
      const position = isCut ? 'CUT' : isWD ? 'WD' : (st?.position?.displayName || '-');
      const scoreToPar = c.score || '-';
      const thru = st?.thru != null ? `${st.thru}` : (st?.type?.shortDetail || '-');

      // Today's score from linescores (last round)
      const linescores = c.linescores || [];
      const today = linescores.length > 0 ? (linescores[linescores.length - 1]?.displayValue || '-') : '-';

      return {
        espnId: c.id,
        name: c.athlete?.displayName || '',
        position,
        positionNum: parseInt(String(position).replace('T', '')) || 999,
        scoreToPar,
        today,
        thru,
        isCut,
        isWD
      };
    });

    // Group by position to calculate tied earnings
    const positionGroups = {};
    espnGolfers.filter(g => !g.isCut && !g.isWD).forEach(g => {
      const pos = g.positionNum;
      if (!positionGroups[pos]) positionGroups[pos] = [];
      positionGroups[pos].push(g.espnId);
    });

    // Calculate earnings for each ESPN golfer
    const earningsMap = {};
    espnGolfers.forEach(g => {
      if (g.isCut || g.isWD || g.positionNum > 50) {
        earningsMap[g.espnId] = 0;
      } else {
        const tiedCount = positionGroups[g.positionNum]?.length || 1;
        earningsMap[g.espnId] = calculateTiedEarnings(g.positionNum, tiedCount, purse);
      }
    });

    // Match our golfers to ESPN golfers using pre-built map
    function matchGolfer(dbName) {
      const c = competitorMatchMap[dbName];
      if (!c) return null;
      return espnGolfers.find(g => g.espnId === c.id) || null;
    }

    // Build owner standings
    const ownerStandings = players.map(p => {
      const lineup = lineupMap[p.id] || [];
      const golfers = lineup.map(l => {
        const espnMatch = matchGolfer(l.name);
        const earnings = espnMatch ? (earningsMap[espnMatch.espnId] || 0) : 0;
        return {
          slot: l.slot,
          name: l.name,
          position: espnMatch?.position || '-',
          scoreToPar: espnMatch?.scoreToPar || '-',
          today: espnMatch?.today || '-',
          thru: espnMatch?.thru || '-',
          isCut: espnMatch?.isCut || false,
          isWD: espnMatch?.isWD || false,
          earnings
        };
      });

      const liveTotal = golfers.reduce((sum, g) => sum + g.earnings, 0);

      return {
        player_id: p.id,
        name: p.name,
        golfers,
        liveTotal,
        hasLineup: lineup.length > 0
      };
    });

    // Sort by live total descending
    ownerStandings.sort((a, b) => b.liveTotal - a.liveTotal);

    // Assign ranks
    ownerStandings.forEach((o, i) => { o.rank = i + 1; });

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        success: true,
        tournament: {
          id: tournament.id,
          name: tournament.name,
          short_name: tournament.short_name,
          week_number: tournament.week_number,
          purse_millions: tournament.purse_millions,
          is_major: tournament.is_major
        },
        espn_event: espnEvent.name,
        round_display: roundDisplay,
        is_complete: isComplete,
        is_in_progress: isInProgress,
        updated_at: new Date().toISOString(),
        standings: ownerStandings
      })
    };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
