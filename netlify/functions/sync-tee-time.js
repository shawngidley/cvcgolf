// Netlify scheduled function - Sync first tee time from the Live Golf Data API
// Runs Wednesday 1pm ET. Falls back to 7am ET if tee times aren't posted yet.

const { createClient } = require('@supabase/supabase-js');
const { getSchedule, getLeaderboard, findScheduleEntry } = require('./lib/rapidapi-golf');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://iqahjyoytzhhkvwmujha.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

// 7am EDT = 11:00 UTC (valid for April–November tournaments)
const FALLBACK_HOUR_UTC = 11;

exports.handler = async () => {
  console.log('[sync-tee-time] Starting...');

  try {
    // Find the current (upcoming) tournament
    const today = new Date().toISOString().split('T')[0];

    let tournament = null;

    const { data: currentRows } = await supabase
      .from('tournaments')
      .select('*')
      .eq('is_current', true)
      .eq('is_complete', false)
      .limit(1);

    if (currentRows?.[0]) {
      tournament = currentRows[0];
    } else {
      const { data: upcomingRows } = await supabase
        .from('tournaments')
        .select('*')
        .gte('start_date', today)
        .eq('is_complete', false)
        .order('start_date', { ascending: true })
        .limit(1);
      tournament = upcomingRows?.[0] || null;
    }

    if (!tournament) {
      console.log('[sync-tee-time] No upcoming tournament found. Skipping.');
      return { statusCode: 200, body: JSON.stringify({ status: 'skipped', reason: 'No upcoming tournament' }) };
    }

    console.log(`[sync-tee-time] Syncing tee time for "${tournament.name}" (${tournament.start_date})`);

    const fallbackTime = `${tournament.start_date}T${String(FALLBACK_HOUR_UTC).padStart(2, '0')}:00:00+00:00`;

    const year = new Date(tournament.start_date + 'T00:00:00Z').getFullYear();

    let scheduleEntry;
    try {
      const schedule = await getSchedule(year);
      scheduleEntry = findScheduleEntry(schedule.schedule, tournament);
    } catch (e) {
      console.log(`[sync-tee-time] Schedule lookup failed (${e.message}), applying fallback.`);
      await updateTeeTime(tournament.id, fallbackTime);
      return { statusCode: 200, body: JSON.stringify({ status: 'fallback', reason: 'Schedule lookup failed', teeTime: fallbackTime }) };
    }

    if (!scheduleEntry) {
      console.log('[sync-tee-time] No matching tournament found in schedule, applying fallback.');
      await updateTeeTime(tournament.id, fallbackTime);
      return { statusCode: 200, body: JSON.stringify({ status: 'fallback', reason: 'No matching tournament found in schedule', teeTime: fallbackTime }) };
    }

    console.log(`[sync-tee-time] Matched schedule entry: "${scheduleEntry.name}" (tournId: ${scheduleEntry.tournId})`);

    let leaderboard;
    try {
      leaderboard = await getLeaderboard(scheduleEntry.tournId, year);
    } catch (e) {
      console.log(`[sync-tee-time] Leaderboard fetch failed (${e.message}), applying fallback.`);
      await updateTeeTime(tournament.id, fallbackTime);
      return { statusCode: 200, body: JSON.stringify({ status: 'fallback', reason: 'Leaderboard fetch failed', teeTime: fallbackTime }) };
    }

    const rows = leaderboard.leaderboardRows || [];
    const teeTimes = rows
      .map(r => r.teeTimeTimestamp)
      .filter(d => d instanceof Date && !isNaN(d.getTime()));

    if (teeTimes.length === 0) {
      console.log('[sync-tee-time] No tee times available yet, applying fallback.');
      await updateTeeTime(tournament.id, fallbackTime);
      return { statusCode: 200, body: JSON.stringify({ status: 'fallback', reason: 'No tee times available', teeTime: fallbackTime }) };
    }

    // Find the earliest tee time on the tournament's start date (Round 1 / Thursday)
    const startDatePrefix = tournament.start_date;
    const round1Times = teeTimes.filter(d => d.toISOString().startsWith(startDatePrefix));
    const candidates = round1Times.length > 0 ? round1Times : teeTimes;
    const earliest = new Date(Math.min(...candidates.map(d => d.getTime())));
    const earliestISO = earliest.toISOString().replace('Z', '+00:00');

    console.log(`[sync-tee-time] Earliest tee time: ${earliestISO} (from ${teeTimes.length} total, ${round1Times.length} on start date)`);
    await updateTeeTime(tournament.id, earliestISO);

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'updated',
        tournament: tournament.name,
        teeTime: earliestISO,
        competitorCount: rows.length,
        teeTimeCount: teeTimes.length
      })
    };

  } catch (err) {
    console.error('[sync-tee-time] Error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ status: 'error', error: err.message }) };
  }
};

async function updateTeeTime(tournamentId, teeTime) {
  await supabase.from('tournaments').update({ first_tee_time: teeTime }).eq('id', tournamentId);
  console.log(`[sync-tee-time] Set first_tee_time = ${teeTime}`);
}
