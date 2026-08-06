// Netlify function - Return all withdrawn golfers for the current/upcoming tournament
// Checks the full field via the Live Golf Data API, not just picked golfers.

const { createClient } = require('@supabase/supabase-js');
const { getSchedule, getLeaderboard, findScheduleEntry, normalizeName, formatTeeTime } = require('./lib/rapidapi-golf');

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

// A single lineup-page load used to fan out to ~150 ESPN requests, which is
// what triggered Akamai's bot-mitigation block. The Live Golf Data API
// returns the whole field in one call, but we still cache across warm
// function invocations to avoid burning RapidAPI request quota on every
// page view. Success is cached longer than a failure so a transient miss
// retries again soon instead of being stuck for the full TTL.
let cache = { tournamentId: null, fetchedAt: 0, isFallback: false, body: null };
const SUCCESS_CACHE_TTL_MS = 5 * 60 * 1000;
const FALLBACK_CACHE_TTL_MS = 90 * 1000;

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

    if (cache.tournamentId === tournament.id) {
      const ttl = cache.isFallback ? FALLBACK_CACHE_TTL_MS : SUCCESS_CACHE_TTL_MS;
      const age = Date.now() - cache.fetchedAt;
      if (age < ttl) {
        return { statusCode: 200, headers: HEADERS, body: cache.body };
      }
    }

    // Load all active golfer names from DB for field matching
    const { data: dbGolfers } = await supabase.from('golfers').select('name').eq('is_active', true);
    const dbNames = (dbGolfers || []).map(g => g.name);
    const dbNormed = dbNames.map(n => ({ original: n, norm: normalizeName(n) }));

    const fallback = (reason, wdNames = []) => {
      const body = JSON.stringify({ success: true, wdGolfers: wdNames, fieldGolfers: dbNames, teeTimeMap: {}, tournament: tournament.name, fallback: reason });
      cache = { tournamentId: tournament.id, fetchedAt: Date.now(), isFallback: true, body };
      return { statusCode: 200, headers: HEADERS, body };
    };

    const year = new Date(tournament.start_date + 'T00:00:00Z').getFullYear();

    let scheduleEntry = null;
    try {
      const schedule = await getSchedule(year);
      scheduleEntry = findScheduleEntry(schedule.schedule, tournament);
    } catch (e) {
      return fallback('schedule_error');
    }

    if (!scheduleEntry) {
      return fallback('no_schedule_match');
    }

    let leaderboard;
    try {
      leaderboard = await getLeaderboard(scheduleEntry.tournId, year);
    } catch (e) {
      return fallback('leaderboard_error');
    }

    const rows = leaderboard.leaderboardRows || [];
    if (rows.length === 0) {
      return fallback('empty_field');
    }

    const wdNames = [];
    const fieldNames = [];
    const teeTimeMap = {};

    rows.forEach(row => {
      const name = `${row.firstName} ${row.lastName}`.trim();
      if (!name) return;
      const isWD = row.status === 'wd' || row.position === 'WD';
      if (isWD) {
        wdNames.push(name);
      } else {
        fieldNames.push(name);
        const teeTime = formatTeeTime(row.teeTime);
        if (teeTime) teeTimeMap[name] = teeTime;
      }
    });

    // Auto-add field golfers not in DB at $15
    const newGolfers = [];
    for (const apiName of fieldNames) {
      const normApi = normalizeName(apiName);
      const inDb = dbNormed.find(d => d.norm === normApi);
      if (!inDb) {
        newGolfers.push({ name: apiName, salary: 15, is_active: true, is_liv: false });
      }
    }

    if (newGolfers.length > 0) {
      await supabase.from('golfers').insert(newGolfers);
    }

    const body = JSON.stringify({
      success: true,
      wdGolfers: wdNames,
      fieldGolfers: fieldNames,
      teeTimeMap,
      tournament: tournament.name,
      newGolfers: newGolfers.map(g => g.name)
    });
    cache = { tournamentId: tournament.id, fetchedAt: Date.now(), isFallback: false, body };
    return { statusCode: 200, headers: HEADERS, body };

  } catch (err) {
    return EMPTY;
  }
};
