// Netlify scheduled function - Auto-finalize tournament after completion
// Runs every 30 min from 6 PM - midnight ET on Sundays
// Checks if current tournament is complete via the Live Golf Data API, then pulls earnings and updates standings

const { createClient } = require('@supabase/supabase-js');
const { getSchedule, getLeaderboard, getEarnings, findScheduleEntry, buildPlayersFromLeaderboard, findGolferMatch } = require('./lib/rapidapi-golf');

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

function parseScoreToPar(scoreStr) {
  if (!scoreStr || scoreStr === 'E') return 0;
  const n = parseInt(scoreStr);
  return isNaN(n) ? 0 : n;
}

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

    console.log(`[auto-finalize] Checking if "${tournament.name}" is complete...`);

    const purse = (tournament.purse_millions || 20) * 1000000;
    const isMasters = tournament.is_major && tournament.short_name === 'Masters';

    // Step 2: Find the Live Golf Data schedule entry and check completion
    const year = new Date(tournament.start_date + 'T00:00:00Z').getFullYear();
    let scheduleEntry;
    try {
      const schedule = await getSchedule(year);
      scheduleEntry = findScheduleEntry(schedule.schedule, tournament);
    } catch (e) {
      console.log(`[auto-finalize] Schedule lookup failed: ${e.message}`);
      return { statusCode: 200, body: JSON.stringify({ status: 'error', reason: 'Schedule lookup failed' }) };
    }

    if (!scheduleEntry) {
      console.log('[auto-finalize] No matching tournament found in schedule.');
      return { statusCode: 200, body: JSON.stringify({ status: 'error', reason: 'No matching tournament found in schedule' }) };
    }

    let leaderboard;
    try {
      leaderboard = await getLeaderboard(scheduleEntry.tournId, year);
    } catch (e) {
      console.log(`[auto-finalize] Leaderboard fetch failed: ${e.message}`);
      return { statusCode: 200, body: JSON.stringify({ status: 'error', reason: 'Leaderboard fetch failed' }) };
    }

    const rows = leaderboard.leaderboardRows || [];
    if (rows.length === 0) {
      console.log('[auto-finalize] Leaderboard came back empty.');
      return { statusCode: 200, body: JSON.stringify({ status: 'error', reason: 'Leaderboard came back empty' }) };
    }

    const isComplete = leaderboard.status === 'Official';
    if (!isComplete) {
      console.log(`[auto-finalize] "${tournament.name}" not yet complete. Will check again.`);
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

    // Step 4: Fetch official earnings and match picked golfers to leaderboard rows
    let earningsData;
    try {
      earningsData = await getEarnings(scheduleEntry.tournId, year);
    } catch (e) {
      console.log(`[auto-finalize] Earnings fetch failed: ${e.message}`);
      earningsData = { leaderboard: [] };
    }

    const officialEarningsMap = {};
    (earningsData.leaderboard || []).forEach(p => { officialEarningsMap[p.playerId] = p.earnings || 0; });
    const hasOfficialEarnings = Object.keys(officialEarningsMap).length > 0;
    const earningsSource = hasOfficialEarnings ? 'espn' : 'calculated';
    console.log(`[auto-finalize] Earnings source: ${earningsSource}`);

    const apiPlayers = buildPlayersFromLeaderboard(rows);
    apiPlayers.forEach(p => {
      if (hasOfficialEarnings) {
        p.earnings = officialEarningsMap[p.playerId] || 0;
      } else if (!p.isCut && !p.isWD && p.positionNum !== 999) {
        p.earnings = calculateTiedEarnings(p.positionNum, p.tiedCount, purse, isMasters);
      } else {
        p.earnings = 0;
      }
    });

    const matchedPicked = pickedList.map(pg => ({ ...pg, apiMatch: findGolferMatch(pg.name, apiPlayers) }));

    const unmatchedCount = matchedPicked.filter(pg => !pg.apiMatch).length;
    if (unmatchedCount > 0) {
      console.log(`[auto-finalize] WARNING: ${unmatchedCount} golfer(s) could not be matched.`);
    }

    // Step 5: Save earnings and results
    let savedCount = 0;
    const players = await supabase.from('players').select('id').neq('is_guest', true);
    const playerIds = (players.data || []).map(p => p.id);

    for (const pg of matchedPicked) {
      const match = pg.apiMatch;
      const position = match?.position || '-';
      const earnings = match?.earnings || 0;

      // Always save to golfer_earnings — drives live scoring
      await supabase.from('golfer_earnings').upsert({
        golfer_id: pg.id,
        tournament_id: tournament.id,
        earnings,
        finish_position: position,
        score: match?.score || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'golfer_id,tournament_id' });

      // Only save to results when official earnings are available — drives Breakdown page
      // If only calculated estimates are available, sync-official-earnings will handle this later
      if (hasOfficialEarnings) {
        await supabase.from('results').upsert({
          tournament_id: tournament.id,
          golfer_id: pg.id,
          finish_position: position,
          score_to_par: parseScoreToPar(match?.score),
          earnings,
          made_cut: !(match?.isCut)
        }, { onConflict: 'tournament_id,golfer_id' });
      }

      savedCount++;
    }

    console.log(`[auto-finalize] Saved earnings for ${savedCount} golfers (source: ${earningsSource}). Results table updated: ${hasOfficialEarnings}.`);

    // Step 6: Recalculate weekly scores
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

    // Step 7: Recalculate season standings
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

    // Step 8: Mark tournament complete, set next week as current
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
