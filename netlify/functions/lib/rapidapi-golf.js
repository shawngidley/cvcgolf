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

// Turns raw leaderboardRows into a flat player list with position/tie info
// resolved - the API already computes ties (e.g. "T2"), so this just parses
// that into a number and counts how many rows share it, instead of
// reconstructing standings from raw scores the way the old ESPN code had to.
function buildPlayersFromLeaderboard(rows) {
  const players = (rows || []).map(row => {
    const isCut = row.status === 'cut' || row.position === 'CUT';
    const isWD = row.status === 'wd' || row.position === 'WD';
    const positionNum = (!isCut && !isWD) ? parseInt(String(row.position).replace(/\D/g, ''), 10) : NaN;
    return {
      playerId: row.playerId,
      name: `${row.firstName} ${row.lastName}`.trim(),
      position: isCut ? 'CUT' : isWD ? 'WD' : (row.position || '-'),
      positionNum: Number.isNaN(positionNum) ? 999 : positionNum,
      score: row.total || '-',
      currentRoundScore: row.currentRoundScore || '-',
      thru: row.thru || '-',
      teeTime: formatTeeTime(row.teeTime) || '-',
      isCut,
      isWD
    };
  });

  const positionCounts = {};
  players.forEach(p => {
    if (p.positionNum === 999) return;
    positionCounts[p.positionNum] = (positionCounts[p.positionNum] || 0) + 1;
  });
  players.forEach(p => { p.tiedCount = positionCounts[p.positionNum] || 1; });

  return players;
}

// Hardcoded name corrections: API name -> DB name (or null to skip entirely).
// Carried over from the ESPN-era matcher - these cover spellings our DB and
// the data source have historically disagreed on.
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
Object.entries(NAME_CORRECTIONS).forEach(([apiName, dbName]) => {
  const key = normalizeName(apiName);
  NAME_CORRECTIONS_NORM[key] = dbName ? normalizeName(dbName) : null;
});

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

// Fuzzy-matches a DB golfer name against a list of { name, ... } candidates
// (e.g. from buildPlayersFromLeaderboard), returning the best match plus a
// 0-1 confidence score, or null if nothing scores high enough to trust.
function findGolferMatch(dbName, candidates) {
  if (!dbName || !candidates.length) return null;

  const dbNorm = normalizeName(dbName);
  const dbParts = dbNorm.split(' ');
  const dbFirst = dbParts[0];
  const dbLast = dbParts[dbParts.length - 1];

  if (dbNorm in DB_NAME_LOCKS) {
    const required = DB_NAME_LOCKS[dbNorm];
    const exact = candidates.find(c => normalizeName(c.name) === required);
    return exact ? { ...exact, confidence: 1.0 } : null;
  }

  for (const c of candidates) {
    const cNorm = normalizeName(c.name);
    if (cNorm in NAME_CORRECTIONS_NORM) {
      const corrected = NAME_CORRECTIONS_NORM[cNorm];
      if (corrected === null) continue;
      if (corrected === dbNorm) return { ...c, confidence: 1.0 };
      continue;
    }
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const c of candidates) {
    const cNorm = normalizeName(c.name);
    if (!cNorm || cNorm in NAME_CORRECTIONS_NORM) continue;

    if (dbNorm === cNorm) return { ...c, confidence: 1.0 };

    const cParts = cNorm.split(' ');
    const cFirst = cParts[0];
    const cLast = cParts[cParts.length - 1];

    const lastLev = levenshtein(dbLast, cLast);
    const lastSimilarity = 1 - (lastLev / Math.max(dbLast.length, cLast.length));
    if (lastSimilarity < 0.7) continue;
    if (dbFirst[0] !== cFirst[0]) continue;

    const firstLev = levenshtein(dbFirst, cFirst);
    const firstSimilarity = 1 - (firstLev / Math.max(dbFirst.length, cFirst.length));
    const isAbbreviated = dbFirst.length <= 2 || cFirst.length <= 2;
    if (!isAbbreviated && firstSimilarity < 0.7) continue;

    let score;
    if (dbFirst === cFirst && dbLast === cLast) {
      score = 0.95;
    } else if (dbFirst === cFirst && lastSimilarity >= 0.85) {
      score = 0.9;
    } else {
      score = (firstSimilarity * 0.4) + (lastSimilarity * 0.6);
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = { ...c, confidence: parseFloat(score.toFixed(2)) };
    }
  }

  return bestMatch && bestScore >= 0.5 ? bestMatch : null;
}

module.exports = {
  PGA_ORG_ID,
  getSchedule,
  getLeaderboard,
  getEarnings,
  findScheduleEntry,
  normalizeName,
  formatTeeTime,
  buildPlayersFromLeaderboard,
  findGolferMatch
};
