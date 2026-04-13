// Netlify scheduled function - Auto-finalize tournament after completion
// Runs every 30 min from 6 PM - midnight ET on Sundays
// Checks if current tournament is complete on ESPN, then pulls earnings and updates standings

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://iqahjyoytzhhkvwmujha.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

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

const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();

exports.handler = async (event) => {
  console.log('[auto-finalize] Starting check...');

  try {
    // Step 1: Get the current tournament
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('*')
      .eq('is_current', true)
      .single();

    if (!tournament) {
      console.log('[auto-finalize] No current tournament found. Skipping.');
      return { statusCode: 200, body: JSON.stringify({ status: 'skipped', reason: 'No current tournament' }) };
    }

    if (tournament.is_complete) {
      console.log(`[auto-finalize] Tournament "${tournament.name}" already complete. Skipping.`);
      return { statusCode: 200, body: JSON.stringify({ status: 'skipped', reason: 'Already complete' }) };
    }

    console.log(`[auto-finalize] Checking if "${tournament.name}" is complete on ESPN...`);

    const purse = (tournament.purse_millions || 20) * 1000000;
    const isMasters = tournament.is_major && tournament.short_name === 'Masters';

    // Step 2: Check ESPN scoreboard for completion
    const dateStr = tournament.start_date.replace(/-/g, '');
    const scoreboardUrl = `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?dates=${dateStr}`;
    const scoreboardRes = await fetch(scoreboardUrl);

    if (!scoreboardRes.ok) {
      console.log('[auto-finalize] Failed to fetch ESPN scoreboard.');
      return { statusCode: 200, body: JSON.stringify({ status: 'error', reason: 'ESPN fetch failed' }) };
    }

    const scoreboardData = await scoreboardRes.json();
    const espnEvent = scoreboardData.events?.[0];

    if (!espnEvent) {
      console.log('[auto-finalize] No ESPN event found.');
      return { statusCode: 200, body: JSON.stringify({ status: 'error', reason: 'No ESPN event' }) };
    }

    const eventId = espnEvent.id;
    const isComplete = espnEvent.status?.type?.completed === true;

    if (!isComplete) {
      console.log(`[auto-finalize] "${tournament.name}" not yet complete on ESPN. Will check again.`);
      return { statusCode: 200, body: JSON.stringify({ status: 'waiting', reason: 'Tournament not complete yet' }) };
    }

    console.log(`[auto-finalize] "${tournament.name}" is COMPLETE! Pulling earnings...`);

    // Step 3: Get picked golfers
    const { data: lineups } = await supabase
      .from('lineups')
      .select('golfer_id, golfers(id, name)')
      .eq('tournament_id', tournament.id);

    const pickedGolfers = {};
    if (lineups) {
      lineups.forEach(l => {
        if (l.golfers) pickedGolfers[l.golfers.id] = { id: l.golfers.id, name: l.golfers.name };
      });
    }
    const pickedList = Object.values(pickedGolfers);

    if (pickedList.length === 0) {
      console.log('[auto-finalize] No picked golfers found.');
      return { statusCode: 200, body: JSON.stringify({ status: 'error', reason: 'No lineups' }) };
    }

    // Step 4: Get competitor list — full field from core API if scoreboard is truncated
    let competitors = espnEvent.competitions?.[0]?.competitors || [];

    if (competitors.length < 30) {
      console.log(`[auto-finalize] Scoreboard has only ${competitors.length} competitors, fetching full field...`);
      try {
        const coreUrl = `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors?limit=100`;
        const coreRes = await fetch(coreUrl);
        if (coreRes.ok) {
          const coreData = await coreRes.json();
          const coreRefs = coreData.items || [];
          const detailFetches = coreRefs.map(async (item) => {
            try {
              const ref = item.$ref || item.href;
              if (!ref) return null;
              const idMatch = ref.match(/competitors\/(\d+)/);
              const cId = idMatch ? idMatch[1] : null;
              if (!cId) return null;
              const athleteUrl = `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${cId}`;
              const aRes = await fetch(athleteUrl);
              if (!aRes.ok) return null;
              const aData = await aRes.json();
              let athleteName = '';
              if (aData.athlete && aData.athlete.$ref) {
                try {
                  const nameRes = await fetch(aData.athlete.$ref);
                  if (nameRes.ok) {
                    const nameData = await nameRes.json();
                    athleteName = nameData.displayName || nameData.fullName || '';
                  }
                } catch (e) { /* ignore */ }
              }
              let score = '';
              if (aData.score && aData.score.$ref) {
                try {
                  const scoreRes = await fetch(aData.score.$ref);
                  if (scoreRes.ok) {
                    const scoreData = await scoreRes.json();
                    score = scoreData.displayValue || '';
                  }
                } catch (e) { /* ignore */ }
              }
              return { id: cId, athlete: { displayName: athleteName }, score };
            } catch (e) { return null; }
          });
          const fullCompetitors = (await Promise.all(detailFetches)).filter(Boolean);
          if (fullCompetitors.length > competitors.length) {
            competitors = fullCompetitors;
          }
        }
      } catch (e) { /* fall back to scoreboard */ }
    }

    console.log(`[auto-finalize] Found ${competitors.length} competitors.`);

    const espnGolfers = competitors.map(c => ({
      espnId: c.id,
      name: c.athlete?.displayName || '',
      score: c.score || ''
    }));

    // Step 5: Match picked golfers to ESPN
    const matchedPicked = pickedList.map(pg => {
      const espnMatch = findEspnMatch(pg.name, espnGolfers);
      return { ...pg, espnMatch };
    });

    const unmatchedCount = matchedPicked.filter(pg => !pg.espnMatch).length;
    if (unmatchedCount > 0) {
      console.log(`[auto-finalize] WARNING: ${unmatchedCount} golfer(s) could not be matched.`);
    }

    // Step 6: Fetch status for all competitors
    const allCompetitorIds = competitors.map(c => c.id);
    const statusMap = {};
    const batchSize = 25;

    for (let i = 0; i < allCompetitorIds.length; i += batchSize) {
      const batch = allCompetitorIds.slice(i, i + batchSize);
      await Promise.all(batch.map(async (cId) => {
        try {
          const url = `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${cId}/status`;
          const res = await fetch(url);
          if (res.ok) statusMap[cId] = await res.json();
        } catch (e) { /* ignore */ }
      }));
    }

    // Step 7: Try ESPN actual earnings
    const espnEarningsMap = {};
    const pickedEspnIds = matchedPicked.filter(pg => pg.espnMatch).map(pg => pg.espnMatch.espnId);

    for (let i = 0; i < pickedEspnIds.length; i += batchSize) {
      const batch = pickedEspnIds.slice(i, i + batchSize);
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

    const hasEspnEarnings = Object.keys(espnEarningsMap).length > 0;
    const earningsSource = hasEspnEarnings ? 'espn' : 'calculated';
    console.log(`[auto-finalize] Earnings source: ${earningsSource}`);

    // Step 8: Build position groups for tie calculation
    const positionGroups = {};
    allCompetitorIds.forEach(cId => {
      const st = statusMap[cId];
      if (!st) return;
      const statusName = st?.type?.name || '';
      if (statusName === 'STATUS_CUT' || statusName === 'STATUS_WITHDRAWN' || statusName === 'STATUS_DISQUALIFIED') return;
      const posDisplay = st?.position?.displayName || '';
      const posNum = parseInt(posDisplay.replace('T', ''));
      if (!isNaN(posNum)) {
        if (!positionGroups[posNum]) positionGroups[posNum] = [];
        positionGroups[posNum].push(cId);
      }
    });

    // Step 9: Calculate earnings and save
    let savedCount = 0;
    const players = await supabase.from('players').select('id').neq('is_guest', true);
    const playerIds = (players.data || []).map(p => p.id);

    for (const pg of matchedPicked) {
      const espnId = pg.espnMatch?.espnId;
      const st = espnId ? statusMap[espnId] : null;
      const statusName = st?.type?.name || '';
      const isCut = statusName === 'STATUS_CUT';
      const isWD = statusName === 'STATUS_WITHDRAWN' || statusName === 'STATUS_DISQUALIFIED';

      const posDisplay = st?.position?.displayName || '-';
      const position = isCut ? 'CUT' : isWD ? 'WD' : posDisplay;
      const posNum = parseInt((posDisplay || '').replace('T', ''));
      const positionNum = isNaN(posNum) ? 999 : posNum;
      const isTied = (posDisplay || '').startsWith('T');
      const tiedCount = isTied ? (positionGroups[positionNum]?.length || 1) : 1;

      let earnings = 0;
      if (hasEspnEarnings) {
        earnings = espnEarningsMap[espnId] || 0;
      } else if (!isCut && !isWD && positionNum < 999) {
        earnings = calculateTiedEarnings(positionNum, tiedCount, purse, isMasters);
      }

      // Save to golfer_earnings
      await supabase.from('golfer_earnings').upsert({
        golfer_id: pg.id,
        tournament_id: tournament.id,
        earnings: earnings,
        finish_position: position,
        score: pg.espnMatch?.score || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'golfer_id,tournament_id' });

      // Save to results table
      const scoreToPar = pg.espnMatch?.score ? parseScoreToPar(pg.espnMatch.score) : 0;
      await supabase.from('results').upsert({
        tournament_id: tournament.id,
        golfer_id: pg.id,
        finish_position: position,
        score_to_par: scoreToPar,
        earnings: earnings,
        made_cut: !isCut
      }, { onConflict: 'tournament_id,golfer_id' });

      savedCount++;
    }

    console.log(`[auto-finalize] Saved earnings for ${savedCount} golfers.`);

    // Step 10: Recalculate weekly scores
    for (const playerId of playerIds) {
      const playerLineups = (lineups || []).filter(l => l.player_id === playerId);
      let totalEarnings = 0;
      let bestGolfer = '';
      let bestGolferEarnings = 0;
      let totalSalary = 0;

      for (const l of playerLineups) {
        const { data: ge } = await supabase
          .from('golfer_earnings')
          .select('earnings')
          .eq('golfer_id', l.golfer_id)
          .eq('tournament_id', tournament.id)
          .single();

        const e = parseFloat(ge?.earnings || 0);
        totalEarnings += e;

        if (e > bestGolferEarnings) {
          bestGolferEarnings = e;
          bestGolfer = l.golfers?.name || '';
        }

        const { data: golfer } = await supabase
          .from('golfers')
          .select('salary')
          .eq('id', l.golfer_id)
          .single();
        totalSalary += golfer?.salary || 0;
      }

      await supabase.from('weekly_scores').upsert({
        player_id: playerId,
        tournament_id: tournament.id,
        total_earnings: totalEarnings,
        total_salary: totalSalary,
        best_golfer: bestGolfer,
        best_golfer_earnings: bestGolferEarnings
      }, { onConflict: 'player_id,tournament_id' });
    }

    // Step 11: Recalculate season standings
    const { data: completedTournaments } = await supabase
      .from('tournaments')
      .select('id')
      .eq('is_complete', true);
    const completedIds = (completedTournaments || []).map(t => t.id);
    // Include the current tournament we're about to mark complete
    if (!completedIds.includes(tournament.id)) completedIds.push(tournament.id);

    for (const playerId of playerIds) {
      const { data: weeklyScores } = await supabase
        .from('weekly_scores')
        .select('total_earnings')
        .eq('player_id', playerId)
        .in('tournament_id', completedIds);

      const weekTotals = (weeklyScores || []).map(ws => parseFloat(ws.total_earnings || 0));
      const total = weekTotals.reduce((a, b) => a + b, 0);
      const best = weekTotals.length > 0 ? Math.max(...weekTotals) : 0;
      const worst = weekTotals.length > 0 ? Math.min(...weekTotals) : 0;
      const avg = weekTotals.length > 0 ? total / weekTotals.length : 0;

      // Count weekly wins
      let wins = 0;
      for (const tid of completedIds) {
        const { data: allScores } = await supabase
          .from('weekly_scores')
          .select('player_id, total_earnings')
          .eq('tournament_id', tid);

        if (allScores && allScores.length > 0) {
          const maxE = Math.max(...allScores.map(s => parseFloat(s.total_earnings || 0)));
          const playerScore = allScores.find(s => s.player_id === playerId);
          if (playerScore && parseFloat(playerScore.total_earnings || 0) === maxE && maxE > 0) {
            wins++;
          }
        }
      }

      await supabase.from('standings').upsert({
        player_id: playerId,
        total_earnings: total,
        weeks_played: weekTotals.length,
        weekly_wins: wins,
        best_week: best,
        worst_week: worst,
        avg_weekly: avg,
        updated_at: new Date().toISOString()
      }, { onConflict: 'player_id' });
    }

    // Step 12: Mark tournament complete, set next week as current
    await supabase.from('tournaments').update({
      is_complete: true,
      is_current: false
    }).eq('id', tournament.id);

    // Set next tournament as current
    const nextWeek = tournament.week_number + 1;
    const { data: nextTournament } = await supabase
      .from('tournaments')
      .select('id, name')
      .eq('week_number', nextWeek)
      .single();

    if (nextTournament) {
      await supabase.from('tournaments').update({ is_current: true }).eq('id', nextTournament.id);
      console.log(`[auto-finalize] Set "${nextTournament.name}" (Week ${nextWeek}) as current.`);
    }

    console.log(`[auto-finalize] DONE! "${tournament.name}" finalized. Earnings source: ${earningsSource}.`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'finalized',
        tournament: tournament.name,
        earnings_source: earningsSource,
        golfers_saved: savedCount,
        next_tournament: nextTournament?.name || 'None'
      })
    };
  } catch (err) {
    console.error('[auto-finalize] Error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ status: 'error', error: err.message }) };
  }
};

function parseScoreToPar(scoreStr) {
  if (!scoreStr || scoreStr === 'E') return 0;
  const n = parseInt(scoreStr);
  return isNaN(n) ? 0 : n;
}

// Name matching (same logic as scrape-pga-earnings)
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
      if (correctedDb === dbNorm) return { ...eg, confidence: 1.0 };
      continue;
    }
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const eg of espnGolfers) {
    const espnNorm = normalize(eg.name);
    if (!espnNorm) continue;
    if (espnNorm in NAME_CORRECTIONS_NORM) continue;
    if (dbNorm === espnNorm) return { ...eg, confidence: 1.0 };

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
    if (dbFirst === espnFirst && dbLast === espnLast) score = 0.95;
    else if (dbFirst === espnFirst && lastSimilarity >= 0.85) score = 0.9;
    else score = (firstSimilarity * 0.4) + (lastSimilarity * 0.6);

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
