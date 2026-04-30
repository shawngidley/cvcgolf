// Netlify function - Return all withdrawn golfers for the current/upcoming tournament
// Checks the full ESPN field, not just picked golfers.

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

const EMPTY = { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true, wdGolfers: [] }) };

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: '' };

  try {
    // Find current or next upcoming tournament
    const today = new Date().toISOString().split('T')[0];

    let tournament = null;
    const { data: currentRows } = await supabase
      .from('tournaments')
      .select('id, name, short_name, start_date')
      .eq('is_current', true)
      .eq('is_complete', false)
      .limit(1);

    if (currentRows?.[0]) {
      tournament = currentRows[0];
    } else {
      const { data: upcomingRows } = await supabase
        .from('tournaments')
        .select('id, name, short_name, start_date')
        .gte('start_date', today)
        .eq('is_complete', false)
        .order('start_date', { ascending: true })
        .limit(1);
      tournament = upcomingRows?.[0] || null;
    }

    if (!tournament) return EMPTY;

    // Fetch ESPN scoreboard for the tournament's start date
    const dateStr = tournament.start_date.replace(/-/g, '');
    const scoreboardRes = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?dates=${dateStr}`
    );
    if (!scoreboardRes.ok) return EMPTY;

    const scoreboardData = await scoreboardRes.json();
    const allEvents = scoreboardData.events || [];

    // Match ESPN event to our tournament by name
    const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const shortNorm = norm(tournament.short_name);
    const fullNorm = norm(tournament.name);
    const espnEvent = allEvents.find(e => {
      const en = norm(e.name);
      const es = norm(e.shortName || '');
      return en.includes(shortNorm) || es.includes(shortNorm) || shortNorm.includes(en) || en.includes(fullNorm);
    }) || allEvents[0];

    if (!espnEvent) return EMPTY;

    const eventId = espnEvent.id;

    // Build id->name map from scoreboard competitors
    const nameMap = {};
    const scoreboardCompetitors = espnEvent.competitions?.[0]?.competitors || [];
    scoreboardCompetitors.forEach(c => {
      if (c.id && c.athlete?.displayName) nameMap[c.id] = c.athlete.displayName;
    });

    // Get full competitor ID list — use core API if scoreboard is truncated
    let competitorIds = scoreboardCompetitors.map(c => c.id);

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
      } catch (e) { /* use scoreboard list */ }
    }

    if (competitorIds.length === 0) return EMPTY;

    // Batch-fetch all competitor statuses, collect WD names
    const wdNames = [];
    const batchSize = 25;

    for (let i = 0; i < competitorIds.length; i += batchSize) {
      const batch = competitorIds.slice(i, i + batchSize);
      await Promise.all(batch.map(async (cId) => {
        try {
          const res = await fetch(
            `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${cId}/status`
          );
          if (!res.ok) return;
          const statusData = await res.json();
          const statusName = statusData?.type?.name || '';
          if (statusName !== 'STATUS_WITHDRAWN' && statusName !== 'STATUS_DISQUALIFIED') return;

          // Use name from scoreboard map if available; otherwise fetch from competitor endpoint
          let name = nameMap[cId];
          if (!name) {
            try {
              const compRes = await fetch(
                `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${cId}`
              );
              if (compRes.ok) {
                const compData = await compRes.json();
                if (compData.athlete?.$ref) {
                  const athleteRes = await fetch(compData.athlete.$ref);
                  if (athleteRes.ok) {
                    const athleteData = await athleteRes.json();
                    name = athleteData.displayName || athleteData.fullName || '';
                  }
                }
              }
            } catch (e) { /* ignore */ }
          }

          if (name) wdNames.push(name);
        } catch (e) { /* ignore individual failures */ }
      }));
    }

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ success: true, wdGolfers: wdNames, tournament: tournament.name })
    };

  } catch (err) {
    return EMPTY;
  }
};
