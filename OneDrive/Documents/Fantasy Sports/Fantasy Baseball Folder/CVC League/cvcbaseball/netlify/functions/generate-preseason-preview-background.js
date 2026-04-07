// Netlify Background Function: generate-preseason-preview-background.js
// Netlify auto-detects the -background suffix → 15 minute timeout, returns 202 immediately.
// Calls Claude API, then saves the result directly to GAS (period 0).

const https = require('https');
const http = require('http');

const GAS_URL = 'https://script.google.com/macros/s/AKfycbz_Ty5OgubSeKm7j1hAXzPvbxP7JafLREoAvUpyPhOWil1Sdrm4VBNTBEtUwX9wWw/exec';

exports.handler = async function(event) {
  const fnStart = Date.now();
  console.log('='.repeat(60));
  console.log('[BG] Background function STARTED at', new Date().toISOString());
  console.log('[BG] HTTP method:', event.httpMethod);
  console.log('[BG] Body present:', !!event.body);
  console.log('[BG] Body length:', event.body ? event.body.length : 0);
  console.log('[BG] Body preview (first 200 chars):', event.body ? event.body.substring(0, 200) : 'N/A');
  console.log('[BG] Event keys:', Object.keys(event).join(', '));

  // Check ALL environment variables related to API keys
  const apiKey = process.env.CLAUDE_API_KEY;
  console.log('[BG] === ENV CHECK ===');
  console.log('[BG] CLAUDE_API_KEY present:', !!apiKey);
  console.log('[BG] CLAUDE_API_KEY length:', apiKey ? apiKey.length : 0);
  console.log('[BG] CLAUDE_API_KEY starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
  console.log('[BG] CLAUDE_API_KEY ends with:', apiKey ? '...' + apiKey.substring(apiKey.length - 4) : 'N/A');
  console.log('[BG] NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('[BG] CONTEXT:', process.env.CONTEXT || 'not set');
  console.log('[BG] === END ENV CHECK ===');

  if (!apiKey) {
    console.error('[BG] FATAL: CLAUDE_API_KEY not configured. Check Netlify environment variables.');
    console.log('[BG] Function EXITING (no API key) after', Date.now() - fnStart, 'ms');
    return;
  }

  let params;
  try {
    params = JSON.parse(event.body);
    console.log('[BG] Parsed params OK. Keys:', Object.keys(params).join(', '));
    console.log('[BG] teamKeys:', params.teamKeys ? JSON.stringify(params.teamKeys) : 'MISSING');
    console.log('[BG] teams count:', params.teams ? params.teams.length : 'MISSING');
    console.log('[BG] fullRosters keys:', params.fullRosters ? Object.keys(params.fullRosters).join(', ') : 'MISSING');
    console.log('[BG] champions count:', params.champions ? params.champions.length : 'MISSING');
    console.log('[BG] hofClass2026 count:', params.hofClass2026 ? params.hofClass2026.length : 'MISSING');
    console.log('[BG] schedule present:', !!params.schedule);
  } catch (e) {
    console.error('[BG] FATAL: Failed to parse event.body:', e.message);
    console.error('[BG] Raw body (first 300):', event.body ? event.body.substring(0, 300) : 'null/undefined');
    console.log('[BG] Function EXITING (parse error) after', Date.now() - fnStart, 'ms');
    return;
  }

  console.log('[BG] Building prompt...');
  const prompt = buildPrompt(params);
  console.log('[BG] Prompt built. Length:', prompt.length, 'chars');
  console.log('[BG] Prompt preview (first 300 chars):', prompt.substring(0, 300));
  console.log('[BG] Prompt end (last 200 chars):', prompt.substring(prompt.length - 200));

  // Step 1: Call Claude API
  console.log('[BG] === CALLING CLAUDE API ===');
  console.log('[BG] Model: claude-sonnet-4-20250514');
  console.log('[BG] Max tokens: 4000');
  console.log('[BG] API endpoint: https://api.anthropic.com/v1/messages');
  const claudeStart = Date.now();

  try {
    const result = await callClaude(apiKey, prompt);
    const claudeMs = Date.now() - claudeStart;
    console.log('[BG] === CLAUDE API SUCCESS ===');
    console.log('[BG] Claude API responded in', claudeMs, 'ms');
    console.log('[BG] Response length:', result.length, 'chars');
    console.log('[BG] Response first 200 chars:', result.substring(0, 200));
    console.log('[BG] Response last 100 chars:', result.substring(result.length - 100));

    let parsed;
    let cleaned = result.trim();
    if (cleaned.startsWith('```')) {
      console.log('[BG] Stripping markdown code fences from response');
      cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    try {
      parsed = JSON.parse(cleaned);
      console.log('[BG] JSON parsed OK. Top-level keys:', Object.keys(parsed).join(', '));
      console.log('[BG] predictedStandings count:', parsed.predictedStandings ? parsed.predictedStandings.length : 'MISSING');
      console.log('[BG] boldPredictions count:', parsed.boldPredictions ? parsed.boldPredictions.length : 'MISSING');
      console.log('[BG] onesToWatch count:', parsed.onesToWatch ? parsed.onesToWatch.length : 'MISSING');
      console.log('[BG] headline:', parsed.headline ? parsed.headline.substring(0, 80) : 'MISSING');
      console.log('[BG] predictedChampion:', parsed.predictedChampion ? parsed.predictedChampion.teamName : 'MISSING');
    } catch (parseErr) {
      console.error('[BG] FATAL: Failed to parse Claude response as JSON:', parseErr.message);
      console.error('[BG] Raw response (first 500 chars):', cleaned.substring(0, 500));
      console.log('[BG] Function EXITING (JSON parse error) after', Date.now() - fnStart, 'ms');
      return;
    }

    // Stamp generation time
    parsed._generatedAt = new Date().toISOString();
    console.log('[BG] Stamped _generatedAt:', parsed._generatedAt);

    // Step 2: Save to GAS
    const payloadJson = JSON.stringify(parsed);
    console.log('[BG] === SAVING TO GAS ===');
    console.log('[BG] GAS URL:', GAS_URL);
    console.log('[BG] Action: setPowerRankings, Period: 0');
    console.log('[BG] rankings_json payload size:', payloadJson.length, 'chars');
    console.log('[BG] URL-encoded payload estimated size:', encodeURIComponent(payloadJson).length, 'chars');
    const gasStart = Date.now();

    try {
      const gasResult = await saveToGAS(parsed);
      const gasMs = Date.now() - gasStart;
      console.log('[BG] === GAS SAVE SUCCESS ===');
      console.log('[BG] GAS save completed in', gasMs, 'ms');
      console.log('[BG] GAS response:', typeof gasResult === 'string' ? gasResult.substring(0, 500) : JSON.stringify(gasResult));
    } catch (gasErr) {
      console.error('[BG] === GAS SAVE FAILED ===');
      console.error('[BG] GAS save error:', gasErr.message);
      console.error('[BG] GAS save error stack:', gasErr.stack);
    }

    const totalMs = Date.now() - fnStart;
    console.log('[BG] === FUNCTION COMPLETED SUCCESSFULLY ===');
    console.log('[BG] Total runtime:', totalMs, 'ms (' + (totalMs / 1000).toFixed(1) + 's)');
    console.log('[BG] Finished at:', new Date().toISOString());
    console.log('='.repeat(60));
  } catch (err) {
    const claudeMs = Date.now() - claudeStart;
    console.error('[BG] === CLAUDE API FAILED ===');
    console.error('[BG] Claude API error after', claudeMs, 'ms:', err.message);
    console.error('[BG] Error stack:', err.stack);
    console.log('[BG] Function EXITING (Claude error) after', Date.now() - fnStart, 'ms');
  }
};

// ── SAVE TO GAS ─────────────────────────────────────────────────────────────

function saveToGAS(preview) {
  const params = {
    action: 'setPowerRankings',
    period: '0',
    rankings_json: JSON.stringify(preview)
  };
  return postToUrl(GAS_URL, params);
}

function postToUrl(url, params) {
  return new Promise((resolve, reject) => {
    const qs = Object.keys(params).map(k => k + '=' + encodeURIComponent(params[k])).join('&');
    console.log('[BG] POST to:', url);
    console.log('[BG] POST body length:', qs.length, 'chars');
    const parsed = new URL(url);
    const lib = url.startsWith('https') ? https : http;
    const bodyBuffer = Buffer.from(qs, 'utf8');
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + (parsed.search || ''),
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': bodyBuffer.length,
        'User-Agent': 'Mozilla/5.0'
      }
    };
    const req = lib.request(options, res => {
      console.log('[BG] POST response status:', res.statusCode);
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log('[BG] Following redirect to:', res.headers.location);
        resolve(fetchUrl(res.headers.location, 0));
        return;
      }
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        console.log('[BG] POST response body length:', body.length);
        resolve(body);
      });
    });
    req.on('error', (err) => {
      console.error('[BG] POST request error:', err.message);
      reject(err);
    });
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('GAS timeout')); });
    req.write(bodyBuffer);
    req.end();
  });
}

