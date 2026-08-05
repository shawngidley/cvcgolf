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

// Weeks 22-27 are the playoffs. Kept in sync with the same names in
// js/supabase-client.js - duplicated here since this Node function can't
// share a browser <script>.
const PLAYOFF_WEEK_START = 22;
const PLAYOFF_QUALIFIER_NAMES = ['Steve Walker', 'David Sotka', 'Dave Sutton', 'Scott Nelson', 'Joe Cas', 'Shawn Gidley'];

// Determines who is still contesting the playoffs for a given tournament
// week: all 6 qualifiers during the semifinal (22-24), the top 3 semifinal
// finishers during the Week 25 elimination round, and the 2 elimination-round
// survivors during the championship (26-27). Mirrors the bracket math in
// playoffs.js. Returns a Set of player_ids, or null outside the playoffs.
async function computePlayoffField(weekNumber) {
  if (weekNumber < PLAYOFF_WEEK_START) return null;

  const { data: players } = await supabase.from('players').select('id, name').neq('is_guest', true);
  const qualifiers = (players || []).filter(p => PLAYOFF_QUALIFIER_NAMES.includes(p.name));
  const qualifierIds = new Set(qualifiers.map(p => p.id));

  if (weekNumber <= 24) return qualifierIds;

  const SEMIFINAL_WEEKS = [22, 23, 24];
  const REG_SEASON_BONUS_CAP = 400000;

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, week_number, is_complete, picks_locked, first_tee_time')
    .order('week_number');
  const now = new Date();
  const started = t => t.is_complete || t.picks_locked || (t.first_tee_time && new Date(t.first_tee_time) <= now);

  const regSeasonT = (tournaments || []).filter(t => t.week_number <= 21);
  const regStartedT = regSeasonT.filter(started);
  const semiT = (tournaments || []).filter(t => SEMIFINAL_WEEKS.includes(t.week_number));
  const week25T = (tournaments || []).find(t => t.week_number === 25);

  const relevantIds = [...regStartedT, ...semiT, ...(week25T ? [week25T] : [])].map(t => t.id);

  let scores = [];
  for (let from = 0; ; from += 1000) {
    const { data: batch } = await supabase
      .from('weekly_scores')
      .select('player_id, tournament_id, total_earnings')
      .in('tournament_id', relevantIds)
      .range(from, from + 999);
    if (!batch || batch.length === 0) break;
    scores = scores.concat(batch);
    if (batch.length < 1000) break;
  }
  const scoreMap = {};
  scores.forEach(s => { scoreMap[`${s.player_id}-${s.tournament_id}`] = parseFloat(s.total_earnings || 0); });

  const { data: playoffResults } = await supabase.from('playoff_results').select('player_id, round, tiebreaker_earnings');
  const tiebreakerMap = {};
  (playoffResults || []).forEach(r => { tiebreakerMap[`${r.player_id}-${r.round}`] = parseFloat(r.tiebreaker_earnings || 0); });
  const tiebreakerFor = (playerId, rounds) => rounds.reduce((sum, round) => sum + (tiebreakerMap[`${playerId}-${round}`] || 0), 0);

  const regStandings = (players || []).map(p => {
    const total = regStartedT.reduce((sum, t) => sum + (scoreMap[`${p.id}-${t.id}`] || 0), 0);
    return { player_id: p.id, total };
  }).sort((a, b) => b.total - a.total);

  const seed1Id = regStandings[0]?.player_id;
  const seed1Bonus = Math.max(0, Math.min(REG_SEASON_BONUS_CAP, (regStandings[0]?.total || 0) - (regStandings[1]?.total || 0)));

  const semiComplete = semiT.length === SEMIFINAL_WEEKS.length && semiT.every(t => t.is_complete);

  const semiResults = qualifiers.map(sf => {
    const weekTotals = semiT.map(t => started(t) ? (scoreMap[`${sf.id}-${t.id}`] || 0) : null);
    const isSeed1 = sf.id === seed1Id && seed1Bonus > 0;
    if (isSeed1) weekTotals[0] = (weekTotals[0] || 0) + seed1Bonus;
    const total = weekTotals.reduce((sum, v) => sum + (v || 0), 0);
    return { player_id: sf.id, total, tiebreaker: tiebreakerFor(sf.id, ['semifinal']) };
  });
  semiResults.sort((a, b) => (b.total - a.total) || (b.tiebreaker - a.tiebreaker));

  // Semifinal not finished yet - can't know the top 3, fall back to all 6.
  if (!semiComplete) return qualifierIds;

  const finalistIds = new Set(semiResults.slice(0, 3).map(r => r.player_id));

  if (weekNumber === 25) return finalistIds;

  // Week 25 not finished yet - can't know the 2 survivors, fall back to the 3 finalists.
  if (!week25T || !week25T.is_complete) return finalistIds;

  const elimResults = [...finalistIds].map(pid => ({
    player_id: pid,
    wk1: scoreMap[`${pid}-${week25T.id}`] || 0,
    tiebreaker: tiebreakerFor(pid, ['finals_w1'])
  }));
  elimResults.sort((a, b) => (b.wk1 - a.wk1) || (b.tiebreaker - a.tiebreaker));

  return new Set(elimResults.slice(0, 2).map(r => r.player_id));
}

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
// 51-55: 0.00335, 56-60: 0.00305, 61-65: 0.00285, 65+: 0.0027
const RANGE_PAYOUTS = [
  { start: 31, end: 35, pct: 0.005875 },
  { start: 36, end: 40, pct: 0.005025 },
  { start: 41, end: 45, pct: 0.004325 },
  { start: 46, end: 50, pct: 0.00375 },
  { start: 51, end: 55, pct: 0.00335 },
  { start: 56, end: 60, pct: 0.00305 },
  { start: 61, end: 65, pct: 0.00285 },
];
const MIN_PAYOUT_PCT = 0.0027; // 65+ (all who make the cut)

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

  try {
    // Get current tournament
    const { data: tournamentRows } = await supabase
      .from('tournaments')
      .select('*')
      .eq('is_current', true)
      .limit(1);
    const tournament = tournamentRows?.[0] || null;

    if (!tournament) {
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: false, error: 'No current tournament' }) };
    }

    const purse = (tournament.purse_millions || 20) * 1000000;

    // Check lock status — don't expose lineups before tournament starts
    let lockDate;
    if (tournament.first_tee_time) {
      lockDate = new Date(tournament.first_tee_time);
    } else {
      lockDate = new Date(tournament.start_date + 'T00:00:00');
    }
    const isLocked = tournament.picks_locked || tournament.is_complete || new Date() >= lockDate;

    if (!isLocked) {
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({
          success: false,
          reason: 'pre_lock',
          lock_time: lockDate.toISOString(),
          tournament: { name: tournament.name, week_number: tournament.week_number }
        })
      };
    }

    // Get all players and their lineups for this tournament
    const [playersRes, lineupsRes] = await Promise.all([
      supabase.from('players').select('id, name').neq('is_guest', true).order('name'),
      supabase.from('lineups').select('player_id, slot, golfer_id, golfers(id, name)').eq('tournament_id', tournament.id).order('slot')
    ]);

    // During playoff weeks (22-27), only show the players still contesting
    // the bracket at this stage - not the full 14-owner league.
    const playoffFieldIds = await computePlayoffField(tournament.week_number || 0);
    let players = playersRes.data || [];
    if (playoffFieldIds) players = players.filter(p => playoffFieldIds.has(p.id));

    const lineups = lineupsRes.data || [];

    // Build lineup map: player_id -> [{ golfer_id, name, slot }]
    const lineupMap = {};
    lineups.forEach(l => {
      if (!lineupMap[l.player_id]) lineupMap[l.player_id] = [];
      lineupMap[l.player_id].push({ golfer_id: l.golfer_id, name: l.golfers?.name || 'Unknown', slot: l.slot });
    });

    console.log(`[get-live-scores] Target tournament: "${tournament.name}" (short: "${tournament.short_name}"), start_date: ${tournament.start_date}`);

    const normalizeEvt = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const shortNorm = normalizeEvt(tournament.short_name);
    const fullNorm = normalizeEvt(tournament.name);
    const matchesTournament = (e) => {
      const en = normalizeEvt(e.name);
      const es = normalizeEvt(e.shortName || '');
      return en.includes(shortNorm) || es.includes(shortNorm) || shortNorm.includes(en) || en.includes(fullNorm);
    };

    // Tier 1: match the current tournament by date against the ESPN scoreboard
    let espnEvent = null;
    let allEvents = [];
    if (tournament.start_date) {
      const dateStr = tournament.start_date.replace(/-/g, '');
      const dateUrl = `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?dates=${dateStr}`;
      console.log(`[get-live-scores] Tier 1 (date match): GET ${dateUrl}`);
      const dateRes = await fetch(dateUrl);
      if (dateRes.ok) {
        const dateData = await dateRes.json();
        allEvents = dateData.events || [];
        console.log(`[get-live-scores] Tier 1 returned ${allEvents.length} event(s): ${allEvents.map(e => e.name).join(', ')}`);
        espnEvent = allEvents.find(matchesTournament) || allEvents[0] || null;
      } else {
        console.log(`[get-live-scores] Tier 1 request failed with status ${dateRes.status}`);
      }
    }

    // Tier 2: fall back to searching the full ESPN schedule by tournament name
    if (!espnEvent) {
      const scoreboardUrl = 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard';
      console.log(`[get-live-scores] Tier 2 (name search "${tournament.short_name}"): GET ${scoreboardUrl}`);
      const scoreboardRes = await fetch(scoreboardUrl);

      if (!scoreboardRes.ok) {
        return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ success: false, error: 'Failed to fetch ESPN scoreboard' }) };
      }

      const data = await scoreboardRes.json();
      allEvents = data.events || [];
      console.log(`[get-live-scores] Tier 2 returned ${allEvents.length} event(s): ${allEvents.map(e => e.name).join(', ')}`);
      espnEvent = allEvents.find(matchesTournament) || allEvents[0] || null;
    }

    if (!espnEvent) {
      console.log('[get-live-scores] No ESPN event found via date or name match');
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: false, error: 'No ESPN event found', available_events: allEvents.map(e => e.name) }) };
    }

    console.log(`[get-live-scores] Matched ESPN event: "${espnEvent.name}" (id: ${espnEvent.id})`);

    const eventId = espnEvent.id;
    const eventStatus = espnEvent.status?.type?.name || '';
    const isComplete = espnEvent.status?.type?.completed === true;
    const isInProgress = eventStatus === 'STATUS_IN_PROGRESS';

    const competition = espnEvent.competitions?.[0];
    const competitors = competition?.competitors || [];
    const roundDisplay = competition?.status?.type?.shortDetail || espnEvent.status?.type?.shortDetail || '';
    // ESPN doesn't expose period on competition.status, so parse from the display string
    const roundMatch = roundDisplay.match(/Round\s+(\d+)/i);
    const currentRound = roundMatch ? parseInt(roundMatch[1]) : 0;

    // Get unique golfer IDs we need to look up (only our picked golfers)
    const allPickedNames = new Set();
    Object.values(lineupMap).forEach(lineup => lineup.forEach(l => allPickedNames.add(l.name)));

    const normalize = (s) => s.replace(/[\u00f8\u00d8]/g, 'o').replace(/[\u00e6\u00c6]/g, 'ae').replace(/[\u00e5\u00c5]/g, 'a').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();

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

    // Use ESPN's scoreboard status to identify CUT/WD for the full field
    const cutWdIds = new Set();
    competitors.forEach(c => {
      const sn = c.status?.type?.name || '';
      if (sn === 'STATUS_CUT' || sn === 'STATUS_WITHDRAWN' || sn === 'STATUS_DISQUALIFIED') {
        cutWdIds.add(c.id);
      }
    });

    // Group active competitors by score string — same score = tied
    // CUT/WD correctly excluded via scoreboard status above
    const sortedCompetitors = [...competitors].sort((a, b) => (a.order || 999) - (b.order || 999));
    const scoreGroups = {};
    sortedCompetitors.forEach(c => {
      if (cutWdIds.has(c.id)) return;
      const score = c.score || 'X';
      if (!scoreGroups[score]) scoreGroups[score] = [];
      scoreGroups[score].push(c.id);
    });

    // Assign positions in leaderboard order, grouped score = tied
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
      ids.forEach(id => {
        positionMap[id] = {
          position: tiedCount > 1 ? `T${currentPos}` : `${currentPos}`,
          positionNum: currentPos,
          tiedCount
        };
      });
      currentPos += tiedCount;
    });

    // Active competitors sorted by ESPN order — used for accurate tie count at a given position
    const activeByOrder = sortedCompetitors
      .filter(c => !cutWdIds.has(c.id) && c.order != null)
      .sort((a, b) => a.order - b.order);

    // Count consecutive same-score competitors starting at a given order position
    function tieCountAtPosition(posNum, score) {
      const start = activeByOrder.findIndex(c => c.order === posNum);
      if (start === -1) return 1;
      let count = 0;
      for (let i = start; i < activeByOrder.length; i++) {
        if (activeByOrder[i].score === score) count++;
        else break;
      }
      return Math.max(1, count);
    }

    // Build ESPN golfer data combining scoreboard + status API detail
    const espnGolfers = competitors.map(c => {
      const st = statusMap[c.id];
      // Core API status takes precedence for picked golfers; fall back to scoreboard status
      const statusName = st?.type?.name || c.status?.type?.name || '';
      const isCut = statusName === 'STATUS_CUT';
      const isWD = statusName === 'STATUS_WITHDRAWN' || statusName === 'STATUS_DISQUALIFIED';

      const posInfo = positionMap[c.id];

      // For picked golfers, use status API position (authoritative — avoids mid-round false ties)
      const apiPos = st?.position?.displayName;
      const apiPosNum = apiPos ? parseInt(apiPos.replace(/\D/g, '')) : null;

      const position = isCut ? 'CUT' : isWD ? 'WD' : (apiPos || posInfo?.position || '-');
      const positionNum = isCut || isWD ? 999 : (apiPosNum || posInfo?.positionNum || 999);
      // Derive tie count from adjacent same-score competitors at the authoritative position
      const tiedCount = (apiPosNum && !isCut && !isWD)
        ? tieCountAtPosition(apiPosNum, c.score)
        : (posInfo?.tiedCount || 1);

      const scoreToPar = c.score || '-';
      const thruRaw = st?.thru;
      const thru = (thruRaw != null && thruRaw > 0) ? `${thruRaw}` : '-';

      // Extract tee time from status API response
      let teeTime = '-';
      const rawTeeTime = st?.teeTime || st?.displayValue || '';
      if (rawTeeTime) {
        try {
          const d = new Date(rawTeeTime);
          if (!isNaN(d.getTime())) {
            teeTime = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' });
          }
        } catch (e) { /* ignore */ }
      }

      const linescores = c.linescores || [];
      // ESPN pads linescores with empty placeholder entries for future rounds — index by current round
      let todayLinescore;
      if (currentRound > 0) {
        todayLinescore = linescores[currentRound - 1];
      } else {
        for (let i = linescores.length - 1; i >= 0; i--) {
          if (linescores[i]?.linescores?.length > 0 || linescores[i]?.value > 0) {
            todayLinescore = linescores[i];
            break;
          }
        }
      }
      const today = todayLinescore?.displayValue || '-';
      // Suppress (today) parenthetical in Round 1 — total equals round score, showing both is redundant
      const todayDisplay = currentRound > 1 ? today : '-';

      return {
        espnId: c.id,
        name: c.athlete?.displayName || '',
        position,
        positionNum,
        tiedCount,
        scoreToPar,
        today: todayDisplay,
        thru,
        teeTime,
        isCut,
        isWD
      };
    });

    // Calculate earnings for each ESPN golfer using full-field tie counts
    const isMasters = tournament.is_major && tournament.short_name === 'Masters';
    const earningsMap = {};
    espnGolfers.forEach(g => {
      if (g.isWD || g.isCut) {
        earningsMap[g.espnId] = 0;
      } else {
        earningsMap[g.espnId] = calculateTiedEarnings(g.positionNum, g.tiedCount, purse, isMasters);
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
          teeTime: espnMatch?.teeTime || '-',
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
