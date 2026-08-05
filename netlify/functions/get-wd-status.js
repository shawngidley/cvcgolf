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

const EMPTY = { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true, wdGolfers: [], fieldGolfers: [], teeTimeMap: {} }) };

// Known ESPN event ID overrides for specific weeks, keyed by tournaments.week_number.
// Used when fuzzy date/name matching against ESPN's schedule can't be trusted.
const WEEK_EVENT_ID_OVERRIDES = {
  24: '401811961' // Wyndham Championship 2026
};

// Node's default fetch sends "User-Agent: node", which some CDN/WAF layers
// (Netlify's serverless IPs included) silently filter, returning empty
// results instead of an error. A browser-like UA avoids that.
const ESPN_FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json'
};
const espnFetch = (url) => fetch(url, { headers: ESPN_FETCH_HEADERS });

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: '' };

  try {
    // Find current or next upcoming tournament
    const today = new Date().toISOString().split('T')[0];

    let tournament = null;
    const { data: currentRows } = await supabase
      .from('tournaments')
      .select('id, name, short_name, start_date, week_number')
      .eq('is_current', true)
      .eq('is_complete', false)
      .limit(1);

    if (currentRows?.[0]) {
      tournament = currentRows[0];
    } else {
      const { data: upcomingRows } = await supabase
        .from('tournaments')
        .select('id, name, short_name, start_date, week_number')
        .gte('start_date', today)
        .eq('is_complete', false)
        .order('start_date', { ascending: true })
        .limit(1);
      tournament = upcomingRows?.[0] || null;
    }

    if (!tournament) return EMPTY;

    console.log(`[get-wd-status] Target tournament: "${tournament.name}" (short: "${tournament.short_name}"), start_date: ${tournament.start_date}`);

    // Load all active golfer names from DB for field matching
    const { data: dbGolfers } = await supabase.from('golfers').select('name').eq('is_active', true);
    const dbNames = (dbGolfers || []).map(g => g.name);
    const normName = (s) => s.replace(/[øØ]/g, 'o').replace(/[æÆ]/g, 'ae').replace(/[åÅ]/g, 'a').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
    const dbNormed = dbNames.map(n => ({ original: n, norm: normName(n) }));

    const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const shortNorm = norm(tournament.short_name);
    const fullNorm = norm(tournament.name);
    const matchesTournament = (e) => {
      const en = norm(e.name);
      const es = norm(e.shortName || '');
      return en.includes(shortNorm) || es.includes(shortNorm) || shortNorm.includes(en) || en.includes(fullNorm);
    };

    const overrideEventId = WEEK_EVENT_ID_OVERRIDES[tournament.week_number];
    if (overrideEventId) {
      console.log(`[get-wd-status] Week ${tournament.week_number} has a hardcoded ESPN event id override: ${overrideEventId}`);
    }

    const closestByDate = (events, target) => events.reduce((closest, e) => {
      const diff = Math.abs(new Date(e.date) - target);
      const closestDiff = closest ? Math.abs(new Date(closest.date) - target) : Infinity;
      return diff < closestDiff ? e : closest;
    }, null);

    // Tier 1: search a +/-7 day window around the tournament's start date - wide
    // enough to tolerate schedule slip, and lenient enough to accept the nearest
    // event by date even if the name doesn't match cleanly.
    let espnEvent = null;
    let allEvents = [];
    const startDate = new Date(tournament.start_date + 'T00:00:00Z');
    try {
      const fmt = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');
      const windowStart = fmt(new Date(startDate.getTime() - 7 * 86400000));
      const windowEnd = fmt(new Date(startDate.getTime() + 7 * 86400000));
      const rangeUrl = `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?dates=${windowStart}-${windowEnd}`;
      console.log(`[get-wd-status] Tier 1 (+/-7 day window): GET ${rangeUrl}`);
      const rangeRes = await espnFetch(rangeUrl);
      if (rangeRes.ok) {
        const rangeData = await rangeRes.json();
        allEvents = rangeData.events || [];
        console.log(`[get-wd-status] Tier 1 returned ${allEvents.length} event(s): ${allEvents.map(e => `${e.name} (${e.id})`).join(', ')}`);

        if (overrideEventId) espnEvent = allEvents.find(e => String(e.id) === String(overrideEventId)) || null;
        if (!espnEvent) espnEvent = allEvents.find(matchesTournament) || null;
        if (!espnEvent && allEvents.length > 0) {
          espnEvent = closestByDate(allEvents, startDate);
          if (espnEvent) console.log(`[get-wd-status] No name match - using closest-by-date event: "${espnEvent.name}" (id: ${espnEvent.id})`);
        }
      } else {
        console.log(`[get-wd-status] Tier 1 request failed with status ${rangeRes.status}`);
      }
    } catch (e) {
      console.log(`[get-wd-status] Tier 1 threw: ${e.message}`);
    }

    // Tier 2: fall back to ESPN's default "current event" schedule endpoint,
    // in case the tournament's start_date has drifted outside the search window.
    if (!espnEvent) {
      try {
        const scheduleUrl = 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard';
        console.log(`[get-wd-status] Tier 2 (default schedule): GET ${scheduleUrl}`);
        const scheduleRes = await espnFetch(scheduleUrl);
        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json();
          allEvents = scheduleData.events || [];
          console.log(`[get-wd-status] Tier 2 returned ${allEvents.length} event(s): ${allEvents.map(e => `${e.name} (${e.id})`).join(', ')}`);

          if (overrideEventId) espnEvent = allEvents.find(e => String(e.id) === String(overrideEventId)) || null;
          if (!espnEvent) espnEvent = allEvents.find(matchesTournament) || null;
          if (!espnEvent && allEvents.length > 0) espnEvent = closestByDate(allEvents, startDate);
        } else {
          console.log(`[get-wd-status] Tier 2 request failed with status ${scheduleRes.status}`);
        }
      } catch (e) {
        console.log(`[get-wd-status] Tier 2 threw: ${e.message}`);
      }
    }

    // Only give up on ESPN entirely (and fall back to the full Supabase golfer
    // list) when no event at all could be found anywhere in ESPN's schedule -
    // a failed/narrow date or name match on its own is no longer disqualifying.
    if (!espnEvent) {
      console.log('[get-wd-status] No ESPN event found anywhere in the schedule - falling back to full Supabase golfer list');
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({ success: true, wdGolfers: [], fieldGolfers: dbNames, teeTimeMap: {}, tournament: tournament.name, fallback: 'no_espn_event' })
      };
    }

    console.log(`[get-wd-status] Matched ESPN event: "${espnEvent.name}" (id: ${espnEvent.id})`);

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
        const coreRes = await espnFetch(
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

    console.log(`[get-wd-status] Resolved ${competitorIds.length} competitor id(s) for event ${eventId}`);

    if (competitorIds.length === 0) {
      console.log('[get-wd-status] ESPN returned no competitors - falling back to full Supabase golfer list');
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({ success: true, wdGolfers: [], fieldGolfers: dbNames, teeTimeMap: {}, tournament: tournament.name, fallback: 'no_competitors' })
      };
    }

    // Batch-fetch all competitor statuses — collect WD names, confirmed field, and tee times
    const wdNames = [];
    const fieldNames = [];
    const espnTeeTimeMap = {}; // ESPN name -> tee time string ET
    const batchSize = 25;
    let statusFailCount = 0;

    for (let i = 0; i < competitorIds.length; i += batchSize) {
      const batch = competitorIds.slice(i, i + batchSize);
      await Promise.all(batch.map(async (cId) => {
        try {
          const res = await espnFetch(
            `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${cId}/status`
          );
          if (!res.ok) { statusFailCount++; return; }
          const statusData = await res.json();
          const statusName = statusData?.type?.name || '';
          const isWD = statusName === 'STATUS_WITHDRAWN' || statusName === 'STATUS_DISQUALIFIED';

          // Use name from scoreboard map if available; otherwise fetch from competitor endpoint
          let name = nameMap[cId];
          if (!name) {
            try {
              const compRes = await espnFetch(
                `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${cId}`
              );
              if (compRes.ok) {
                const compData = await compRes.json();
                if (compData.athlete?.$ref) {
                  const athleteRes = await espnFetch(compData.athlete.$ref);
                  if (athleteRes.ok) {
                    const athleteData = await athleteRes.json();
                    name = athleteData.displayName || athleteData.fullName || '';
                  }
                }
              }
            } catch (e) { /* ignore */ }
          }

          if (!name) return;

          if (isWD) {
            wdNames.push(name);
          } else {
            fieldNames.push(name);
            // Capture Round 1 tee time if available
            const rawTeeTime = statusData.teeTime || '';
            if (rawTeeTime) {
              try {
                const d = new Date(rawTeeTime);
                if (!isNaN(d.getTime())) {
                  espnTeeTimeMap[name] = d.toLocaleTimeString('en-US', {
                    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York'
                  });
                }
              } catch (e) { /* ignore */ }
            }
          }
        } catch (e) { statusFailCount++; }
      }));
    }

    if (statusFailCount > 0) {
      console.log(`[get-wd-status] ${statusFailCount} of ${competitorIds.length} competitor status request(s) failed`);
    }

    console.log(`[get-wd-status] ESPN field resolved: ${fieldNames.length} active, ${wdNames.length} withdrawn`);

    // ESPN gave us an event but no usable field data (e.g. tee times not posted
    // yet) - fall back to every active golfer so owners can still build lineups.
    if (fieldNames.length === 0) {
      console.log('[get-wd-status] ESPN field came back empty - falling back to full Supabase golfer list');
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({ success: true, wdGolfers: wdNames, fieldGolfers: dbNames, teeTimeMap: {}, tournament: tournament.name, fallback: 'empty_field' })
      };
    }

    // Auto-add field golfers not in DB at $15
    const newGolfers = [];
    for (const espnName of fieldNames) {
      const normEspn = normName(espnName);
      const inDb = dbNormed.find(d => d.norm === normEspn);
      if (!inDb) {
        newGolfers.push({ name: espnName, salary: 15, is_active: true, is_liv: false });
      }
    }

    if (newGolfers.length > 0) {
      await supabase.from('golfers').insert(newGolfers);
      console.log(`[get-wd-status] Added ${newGolfers.length} new golfer(s): ${newGolfers.map(g => g.name).join(', ')}`);
    }

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        success: true,
        wdGolfers: wdNames,
        fieldGolfers: fieldNames,
        teeTimeMap: espnTeeTimeMap,
        tournament: tournament.name,
        newGolfers: newGolfers.map(g => g.name)
      })
    };

  } catch (err) {
    console.log(`[get-wd-status] Unhandled error: ${err.message}`);
    return EMPTY;
  }
};
