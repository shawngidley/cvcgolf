// Netlify serverless function: netlify/functions/gas.js
// Handles two jobs:
// 1. Proxy requests to Google Apps Script (lineups, pins)
// 2. Fetch player news directly from RotoBaller RSS (bypasses GAS UrlFetchApp issues)

const https = require('https');
const http = require('http');

const GAS_URL = 'https://script.google.com/macros/s/AKfycbz_Ty5OgubSeKm7j1hAXzPvbxP7JafLREoAvUpyPhOWil1Sdrm4VBNTBEtUwX9wWw/exec';

const NEWS_FEEDS = [
  { url: 'https://www.rotoworld.com/rss/feeds/baseball.xml', source: 'RotoWorld' },
  { url: 'https://www.rotoballer.com/player-news/feed?sport=mlb', source: 'RotoBaller' },
  { url: 'https://www.rotoballer.com/feed?post_type=player_news&sport=mlb', source: 'RotoBaller' },
  { url: 'https://www.cbssports.com/rss/headlines/fantasy-baseball/', source: 'CBS Sports' },
  { url: 'https://www.fantasysp.com/rss/mlb/allplayer/', source: 'FantasySP' }
];

exports.handler = async function(event) {
  // Support both GET (query params) and POST (JSON body)
  let params = event.queryStringParameters || {};
  if (event.httpMethod === 'POST' && event.body) {
    try {
      const bodyParams = JSON.parse(event.body);
      params = Object.assign({}, params, bodyParams);
    } catch(e) { /* ignore parse error, use query params */ }
  }

  // Handle news fetching directly here (not via GAS)
  if (params.action === 'fetchNews') {
    return handleFetchNews();
  }

  // Rotowire API news — fetch directly from Netlify to avoid GAS timeout
  if (params.action === 'fetchRotowireAPI') {
    return handleFetchRotowireAPI(params);
  }

  // All other actions: proxy to GAS
  const qs = Object.keys(params).map(k => k + '=' + encodeURIComponent(params[k])).join('&');
  const url = GAS_URL + (qs ? '?' + qs : '');

  // Use POST for actions with large payloads (recap text, results)
  const usePOST = (params.action === 'setRecap' || params.action === 'writeResults' || params.action === 'setPowerRankings') && qs.length > 2000;

  try {
    const body = usePOST ? await postToUrl(GAS_URL, params) : await fetchUrl(url);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: body
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};

async function handleFetchNews() {
  const allItems = [];
  const seen = new Set();
  const sources = [];

  for (const feed of NEWS_FEEDS) {
    try {
      const xml = await fetchUrl(feed.url);
      if (!xml || (!xml.includes('<rss') && !xml.includes('<feed'))) continue;
      const items = parseRss(xml);
      if (items.length > 0) {
        sources.push(feed.url);
        items.forEach(item => {
          // Tag each item with its feed source
          item.source = feed.source;
          // Deduplicate by normalized title
          const key = (item.title || '').toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 80);
          if (key && !seen.has(key)) {
            seen.add(key);
            allItems.push(item);
          }
        });
      }
    } catch(e) {
      // try next feed
    }
  }

  if (allItems.length > 0) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, items: allItems, source: sources.join(', ') })
    };
  }

  // Fallback: MLB transactions (no external auth needed)
  try {
    const today = fmtDate(new Date());
    const weekAgo = fmtDate(new Date(Date.now() - 7 * 86400000));
    const url = `https://statsapi.mlb.com/api/v1/transactions?startDate=${weekAgo}&endDate=${today}&sportId=1`;
    const body = await fetchUrl(url);
    const data = JSON.parse(body);
    const items = (data.transactions || []).reverse().map(t => ({
      title: (t.person ? t.person.fullName : '') + ': ' + (t.typeDesc || ''),
      desc: t.description || '',
      link: '',
      pubDate: t.date ? new Date(t.date + 'T12:00:00Z').toUTCString() : '',
      mlbId: t.person ? t.person.id : null,
      source: 'MLB'
    })).filter(i => i.title.trim() !== ':');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, items: items, source: 'mlb-transactions' })
    };
  } catch(e) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: e.message })
    };
  }
}

async function handleFetchRotowireAPI(params) {
  const apiKey = 'q9s65ss3n1hfq5018c2j';
  const endpoint = params.endpoint || 'news'; // 'news' or 'injuries'
  let url;
  if (endpoint === 'injuries') {
    url = 'https://api.rotowire.com/Baseball/MLB/Injuries.php?key=' + apiKey + '&format=json';
  } else {
    url = 'https://api.rotowire.com/Baseball/MLB/News.php?key=' + apiKey + '&format=json&hours=48';
  }
  try {
    const body = await fetchUrl(url);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: body
    };
  } catch(err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
}

function parseRss(xml) {
  const items = [];
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  for (const block of itemBlocks) {
    const title = stripTags(getTag(block, 'title'));
    const desc = stripTags(getTag(block, 'description'));
    const link = getTag(block, 'link');
    const pubDate = getTag(block, 'pubDate');
    if (title) items.push({ title, desc, link, pubDate });
  }
  return items;
}

function getTag(xml, tag) {
  const m = xml.match(new RegExp('<' + tag + '[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/' + tag + '>')) ||
            xml.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>'));
  return m ? m[1].trim() : '';
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10).replace(/-/g, '/').split('/').join('/');
}

function postToUrl(url, params) {
  return new Promise((resolve, reject) => {
    const qs = Object.keys(params).map(k => k + '=' + encodeURIComponent(params[k])).join('&');
    const lib = url.startsWith('https') ? https : http;
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      }
    };
    const req = lib.request(options, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // GAS redirects — follow with GET
        resolve(fetchUrl(res.headers.location, 0));
        return;
      }
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(qs);
    req.end();
  });
}

function fetchUrl(url, redirects) {
  redirects = redirects || 0;
  if (redirects > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchUrl(res.headers.location, redirects + 1));
        return;
      }
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}
