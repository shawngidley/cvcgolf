// Netlify scheduled function — sync official final earnings to results table
// Runs Mon + Tue at 1 PM ET to catch ESPN payouts posted after Sunday finalization
// Only writes to results when ESPN returns actual dollar amounts (not calculated estimates)

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://iqahjyoytzhhkvwmujha.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

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

function getMastersPayoutForPosition(pos) { return MASTERS_2026_PAYOUTS[pos] || 0; }

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
    total += isMasters ? getMastersPayoutForPosition(position + i) : getPayoutForPosition(position + i, purse);
  }
  return Math.round(total / tiedCount);
}

const normalize = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();

function parseScoreToPar(scoreStr) {
  if (!scoreStr || scoreStr === 'E') return 0;
  const n = parseInt(scoreStr);
  return isNaN(n) ? 0 : n;
}

const NAME_CORRECTIONS = {
  'Matt McCarty': 'Matt McCarty', 'Denny McCarthy': 'Denny McCarthy',
  'Nico Echavarria': 'Nico Echavarria', 'K.H. Lee': null, 'Ryan Palmer': null, 'Gordon Sargent': null,
};
const DB_NAME_LOCKS = { 'denny mccarthy': 'denny mccarthy', 'matt mccarty': 'matt mccarty' };
const NAME_CORRECTIONS_NORM = {};
Object.entries(NAME_CORRECTIONS).forEach(([espn, db]) => {
  const key = normalize(espn);
  NAME_CORRECTIONS_NORM[key] = db ? normalize(db) : null;
});

