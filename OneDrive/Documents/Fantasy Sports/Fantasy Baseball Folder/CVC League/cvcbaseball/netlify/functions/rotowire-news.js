// Netlify serverless function: rotowire-news.js
// Scrapes the full RotoWire baseball news page and returns structured JSON.
// Results are cached in-memory for 15 minutes.

const https = require('https');
const http = require('http');

const ROTOWIRE_URLS = [
  'https://www.rotowire.com/baseball/news.php',
  'https://www.rotowire.com/baseball/news.php?view=minors',
  'https://www.rotowire.com/baseball/news.php?view=prospects'
];
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

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

  // Return cached data if fresh
  if (_cache.data && (Date.now() - _cache.ts) < CACHE_TTL) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, items: _cache.data, source: 'rotowire-scrape', cached: true })
    };
  }

  try {
    // Fetch all three pages in parallel
    const allItems = [];
    const seen = new Set();
    const fetches = ROTOWIRE_URLS.map(url =>
      fetchUrl(url).then(html => parseRotoWireHTML(html)).catch(() => [])
    );
    const results = await Promise.all(fetches);
    results.forEach(items => {
      items.forEach(item => {
        // Deduplicate by title
        const key = (item.title || '').toLowerCase().trim().slice(0, 80);
        if (key && !seen.has(key)) {
          seen.add(key);
          allItems.push(item);
        }
      });
    });

    if (allItems.length > 0) {
      _cache = { data: allItems, ts: Date.now() };
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, items: allItems, source: 'rotowire-scrape', cached: false })
      };
    }

    // Scrape returned no results — return empty so front end can fall back to RSS
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: false, items: [], source: 'rotowire-scrape', error: 'No items parsed' })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: false, items: [], source: 'rotowire-scrape', error: err.message })
    };
  }
};

function parseRotoWireHTML(html) {
  const items = [];
  if (!html) return items;

  // RotoWire news page uses divs with class "news-update" for each item.
  // Each news-update contains:
  //   - a.news-update__player-link or .news-update__header with player name
  //   - .news-update__timestamp with time
  //   - .news-update__headline with headline text
  //   - .news-update__news-body or .news-update__text with body text
  //   - team info in .news-update__team or near the player name

  // Strategy 1: Match news-update blocks
  const blocks = html.match(/<div\s+class="news-update[^"]*"[\s\S]*?(?=<div\s+class="news-update[^"]*"|<\/main|<footer|$)/g) || [];

  for (const block of blocks) {
    const item = parseNewsBlock(block);
    if (item && item.title) {
      items.push(item);
    }
  }

  // Strategy 2: If no news-update blocks, try alternate structure
  if (items.length === 0) {
    const altBlocks = html.match(/<div\s+class="[^"]*(?:news-item|player-news|news_item)[^"]*"[\s\S]*?(?=<div\s+class="[^"]*(?:news-item|player-news|news_item)|<\/main|<footer|$)/g) || [];
    for (const block of altBlocks) {
      const item = parseNewsBlockAlt(block);
      if (item && item.title) {
        items.push(item);
      }
    }
  }

  return items;
}

