// Netlify scheduled function — sync official final earnings to results table
// Runs Mon + Tue at 1 PM ET to catch official payouts posted after Sunday finalization
// Only writes to results when the Live Golf Data API returns actual dollar amounts (not calculated estimates)

const { createClient } = require('@supabase/supabase-js');
const { getSchedule, getEarnings, findScheduleEntry, buildPlayersFromLeaderboard, findGolferMatch, getLeaderboard } = require('./lib/rapidapi-golf');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://iqahjyoytzhhkvwmujha.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

function parseScoreToPar(scoreStr) {
  if (!scoreStr || scoreStr === 'E') return 0;
  const n = parseInt(scoreStr);
  return isNaN(n) ? 0 : n;
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

      // No official earnings yet — try the Live Golf Data API
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
  // Get picked golfers for this tournament
  const { data: lineups } = await supabase
    .from('lineups')
    .select('golfer_id, golfers(id, name)')
    .eq('tournament_id', tournament.id);

  const pickedGolfers = {};
  if (lineups) lineups.forEach(l => { if (l.golfers) pickedGolfers[l.golfers.id] = { id: l.golfers.id, name: l.golfers.name }; });
  const pickedList = Object.values(pickedGolfers);

  if (pickedList.length === 0) return { status: 'skipped', reason: 'No lineups' };

  const year = new Date(tournament.start_date + 'T00:00:00Z').getFullYear();

  let scheduleEntry;
  try {
    const schedule = await getSchedule(year);
    scheduleEntry = findScheduleEntry(schedule.schedule, tournament);
  } catch (e) {
    return { status: 'error', reason: `Schedule lookup failed: ${e.message}` };
  }

  if (!scheduleEntry) return { status: 'error', reason: 'No matching tournament found in schedule' };

  let leaderboard, earningsData;
  try {
    [leaderboard, earningsData] = await Promise.all([
      getLeaderboard(scheduleEntry.tournId, year),
      getEarnings(scheduleEntry.tournId, year)
    ]);
  } catch (e) {
    return { status: 'error', reason: `Live Golf Data fetch failed: ${e.message}` };
  }

  const rows = leaderboard.leaderboardRows || [];
  if (rows.length === 0) return { status: 'error', reason: 'Leaderboard came back empty' };

  const officialEarningsMap = {};
  (earningsData.leaderboard || []).forEach(p => { officialEarningsMap[p.playerId] = p.earnings || 0; });
  const hasOfficialEarnings = Object.keys(officialEarningsMap).length > 0;

  if (!hasOfficialEarnings) {
    console.log(`[sync-official-earnings] "${tournament.name}" — no official earnings posted yet.`);
    return { status: 'pending', reason: 'Official earnings not available yet' };
  }

  console.log(`[sync-official-earnings] "${tournament.name}" — official earnings found! Saving...`);

  const apiPlayers = buildPlayersFromLeaderboard(rows);
  apiPlayers.forEach(p => { p.earnings = officialEarningsMap[p.playerId] || 0; });

  const matchedPicked = pickedList.map(pg => ({ ...pg, apiMatch: findGolferMatch(pg.name, apiPlayers) }));

  // Save official earnings to both golfer_earnings and results
  let savedCount = 0;
  for (const pg of matchedPicked) {
    const match = pg.apiMatch;
    const position = match?.position || '-';
    const earnings = match?.earnings || 0;

    await supabase.from('golfer_earnings').upsert({
      golfer_id: pg.id,
      tournament_id: tournament.id,
      earnings,
      finish_position: position,
      score: match?.score || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'golfer_id,tournament_id' });

    await supabase.from('results').upsert({
      tournament_id: tournament.id,
      golfer_id: pg.id,
      finish_position: position,
      score_to_par: parseScoreToPar(match?.score),
      earnings,
      made_cut: !(match?.isCut)
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
