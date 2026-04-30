// Netlify scheduled function - Sync first tee time from ESPN
// Runs Wednesday 1pm ET. Falls back to 7am ET if ESPN tee times not posted yet.

const { createClient } = require('@supabase/supabase-js');

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

    // Fetch ESPN scoreboard for the tournament's start date
    const dateStr = tournament.start_date.replace(/-/g, '');
    const scoreboardRes = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?dates=${dateStr}`
    );

    if (!scoreboardRes.ok) {
      console.log('[sync-tee-time] ESPN fetch failed, applying fallback.');
      await updateTeeTime(tournament.id, fallbackTime);
      return { statusCode: 200, body: JSON.stringify({ status: 'fallback', reason: 'ESPN fetch failed', teeTime: fallbackTime }) };
    }

    const scoreboardData = await scoreboardRes.json();

    // Match ESPN event to our tournament by name
    const allEvents = scoreboardData.events || [];
    const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const shortNorm = norm(tournament.short_name);
    const fullNorm = norm(tournament.name);

    const espnEvent = allEvents.find(e => {
      const en = norm(e.name);
      const es = norm(e.shortName || '');
      return en.includes(shortNorm) || es.includes(shortNorm) || shortNorm.includes(en) || en.includes(fullNorm);
    }) || allEvents[0];

    if (!espnEvent) {
      console.log('[sync-tee-time] No ESPN event found, applying fallback.');
      await updateTeeTime(tournament.id, fallbackTime);
      return { statusCode: 200, body: JSON.stringify({ status: 'fallback', reason: 'No ESPN event', teeTime: fallbackTime }) };
    }

    const eventId = espnEvent.id;
    console.log(`[sync-tee-time] Matched ESPN event: "${espnEvent.name}" (id: ${eventId})`);

    // Get competitor IDs — try full field from core API if scoreboard is truncated
    let competitorIds = (espnEvent.competitions?.[0]?.competitors || []).map(c => c.id);

    if (competitorIds.length < 30) {
      try {
        const coreRes = await fetch(
          `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors?limit=200`
        );
        if (coreRes.ok) {
          const coreData = await coreRes.json();
          const ids = (coreData.items || []).map(item => {
            const ref = item.$ref || item.href || '';
            const m = ref.match(/competitors\/(\d+)/);
            return m ? m[1] : null;
          }).filter(Boolean);
          if (ids.length > competitorIds.length) competitorIds = ids;
        }
      } catch (e) { /* use what we have */ }
    }

    if (competitorIds.length === 0) {
      console.log('[sync-tee-time] No competitors found, applying fallback.');
      await updateTeeTime(tournament.id, fallbackTime);
      return { statusCode: 200, body: JSON.stringify({ status: 'fallback', reason: 'No competitors', teeTime: fallbackTime }) };
    }

    console.log(`[sync-tee-time] Fetching tee times for ${competitorIds.length} competitors...`);

    // Batch-fetch competitor statuses to collect tee times
    const teeTimes = [];
    const batchSize = 25;

    for (let i = 0; i < competitorIds.length; i += batchSize) {
      const batch = competitorIds.slice(i, i + batchSize);
      await Promise.all(batch.map(async (cId) => {
        try {
          const res = await fetch(
            `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${cId}/status`
          );
          if (!res.ok) return;
          const data = await res.json();
          const raw = data.teeTime || '';
          if (!raw) return;
          const d = new Date(raw);
          if (!isNaN(d.getTime())) teeTimes.push(d);
        } catch (e) { /* ignore individual failures */ }
      }));
    }

    if (teeTimes.length === 0) {
      console.log('[sync-tee-time] No tee times from ESPN, applying fallback.');
      await updateTeeTime(tournament.id, fallbackTime);
      return { statusCode: 200, body: JSON.stringify({ status: 'fallback', reason: 'No ESPN tee times', teeTime: fallbackTime }) };
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
        competitorCount: competitorIds.length,
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
