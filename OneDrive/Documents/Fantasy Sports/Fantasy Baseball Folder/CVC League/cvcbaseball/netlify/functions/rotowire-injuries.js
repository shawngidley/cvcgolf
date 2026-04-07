// Netlify serverless function: rotowire-injuries.js
// Fetches the RotoWire baseball injury report API and returns structured JSON.
// Returns: [{name, team, pos, status, injury, link}]
// Cached in-memory for 30 minutes.

const https = require('https');

const ROTOWIRE_URL = 'https://www.rotowire.com/baseball/tables/injury-report.php?team=ALL&pos=ALL';
const CACHE_TTL = 30 * 60 * 1000;

let _cache = { data: null, ts: 0 };

exports.handler = async function(event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (_cache.data && (Date.now() - _cache.ts) < CACHE_TTL) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, injuries: _cache.data, source: 'rotowire-injuries', cached: true })
    };
  }

  try {
    const raw = await fetchUrl(ROTOWIRE_URL);
    const data = JSON.parse(raw);
    const injuries = [];

    if (Array.isArray(data)) {
      data.forEach(function(entry) {
        var name = (entry.player || ((entry.firstname || '') + ' ' + (entry.lastname || '')).trim());
        if (!name) return;
        var status = normalizeStatus(entry.status || '');
        if (!status) return;

        injuries.push({
          name: name,
          team: entry.team || '',
          pos: entry.position || '',
          status: status,
          injury: entry.injury || '',
          link: entry.URL ? 'https://www.rotowire.com' + entry.URL : ''
        });
      });
    }

    _cache = { data: injuries, ts: Date.now() };
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, injuries: injuries, source: 'rotowire-injuries', cached: false })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: false, injuries: [], source: 'rotowire-injuries', error: err.message })
    };
  }
};

function normalizeStatus(raw) {
  var s = raw.trim().toLowerCase().replace(/[\s-]+/g, '');
  if (s === 'dtd' || s === 'daytoday' || s === 'd2d') return 'DTD';
  if (s === '10dayil' || s === '10day' || s === '15dayil' || s === '15day') return 'IL10';
  if (s === '60dayil' || s === '60day') return 'IL60';
  if (s === 'out') return 'OUT';
  if (s === 'suspension' || s === 'suspended' || s === 'restricted') return 'SUS';
  // If it contains "IL" or "injured"
  if (/il$|injuredlist/.test(s)) return 'IL10';
  if (s) return s.toUpperCase().substring(0, 4);
  return '';
}

function fetchUrl(url, redirects) {
  redirects = redirects || 0;
  if (redirects > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/html, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.rotowire.com/baseball/injury-report.php'
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) loc = 'https://www.rotowire.com' + loc;
        resolve(fetchUrl(loc, redirects + 1));
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error('HTTP ' + res.statusCode));
        return;
      }
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.setTimeout(12000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}