function fetchUrl(url, redirects) {
  redirects = redirects || 0;
  if (redirects > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    console.log('[BG] GET (redirect #' + redirects + '):', url.substring(0, 100) + '...');
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      console.log('[BG] GET response status:', res.statusCode);
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log('[BG] Following redirect to:', res.headers.location.substring(0, 100) + '...');
        resolve(fetchUrl(res.headers.location, redirects + 1));
        return;
      }
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        console.log('[BG] GET response body length:', body.length);
        resolve(body);
      });
    });
    req.on('error', (err) => {
      console.error('[BG] GET request error:', err.message);
      reject(err);
    });
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ── CLAUDE API ──────────────────────────────────────────────────────────────

function buildPrompt(params) {
  const { teamKeys, teams, fullRosters, champions, hofClass2026, schedule } = params;

  let teamsBlock = '';
  if (teams && teams.length) {
    teamsBlock = 'ALL 12 TEAMS:\n';
    teams.forEach(t => {
      const seasons = t.seasonsInLeague || t.seasons_in_league || '';
      teamsBlock += `- ${t.teamName} (Owner: ${t.owner}, Division: ${t.div}, Championships: ${t.titles || 0}${t.lastTitle ? ', Last Title: ' + t.lastTitle : ', Never won'}${seasons ? ', Seasons in league: ' + seasons : ''})\n`;
    });
  }

  let rosterBlock = '';
  if (fullRosters) {
    rosterBlock = '\nFULL 2026 ROSTERS:\n';
    Object.keys(fullRosters).forEach(key => {
      rosterBlock += '\n' + key + ':\n' + fullRosters[key] + '\n';
    });
  }

  let champBlock = '';
  if (champions && champions.length) {
    champBlock = '\nRECENT CHAMPIONS:\n';
    champions.slice(0, 10).forEach(c => {
      champBlock += `${c.year}: ${c.team} (${c.owner})\n`;
    });
  }

  let hofBlock = '';
  if (hofClass2026 && hofClass2026.length) {
    hofBlock = '\n2026 CVC HALL OF FAME CLASS:\n';
    hofClass2026.forEach(h => {
      hofBlock += `- ${h.player} (${h.pos}) — originally rostered by ${h.team}\n`;
    });
  }

  let scheduleBlock = '';
  if (schedule) {
    scheduleBlock = `\nSCHEDULE: ${schedule}\n`;
  }

  return `You are a seasoned fantasy baseball columnist covering the CVC Fantasy Baseball League (Est. 1997). Write the official 2026 Season Preview.

LEAGUE FORMAT:
- 12 teams, 3 divisions (East, Central, West) of 4 teams each
- Head-to-head categories: 13 categories (AVG, OBP, R, HR, RBI, SB, TB, W+QS, SV+HLD, IP, K, ERA, WHIP)
- 36-game regular season, each matchup period covers ~5 days
- Top 6 teams make playoffs: Wild Card Series, Divisional Series, World Series
- Dynasty league with 35-player rosters. The 2026 draft (March 22) is only 3 rounds — current rosters ARE the teams.
${scheduleBlock}

2025 PLAYOFF RESULTS:
- Wild Card: Jamie (Four Horsemen) and Brian (Bomb Squad) advanced
- Divisional Series: Shawn (Vipers) defeated Brian 3-2; Bill (Billy Goats Gruff) defeated Jamie 3-1
- World Series: Shawn (Vipers) defeated Bill 3-2, coming back from 0-2 down
- Shawn won his record 7th title. He is the DEFENDING CHAMPION entering 2026.
- Bill was ONE GAME from his second title — led the World Series 2-0 before losing three straight.
- Brian made the playoffs and pushed Shawn to 5 games — his best run in 22 seasons without a title.
- Jamie was eliminated in the Divisional Series. His 2023-2024 back-to-back streak is over.

2024: Jamie (Four Horsemen) defeated Greg (SF Jones123) 3-1 in the World Series for his second straight title.

OWNER HISTORIES:
- Shawn Gidley (Vipers): 7 titles, founding member. DEFENDING CHAMPION. Won 4 of last 7.
- Jamie Yane (Four Horsemen): 6 titles, founding member. Back-to-back 2023-2024 but eliminated in 2025 playoffs. NOT defending champion.
- Keith Cromer (American Dreams): 5 titles, founding member. Last won 2021.
- Dan Osicki (Legion of Doom): 4 titles, founding member. Last won 2022.
- Bill Krause (Billy Goats Gruff): 1 title in 2012, joined 2003. Led the 2025 World Series 2-0 over Shawn before losing three straight — one win from the title. Bill's 2025 run MUST be a major storyline in his blurb.
- Brian Pattie (Bomb Squad): 0 titles, joined 2004 (22 seasons in the league). Longest active drought is 22 YEARS not longer. 2025 playoff team. Never reference Brian with any number other than 22 for his tenure or drought.
- Jonas Pattie (Super Snuffleupagus): 1 title in 2017, joined 2000.
- Greg Akagi (SF Jones123): 1 title in 2008, founding member. Lost 2024 World Series.
- David Zaccarine (Hitmen): 2 titles (2003, 2009), founding member. Rebuilding.
- David Sotka/Ryks (Boys of Summer): 1 title in 2002, joined 2008.
- Sam Klco (X-Thome Fan): 0 titles, joined 2005.
- Jason Heiden (Heiden's Hardtimes): 0 titles, joined 2006.

2026 CVC HALL OF FAME CLASS:
- Albert Pujols (1B) — Jamie's Four Horsemen (rostered longest)
- Robinson Cano (2B) — Sam's X-Thome Fan (Sam's first HOF inductee)
- Tim Hudson (SP) — Greg's SF Jones123 (rostered longest)
- Joe Mauer (C) — Greg's SF Jones123 (rostered longest)
- Mark Teixeira (1B) — Greg's SF Jones123 (rostered longest)
Greg has 3 of the 5 inductees. HOF is determined by which owner rostered the player the longest.

${teamsBlock}
${champBlock}
${rosterBlock}

RULES FOR WRITING:
1. Shawn is the ONLY defending champion. Do not frame Jamie as defending or current champion.
2. Not every owner has been in the league since 1997. Brian joined in 2004 — his drought is exactly 22 years. Never use any other number for Brian's tenure or drought.
3. Do NOT use the words "rookie" or "prospect" for any player who has already played in the MLB. A player who debuted in 2024 (like Paul Skenes) is a third-year player. A player who debuted in 2025 is a second-year player. Only players making their actual first MLB appearance in 2026 can be called rookies. Players already on MLB rosters are established players, not prospects.
4. Base all predictions on the current 35-man rosters. This is a dynasty league — these rosters are mostly set.
5. Reference 2025 playoff results when discussing each team's trajectory.
6. Be bold, opinionated, and specific. Name real players from each roster. No filler.

CONSISTENCY IS MANDATORY:
- The predictedChampion MUST be the rank 1 team in predictedStandings. They are the same team.
- boldPredictions MUST NOT contradict the predictedChampion or predictedStandings. If you predict Team A wins the title, do not also predict they miss the playoffs or World Series.
- If you predict a team wins the championship in boldPredictions, it MUST be the same team as predictedChampion.
- onesToWatch storylines must be consistent with your standings and champion pick.
- Review all fields together before outputting. Every prediction must form one coherent narrative.

RESPOND WITH ONLY valid JSON. No preamble. No markdown. No explanation.

{
  "headline": "A bold one-line headline for the 2026 season preview (do not reference any number of years unless it matches an owner's exact tenure)",
  "predictedChampion": {
    "teamKey": "owner_key (must match rank 1 in predictedStandings)",
    "teamName": "team name",
    "owner": "owner full name",
    "blurb": "2-3 paragraph analysis of why this team wins the 2026 title. Reference roster strengths, key players, and history."
  },
  "predictedStandings": [
    {
      "rank": 1,
      "teamKey": "owner_key (rank 1 MUST be the predictedChampion)",
      "teamName": "team name",
      "owner": "owner name",
      "predictedRecord": "26-10",
      "blurb": "2-3 sentence scouting report — witty, opinionated, roster-specific. Do not call established MLB players rookies or prospects."
    }
  ],
  "onesToWatch": [
    {
      "title": "Storyline title",
      "description": "2-3 sentence description (must not contradict other predictions)"
    }
  ],
  "boldPredictions": [
    "Bold prediction (must not contradict predictedChampion or predictedStandings)"
  ],
  "hofNote": "1-2 sentences about the 2026 Hall of Fame class and what it means for those teams"
}

REQUIREMENTS:
- predictedStandings: exactly 12 teams ranked 1-12, realistic records (36-game season)
- onesToWatch: exactly 4 storylines
- boldPredictions: exactly 5 predictions
- teamKey must match one of: ${teamKeys ? teamKeys.join(', ') : 'N/A'}
- predictedChampion.teamKey MUST equal predictedStandings[0].teamKey
- No prediction in any field may contradict any other prediction

CRITICAL MATHEMATICAL RULES — you must follow these exactly:
- Predicted W/L: the league as a whole must finish exactly .500. Total predicted wins across all 12 teams MUST equal total predicted losses across all 12 teams.
- In a 36-game season with 12 teams, there are 216 total matchups (each producing 1 win + 1 loss). So total wins across the league = 216 and total losses = 216. Each team plays 36 games so W+L must equal 36 for every team.
- No team can be predicted to go undefeated (36-0) or winless (0-36). The worst predicted record should be no worse than about 8-28 and the best no better than about 28-8.
- Before finalizing, verify: sum all 12 teams' predicted wins and confirm the total equals 216. Sum all 12 teams' predicted losses and confirm that also equals 216. If they don't match, recalculate until they do.

- JSON only. Nothing else.`;
}

