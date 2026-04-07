// Netlify serverless function: netlify/functions/generate-preseason-preview.js
// Generates AI-powered preseason preview using the Claude API (Sonnet).
// Requires CLAUDE_API_KEY environment variable set in Netlify.

const https = require('https');

exports.handler = async function(event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST required' }) };
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'API key not configured' }) };
  }

  let params;
  try {
    params = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Invalid JSON' }) };
  }

  const prompt = buildPrompt(params);

  try {
    const result = await callClaude(apiKey, prompt);
    let parsed;
    try {
      let cleaned = result.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      }
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      return {
        statusCode: 200, headers,
        body: JSON.stringify({ success: false, error: 'Failed to parse JSON: ' + parseErr.message, raw: result })
      };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, preview: parsed }) };
  } catch (err) {
    return { statusCode: 200, headers, body: JSON.stringify({ success: false, error: err.message }) };
  }
};

function buildPrompt(params) {
  const { teamKeys, teams, fullRosters, champions, hofClass2026, schedule } = params;

  let teamsBlock = '';
  if (teams && teams.length) {
    teamsBlock = 'ALL 12 TEAMS:\n';
    teams.forEach(t => {
      teamsBlock += `- ${t.teamName} (Owner: ${t.owner}, Division: ${t.div}, Championships: ${t.titles || 0}${t.lastTitle ? ', Last Title: ' + t.lastTitle : ', Never won'})\n`;
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

  return `You are a seasoned fantasy baseball columnist who has covered the CVC Fantasy Baseball League for all 30 years of its existence (Est. 1997). Write the official 2026 Season Preview.

LEAGUE FORMAT:
- 12 teams, 3 divisions (East, Central, West) of 4 teams each
- Head-to-head categories: 13 categories (AVG, OBP, R, HR, RBI, SB, TB, W+QS, SV+HLD, IP, K, ERA, WHIP)
- 36-game regular season, each matchup period covers ~5 days
- Top 6 teams make playoffs: Wild Card Series, Divisional Series, World Series
${scheduleBlock}

NOTABLE CVC HISTORY & STORYLINES:
- Shawn Gidley (Vipers) and Jamie Yane (Four Horsemen) are tied at 6 titles each — the defining rivalry of CVC history. Shawn won the 2025 title; Jamie won back-to-back in 2023-2024.
- Keith Cromer (American Dreams) has 4 titles including a back-to-back in 2013-2014, but hasn't won since 2021.
- Dan Osicki (Legion of Doom) has 4 titles but last won in 2022.
- Brian (Bomb Squad) has NEVER WON a championship in 29 years of CVC — the longest drought in league history. He's the lovable underdog.
- Jonas Pattie (Super Snuffleupagus) has 1 title (2017) and has been quiet since.
- Greg Akagi (SF Jones123) won in 2008 and has been building through the draft.
- Sam (X-Thome Fan) and Jason (Heiden's Hardtimes) have never won a title.
- Bill Krause (Billy Goats Gruff, formerly Pimp Mack Daddies) won in 2012.
- David Zaccarine (Hitmen) won twice (2003, 2009) but has been rebuilding.
- David Sotka (Legends, now Boys of Summer) won in 2002.

${teamsBlock}
${champBlock}
${hofBlock}
${rosterBlock}

WRITING STYLE:
- Write like you've been covering this league for 30 years — you know these owners, their tendencies, their heartbreaks
- Be bold and opinionated, not generic. Take sides. Make predictions you'd stand behind.
- Reference specific players from each team's 2026 roster
- Weave CVC history into the analysis naturally — don't list facts, tell stories ("Brian has been knocking on this door since 2004...")
- The 2026 HOF class (Pujols, Cano, Mauer, Hudson, Teixeira) is a big storyline — Greg's SF Jones123 has 3 of the 5 inductees
- Keep blurbs punchy and specific. No filler.
- Make the bold predictions genuinely bold — not obvious

RESPOND WITH ONLY valid JSON. No preamble. No markdown backticks. No explanation before or after the JSON.

The JSON object must have exactly these fields:
{
  "headline": "A bold, dramatic one-line headline for the 2026 season preview",
  "predictedChampion": {
    "teamKey": "owner_key",
    "teamName": "team name",
    "owner": "owner full name",
    "blurb": "2-3 paragraph analysis of why this team will win the 2026 title. Be specific about roster strengths, key players, and why they're the favorite. Reference their history."
  },
  "predictedStandings": [
    {
      "rank": 1,
      "teamKey": "owner_key",
      "teamName": "team name",
      "owner": "owner name",
      "predictedRecord": "26-10",
      "blurb": "2-3 sentence scouting report — witty, opinionated, specific to their 2026 roster and CVC history"
    }
  ],
  "onesToWatch": [
    {
      "title": "Storyline title",
      "description": "2-3 sentence description"
    }
  ],
  "boldPredictions": [
    "Bold prediction statement"
  ],
  "hofNote": "1-2 sentences about the 2026 Hall of Fame class and what it means for those teams"
}

REQUIREMENTS:
- predictedStandings must have exactly 12 teams ranked 1-12 with realistic records (36-game season)
- onesToWatch must have exactly 4 storylines
- boldPredictions must have exactly 5 predictions
- teamKey must match one of: ${teamKeys ? teamKeys.join(', ') : 'N/A'}

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
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.content && data.content[0] && data.content[0].text) {
            resolve(data.content[0].text);
          } else if (data.error) {
            reject(new Error(data.error.message || 'API error'));
          } else {
            reject(new Error('Unexpected API response'));
          }
        } catch (e) {
          reject(new Error('Failed to parse API response'));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(25000, () => { req.destroy(); reject(new Error('API timeout')); });
    req.write(postData);
    req.end();
  });
}