function findEspnMatch(dbName, espnGolfers) {
  if (!dbName || !espnGolfers.length) return null;
  const dbNorm = normalize(dbName);
  const dbParts = dbNorm.split(' ');
  const dbFirst = dbParts[0];
  const dbLast = dbParts[dbParts.length - 1];

  if (dbNorm in DB_NAME_LOCKS) {
    const req = DB_NAME_LOCKS[dbNorm];
    const exact = espnGolfers.find(eg => normalize(eg.name) === req);
    return exact ? { ...exact, confidence: 1.0 } : null;
  }

  for (const eg of espnGolfers) {
    const en = normalize(eg.name);
    if (en in NAME_CORRECTIONS_NORM) {
      const corrected = NAME_CORRECTIONS_NORM[en];
      if (corrected === null) continue;
      if (corrected === dbNorm) return { ...eg, confidence: 1.0 };
      continue;
    }
  }

  let bestMatch = null, bestScore = 0;
  for (const eg of espnGolfers) {
    const en = normalize(eg.name);
    if (!en || en in NAME_CORRECTIONS_NORM) continue;
    if (dbNorm === en) return { ...eg, confidence: 1.0 };

    const ep = en.split(' ');
    const efirst = ep[0], elast = ep[ep.length - 1];
    const lastLev = levenshtein(dbLast, elast);
    const lastSim = 1 - (lastLev / Math.max(dbLast.length, elast.length));
    if (lastSim < 0.7 || dbFirst[0] !== efirst[0]) continue;

    const firstLev = levenshtein(dbFirst, efirst);
    const firstSim = 1 - (firstLev / Math.max(dbFirst.length, efirst.length));
    const isAbbrev = dbFirst.length <= 2 || efirst.length <= 2;
    if (!isAbbrev && firstSim < 0.7) continue;

    let score;
    if (dbFirst === efirst && dbLast === elast) score = 0.95;
    else if (dbFirst === efirst && lastSim >= 0.85) score = 0.9;
    else score = (firstSim * 0.4) + (lastSim * 0.6);

    if (score > bestScore) { bestScore = score; bestMatch = { ...eg, confidence: parseFloat(score.toFixed(2)) }; }
  }
  return bestMatch && bestScore >= 0.5 ? bestMatch : null;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

exports.handler = async () => {
  console.log('[sync-official-earnings] Starting...');

  try {
    // Find recently completed tournaments that may still need official earnings
    // Check the last 14 days so we catch any that auto-finalize missed
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);

    const { data: recentlyCompleted } = await supabase
      .from('tournaments')
      .select('*')
      .eq('is_complete', true)
      .gte('start_date', cutoff.toISOString().slice(0, 10))
      .order('start_date', { ascending: false });

    if (!recentlyCompleted || recentlyCompleted.length === 0) {
      console.log('[sync-official-earnings] No recently completed tournaments found.');
      return { statusCode: 200, body: JSON.stringify({ status: 'skipped', reason: 'No recent completed tournaments' }) };
    }

    const results = [];

    for (const tournament of recentlyCompleted) {
      console.log(`[sync-official-earnings] Checking "${tournament.name}"...`);

      // Check if this tournament already has official earnings in results table
      const { data: existingResults } = await supabase
        .from('results')
        .select('golfer_id, earnings')
        .eq('tournament_id', tournament.id);

      const hasOfficialEarnings = (existingResults || []).some(r => parseFloat(r.earnings || 0) > 0);

      if (hasOfficialEarnings) {
        console.log(`[sync-official-earnings] "${tournament.name}" already has official earnings. Skipping.`);
        results.push({ tournament: tournament.name, status: 'already_official' });
        continue;
      }

      // No official earnings yet — try ESPN
      const result = await syncTournamentEarnings(tournament);
      results.push({ tournament: tournament.name, ...result });
    }

    console.log('[sync-official-earnings] Done.', JSON.stringify(results));
    return { statusCode: 200, body: JSON.stringify({ status: 'complete', results }) };

  } catch (err) {
    console.error('[sync-official-earnings] Error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ status: 'error', error: err.message }) };
  }
};

async function syncTournamentEarnings(tournament) {
  const purse = (tournament.purse_millions || 20) * 1000000;
  const isMasters = tournament.is_major && tournament.short_name === 'Masters';

  // Get picked golfers for this tournament
  const { data: lineups } = await supabase
    .from('lineups')
    .select('golfer_id, golfers(id, name)')
    .eq('tournament_id', tournament.id);

  const pickedGolfers = {};
  if (lineups) lineups.forEach(l => { if (l.golfers) pickedGolfers[l.golfers.id] = { id: l.golfers.id, name: l.golfers.name }; });
  const pickedList = Object.values(pickedGolfers);

  if (pickedList.length === 0) return { status: 'skipped', reason: 'No lineups' };

  // Fetch ESPN scoreboard
  const dateStr = tournament.start_date.replace(/-/g, '');
  const scoreboardRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?dates=${dateStr}`);
  if (!scoreboardRes.ok) return { status: 'error', reason: 'ESPN fetch failed' };

  const scoreboardData = await scoreboardRes.json();
  const espnEvent = scoreboardData.events?.[0];
  if (!espnEvent) return { status: 'error', reason: 'No ESPN event found' };

  const eventId = espnEvent.id;
  let competitors = espnEvent.competitions?.[0]?.competitors || [];

  // Expand full field if scoreboard is truncated
  if (competitors.length < 30) {
    try {
      const coreRes = await fetch(`https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors?limit=100`);
      if (coreRes.ok) {
        const coreData = await coreRes.json();
        const fetches = (coreData.items || []).map(async (item) => {
          try {
            const ref = item.$ref || item.href;
            const idMatch = ref?.match(/competitors\/(\d+)/);
            const cId = idMatch?.[1];
            if (!cId) return null;
            const aRes = await fetch(`https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${cId}`);
            if (!aRes.ok) return null;
            const aData = await aRes.json();
            let athleteName = '';
            if (aData.athlete?.$ref) {
              const nameRes = await fetch(aData.athlete.$ref);
              if (nameRes.ok) { const nd = await nameRes.json(); athleteName = nd.displayName || nd.fullName || ''; }
            }
            return { id: cId, athlete: { displayName: athleteName } };
          } catch { return null; }
        });
        const full = (await Promise.all(fetches)).filter(Boolean);
        if (full.length > competitors.length) competitors = full;
      }
    } catch { /* fall back */ }
  }

  const espnGolfers = competitors.map(c => ({ espnId: c.id, name: c.athlete?.displayName || '' }));
  const matchedPicked = pickedList.map(pg => ({ ...pg, espnMatch: findEspnMatch(pg.name, espnGolfers) }));

  // Fetch status for all competitors (needed for tie calculation)
  const allIds = competitors.map(c => c.id);
  const statusMap = {};
  const batchSize = 25;
  for (let i = 0; i < allIds.length; i += batchSize) {
    await Promise.all(allIds.slice(i, i + batchSize).map(async (cId) => {
      try {
        const res = await fetch(`https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${cId}/status`);
        if (res.ok) statusMap[cId] = await res.json();
      } catch { /* ignore */ }
    }));
  }

  // Try to get actual ESPN earnings for picked golfers
  const espnEarningsMap = {};
  const pickedEspnIds = matchedPicked.filter(pg => pg.espnMatch).map(pg => pg.espnMatch.espnId);
  for (let i = 0; i < pickedEspnIds.length; i += batchSize) {
    await Promise.all(pickedEspnIds.slice(i, i + batchSize).map(async (cId) => {
      try {
        const res = await fetch(`https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${cId}/statistics?lang=en&region=us`);
        if (res.ok) {
          const sd = await res.json();
          const stats = sd.splits?.categories?.[0]?.stats || [];
          const stat = stats.find(s => s.name === 'amount' || s.name === 'officialAmount');
          if (stat && stat.value > 0) espnEarningsMap[cId] = stat.value;
        }
      } catch { /* ignore */ }
    }));
  }

  const hasEspnEarnings = Object.keys(espnEarningsMap).length > 0;

  if (!hasEspnEarnings) {
    console.log(`[sync-official-earnings] "${tournament.name}" — ESPN has no official earnings yet.`);
    return { status: 'pending', reason: 'ESPN earnings not available yet' };
  }

  console.log(`[sync-official-earnings] "${tournament.name}" — ESPN official earnings found! Saving...`);

  // Build position groups for tie calculation
  const positionGroups = {};
  allIds.forEach(cId => {
    const st = statusMap[cId];
    if (!st) return;
    const sn = st?.type?.name || '';
    if (sn === 'STATUS_CUT' || sn === 'STATUS_WITHDRAWN' || sn === 'STATUS_DISQUALIFIED') return;
    const posNum = parseInt((st?.position?.displayName || '').replace('T', ''));
    if (!isNaN(posNum)) {
      if (!positionGroups[posNum]) positionGroups[posNum] = [];
      positionGroups[posNum].push(cId);
    }
  });

  // Save official earnings to both golfer_earnings and results
  let savedCount = 0;
  for (const pg of matchedPicked) {
    const espnId = pg.espnMatch?.espnId;
    const st = espnId ? statusMap[espnId] : null;
    const sn = st?.type?.name || '';
    const isCut = sn === 'STATUS_CUT';
    const isWD = sn === 'STATUS_WITHDRAWN' || sn === 'STATUS_DISQUALIFIED';

    const posDisplay = st?.position?.displayName || '-';
    const position = isCut ? 'CUT' : isWD ? 'WD' : posDisplay;
    const posNum = parseInt((posDisplay || '').replace('T', ''));
    const positionNum = isNaN(posNum) ? 999 : posNum;
    const isTied = (posDisplay || '').startsWith('T');
    const tiedCount = isTied ? (positionGroups[positionNum]?.length || 1) : 1;

    const earnings = espnEarningsMap[espnId] || 0;
    const score = pg.espnMatch?.score || null;

    await supabase.from('golfer_earnings').upsert({
      golfer_id: pg.id,
      tournament_id: tournament.id,
      earnings,
      finish_position: position,
      score,
      updated_at: new Date().toISOString()
    }, { onConflict: 'golfer_id,tournament_id' });

    await supabase.from('results').upsert({
      tournament_id: tournament.id,
      golfer_id: pg.id,
      finish_position: position,
      score_to_par: parseScoreToPar(score),
      earnings,
      made_cut: !isCut
    }, { onConflict: 'tournament_id,golfer_id' });

    savedCount++;
  }

  // Recalculate weekly scores and standings
  const { data: players } = await supabase.from('players').select('id').neq('is_guest', true);
  const playerIds = (players || []).map(p => p.id);

  for (const playerId of playerIds) {
    const playerLineups = (lineups || []).filter(l => l.player_id === playerId);
    if (!playerLineups.length) continue;

    let totalEarnings = 0, totalSalary = 0, bestGolfer = '', bestEarnings = 0;
    for (const l of playerLineups) {
      const { data: ge } = await supabase.from('golfer_earnings').select('earnings').eq('golfer_id', l.golfer_id).eq('tournament_id', tournament.id).single();
      const e = parseFloat(ge?.earnings || 0);
      totalEarnings += e;
      if (e > bestEarnings) { bestEarnings = e; bestGolfer = l.golfers?.name || ''; }
      const { data: golfer } = await supabase.from('golfers').select('salary').eq('id', l.golfer_id).single();
      totalSalary += golfer?.salary || 0;
    }

    await supabase.from('weekly_scores').upsert({
      player_id: playerId,
      tournament_id: tournament.id,
      total_earnings: totalEarnings,
      total_salary: totalSalary,
      best_golfer: bestGolfer,
      best_golfer_earnings: bestEarnings
    }, { onConflict: 'player_id,tournament_id' });
  }

  // Recalculate season standings
  const { data: completedTs } = await supabase.from('tournaments').select('id').eq('is_complete', true);
  const completedIds = (completedTs || []).map(t => t.id);

  for (const playerId of playerIds) {
    const { data: weeklyScores } = await supabase.from('weekly_scores').select('total_earnings, tournament_id').eq('player_id', playerId).in('tournament_id', completedIds);
    const totals = (weeklyScores || []).map(ws => parseFloat(ws.total_earnings || 0));
    if (!totals.length) continue;

    const total = totals.reduce((a, b) => a + b, 0);
    let wins = 0;
    for (const tid of completedIds) {
      const { data: allScores } = await supabase.from('weekly_scores').select('player_id, total_earnings').eq('tournament_id', tid);
      if (allScores?.length) {
        const maxE = Math.max(...allScores.map(s => parseFloat(s.total_earnings || 0)));
        const mine = allScores.find(s => s.player_id === playerId);
        if (mine && parseFloat(mine.total_earnings || 0) === maxE && maxE > 0) wins++;
      }
    }

    await supabase.from('standings').upsert({
      player_id: playerId,
      total_earnings: total,
      weeks_played: totals.length,
      weekly_wins: wins,
      best_week: Math.max(...totals),
      worst_week: Math.min(...totals),
      avg_weekly: total / totals.length,
      updated_at: new Date().toISOString()
    }, { onConflict: 'player_id' });
  }

  return { status: 'synced', golfers_saved: savedCount };
}
