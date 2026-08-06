// Shared client for the Live Golf Data API (RapidAPI) - replaces ESPN's
// scoreboard/core API, which Akamai started blocking from Netlify's IPs.
const RAPIDAPI_HOST = 'live-golf-data.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;
const PGA_ORG_ID = 1;

function rapidHeaders() {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error('RAPIDAPI_KEY environment variable is not set');
  return { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': RAPIDAPI_HOST };
}

// The API returns MongoDB extended JSON ($numberInt/$numberLong/$numberDouble/$date)
// instead of plain numbers/dates - unwrap it recursively so callers get plain values.
function unwrapEJSON(value) {
  if (Array.isArray(value)) return value.map(unwrapEJSON);
  if (value && typeof value === 'object') {
    if ('$numberInt' in value) return parseInt(value.$numberInt, 10);
    if ('$numberLong' in value) return parseInt(value.$numberLong, 10);
    if ('$numberDouble' in value) return parseFloat(value.$numberDouble);
    if ('$date' in value) return new Date(unwrapEJSON(value.$date));
    const out = {};
    for (const k of Object.keys(value)) out[k] = unwrapEJSON(value[k]);
    return out;
  }
  return value;
}

async function rapidFetch(path, params) {
  const url = new URL(path, BASE_URL);
  Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { headers: rapidHeaders() });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Live Golf Data API ${path} returned ${res.status}: ${text.slice(0, 200)}`);
  }
  return unwrapEJSON(await res.json());
}

function getSchedule(year, orgId = PGA_ORG_ID) {
  return rapidFetch('/schedule', { orgId, year });
}

function getLeaderboard(tournId, year, orgId = PGA_ORG_ID) {
  return rapidFetch('/leaderboard', { orgId, tournId, year });
}

function getEarnings(tournId, year, orgId = PGA_ORG_ID) {
  return rapidFetch('/earnings', { orgId, tournId, year });
}

// Fuzzy-matches our tournament row to a Live Golf Data schedule entry, the
// same way get-wd-status.js used to match ESPN events: normalized name
// containment, falling back to the closest start date.
function findScheduleEntry(schedule, tournament) {
  const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const shortNorm = norm(tournament.short_name);
  const fullNorm = norm(tournament.name);
  const matches = (t) => {
    const tn = norm(t.name);
    return tn.includes(shortNorm) || shortNorm.includes(tn) || tn.includes(fullNorm) || fullNorm.includes(tn);
  };

  const entries = schedule || [];
  let entry = entries.find(matches) || null;

  if (!entry && entries.length > 0 && tournament.start_date) {
    const target = new Date(tournament.start_date + 'T00:00:00Z');
    entry = entries.reduce((closest, t) => {
      const d = t.date?.start;
      if (!d) return closest;
      const diff = Math.abs(new Date(d) - target);
      const closestDiff = closest?.date?.start ? Math.abs(new Date(closest.date.start) - target) : Infinity;
      return diff < closestDiff ? t : closest;
    }, null);
  }

  return entry;
}

// Normalizes a name for cross-source matching (accents, diacritics, punctuation).
function normalizeName(s) {
  return (s || '')
    .replace(/[øØ]/g, 'o').replace(/[æÆ]/g, 'ae').replace(/[åÅ]/g, 'a')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
}

// "6:50am" -> "6:50 AM" to match the app's existing tee-time display format.
function formatTeeTime(raw) {
  if (!raw) return null;
  const m = raw.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!m) return raw;
  return `${m[1]}:${m[2]} ${m[3].toUpperCase()}`;
}

module.exports = {
  PGA_ORG_ID,
  getSchedule,
  getLeaderboard,
  getEarnings,
  findScheduleEntry,
  normalizeName,
  formatTeeTime
};