function callClaude(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    console.log('[BG] Claude request payload size:', postData.length, 'chars');

    const postBuffer = Buffer.from(postData, 'utf8');
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postBuffer.length,
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    };

    const req = https.request(options, (res) => {
      console.log('[BG] Claude HTTP status:', res.statusCode);
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('[BG] Claude response body length:', body.length);
        try {
          const data = JSON.parse(body);
          if (data.content && data.content[0] && data.content[0].text) {
            console.log('[BG] Claude returned text content, length:', data.content[0].text.length);
            resolve(data.content[0].text);
          } else if (data.error) {
            console.error('[BG] Claude API error:', JSON.stringify(data.error));
            reject(new Error(data.error.message || 'API error'));
          } else {
            console.error('[BG] Unexpected Claude response structure:', Object.keys(data).join(', '));
            reject(new Error('Unexpected API response'));
          }
        } catch (e) {
          console.error('[BG] Failed to parse Claude response body:', body.substring(0, 300));
          reject(new Error('Failed to parse API response'));
        }
      });
    });

    req.on('error', (err) => {
      console.error('[BG] Claude request error:', err.message);
      reject(err);
    });
    req.setTimeout(120000, () => {
      console.error('[BG] Claude request timed out after 120s');
      req.destroy();
      reject(new Error('API timeout'));
    });
    req.write(postBuffer);
    req.end();
  });
}