function parseNewsBlock(block) {
  // Player name — try multiple selectors
  let playerName = extractText(block, /class="[^"]*news-update__player-link[^"]*"[^>]*>([^<]+)</);
  if (!playerName) playerName = extractText(block, /class="[^"]*news-update__header[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)/);
  if (!playerName) playerName = extractText(block, /class="[^"]*player-name[^"]*"[^>]*>([^<]+)/);
  if (!playerName) playerName = extractText(block, /<a[^>]*href="[^"]*\/baseball\/player[^"]*"[^>]*>([^<]+)/);
  if (!playerName) playerName = extractText(block, /<h\d[^>]*>([^<]+)/);

  // Team — look for team abbreviation
  let team = extractText(block, /class="[^"]*news-update__team[^"]*"[^>]*>([^<]+)/);
  if (!team) team = extractText(block, /class="[^"]*team[^"]*"[^>]*>\s*(?:<[^>]+>)*\s*([A-Z]{2,3})\b/);
  if (!team) {
    // Try to extract from position-team patterns like "SP - NYY"
    const posTeam = block.match(/(?:SP|RP|C|1B|2B|3B|SS|LF|CF|RF|DH|OF)\s*[-–]\s*([A-Z]{2,3})/);
    if (posTeam) team = posTeam[1];
  }

  // Headline
  let headline = extractText(block, /class="[^"]*news-update__headline[^"]*"[^>]*>([\s\S]*?)<\//);
  if (!headline) headline = extractText(block, /class="[^"]*headline[^"]*"[^>]*>([\s\S]*?)<\//);

  // Body text
  let body = extractText(block, /class="[^"]*news-update__news[^"]*"[^>]*>([\s\S]*?)<\/(?:div|p)/);
  if (!body) body = extractText(block, /class="[^"]*news-update__text[^"]*"[^>]*>([\s\S]*?)<\/(?:div|p)/);
  if (!body) body = extractText(block, /class="[^"]*news-body[^"]*"[^>]*>([\s\S]*?)<\/(?:div|p)/);
  if (!body) body = extractText(block, /class="[^"]*(?:analysis|comment|blurb)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|p)/);

  // Timestamp
  let timestamp = extractText(block, /class="[^"]*news-update__timestamp[^"]*"[^>]*>([\s\S]*?)<\//);
  if (!timestamp) timestamp = extractText(block, /class="[^"]*timestamp[^"]*"[^>]*>([\s\S]*?)<\//);
  if (!timestamp) timestamp = extractText(block, /class="[^"]*date[^"]*"[^>]*>([\s\S]*?)<\//);
  if (!timestamp) timestamp = extractText(block, /class="[^"]*time[^"]*"[^>]*>([\s\S]*?)<\//);

  // Link
  let link = '';
  const linkMatch = block.match(/<a[^>]*href="([^"]*\/baseball\/player[^"]*)"/);
  if (linkMatch) link = 'https://www.rotowire.com' + (linkMatch[1].startsWith('/') ? '' : '/') + linkMatch[1];

  if (!playerName) return null;

  playerName = stripTags(playerName).trim();
  team = team ? stripTags(team).trim() : '';
  headline = headline ? stripTags(headline).trim() : '';
  body = body ? stripTags(body).trim() : '';
  timestamp = timestamp ? stripTags(timestamp).trim() : '';

  // Build title in "Player Name: headline" format to match existing RSS format
  const title = playerName + (headline ? ': ' + headline : '');
  const desc = body || headline || '';

  return {
    title: title,
    desc: desc,
    link: link,
    pubDate: parseTimestamp(timestamp),
    playerName: playerName,
    team: team,
    source: 'RotoWire'
  };
}

function parseNewsBlockAlt(block) {
  // Fallback parser for alternate HTML structures
  let playerName = extractText(block, /<a[^>]*>([^<]+)/);
  let body = extractText(block, /class="[^"]*(?:text|body|desc|blurb|content)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|p)/);
  let timestamp = extractText(block, /class="[^"]*(?:time|date|stamp)[^"]*"[^>]*>([\s\S]*?)<\//);

  if (!playerName) return null;

  playerName = stripTags(playerName).trim();
  body = body ? stripTags(body).trim() : '';
  timestamp = timestamp ? stripTags(timestamp).trim() : '';

  return {
    title: playerName + (body ? ': ' + body.substring(0, 120) : ''),
    desc: body,
    link: '',
    pubDate: parseTimestamp(timestamp),
    playerName: playerName,
    team: '',
    source: 'RotoWire'
  };
}

function parseTimestamp(str) {
  if (!str) return '';
  // RotoWire uses formats like "Mar 12, 2026 10:30 AM ET", "2h ago", "Yesterday"
  // Try to parse into an RFC 2822 date string

  // Already a parseable date?
  const d = new Date(str);
  if (!isNaN(d.getTime()) && d.getFullYear() > 2000) {
    return d.toUTCString();
  }

  // Relative times: "Xh ago", "Xm ago"
  const relHours = str.match(/(\d+)\s*h(?:ours?)?\s*ago/i);
  if (relHours) {
    return new Date(Date.now() - parseInt(relHours[1]) * 3600000).toUTCString();
  }
  const relMins = str.match(/(\d+)\s*m(?:in(?:ute)?s?)?\s*ago/i);
  if (relMins) {
    return new Date(Date.now() - parseInt(relMins[1]) * 60000).toUTCString();
  }
  const relDays = str.match(/(\d+)\s*d(?:ays?)?\s*ago/i);
  if (relDays) {
    return new Date(Date.now() - parseInt(relDays[1]) * 86400000).toUTCString();
  }
  if (/yesterday/i.test(str)) {
    return new Date(Date.now() - 86400000).toUTCString();
  }

  return str; // Return raw if we can't parse
}

function extractText(html, regex) {
  const m = html.match(regex);
  return m ? m[1] : '';
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function fetchUrl(url, redirects) {
  redirects = redirects || 0;
  if (redirects > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
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
