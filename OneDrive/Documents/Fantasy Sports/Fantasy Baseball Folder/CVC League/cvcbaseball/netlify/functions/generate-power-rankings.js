// Netlify serverless function: netlify/functions/generate-power-rankings.js
// Generates AI-powered Power Rankings using the Claude API.
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

  const isPreseason = params.mode === 'preseason';
  const prompt = isPreseason ? buildPreseasonPrompt(params) : buildPrompt(params);
  const maxTokens = isPreseason ? 4000 : 2500;

  try {
    const result = await callClaude(apiKey, prompt, maxTokens);
    // Parse JSON from Claude's response
    let parsed;
    try {
      let cleaned = result.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      }
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, error: 'Failed to parse JSON: ' + parseErr.message, raw: result })
      };
    }

    if (isPreseason) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, preview: parsed })
      };
    } else {
      if (!Array.isArray(parsed)) return { statusCode: 200, headers, body: JSON.stringify({ success: false, error: 'Response is not an array' }) };
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, rankings: parsed })
      };
    }
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};

function buildPrompt(params) {
  const { period, standings, recentResults, previousRankings, injuries, rosters, transactions } = params;

  let standingsBlock = '';
  if (standings && standings.length) {
    standingsBlock = 'CURRENT STANDINGS:\n';
    standings.forEach(function(t, i) {
      standingsBlock += (i + 1) + '. ' + t.teamName + ' (' + t.owner + ') — ' +
        t.w + '-' + t.l + (t.t ? '-' + t.t : '') +
        ', PCT ' + (t.pct || '0').toString().slice(0, 5) +
        ', GB ' + (t.gb || '—') +
        ', CW ' + (t.cw || 0) + '-CL ' + (t.cl || 0) +
        ', Streak: ' + (t.strk || '—') +
        ', L10: ' + (t.l10 || '—') +
        ', Division: ' + (t.div || '?') + '\n';
    });
  }

  let resultsBlock = '';
  if (recentResults && recentResults.length) {
    resultsBlock = '\nRECENT RESULTS (last 3 periods):\n';
    recentResults.forEach(function(r) {
      resultsBlock += 'Game ' + r.period + ': ' + r.team1Name + ' ' + r.t1CW + '-' + r.t1CL +
        (r.t1CT > 0 ? '-' + r.t1CT : '') + ' vs ' + r.team2Name + ' ' + r.t2CW + '-' + r.t2CL +
        (r.t2CT > 0 ? '-' + r.t2CT : '') + ' → Winner: ' + r.winnerName + '\n';
    });
  }

  let prevBlock = '';
  if (previousRankings && previousRankings.length) {
    prevBlock = '\nPREVIOUS POWER RANKINGS (for trend arrows):\n';
    previousRankings.forEach(function(pr) {
      prevBlock += '#' + pr.rank + ' ' + pr.teamKey + '\n';
    });
  }

  let injBlock = '';
  if (injuries) {
    injBlock = '\nINJURIES BY TEAM:\n';
    Object.keys(injuries).forEach(function(key) {
      if (injuries[key] && injuries[key].length) {
        injBlock += key + ': ' + injuries[key] + '\n';
      }
    });
  }

  let rosterBlock = '';
  if (rosters) {
    rosterBlock = '\nKEY ROSTER PLAYERS BY TEAM:\n';
    Object.keys(rosters).forEach(function(key) {
      if (rosters[key]) {
        rosterBlock += key + ': ' + rosters[key] + '\n';
      }
    });
  }

  let txnBlock = '';
  if (transactions && transactions.length) {
    txnBlock = '\nRECENT TRANSACTIONS (last 7 days):\n';
    transactions.forEach(function(t) {
      txnBlock += '- ' + t + '\n';
    });
  }

  return `You are a witty, opinionated sports columnist writing Power Rankings for the CVC Fantasy Baseball League. Rank all 12 teams from 1 (best) to 12 (worst) based on the data below.

FOR EACH TEAM write a 2-3 sentence blurb that is:
- Bold, opinionated, and fun — like Bill Simmons or an ESPN Power Rankings column
- Reference specific players, stats, or recent results when possible
- Call out struggling teams, praise hot teams, note interesting storylines
- Factor in injuries, recent transactions, momentum, and roster strength
- Vary your tone — some snarky, some complimentary, some dramatic

LEAGUE CONTEXT:
- This is the CVC Fantasy Baseball League, Est. 1997, now in its 30th season
- 12 teams, head-to-head categories league (13 categories: AVG, OBP, R, HR, RBI, SB, TB, W+QS, SV+HLD, IP, K, ERA, WHIP)
- Each matchup period the team winning more categories wins
- This is Game Period ${period}

CRITICAL MATHEMATICAL RULES — you must follow these exactly:
- Current W/L records: sum of all 12 teams' wins MUST equal sum of all 12 teams' losses. Double-check your math before responding.
- Every game has exactly one winner and one loser. Each team's games played = wins + losses.
- Before finalizing your response, verify: total wins = total losses for current records. If they don't match, recalculate until they do.

${standingsBlock}
${resultsBlock}
${prevBlock}
${injBlock}
${rosterBlock}
${txnBlock}

RESPOND WITH ONLY a valid JSON array, no preamble, no explanation, no markdown. Each element must have exactly these fields:
[
  { "rank": 1, "teamKey": "owner_key_here", "blurb": "2-3 sentence analysis here" },
  ...
]

The teamKey must match one of these exact values: ${params.teamKeys ? params.teamKeys.join(', ') : 'N/A'}

Return exactly 12 items ranked 1-12. JSON array only, nothing else.`;
}

function buildPreseasonPrompt(params) {
  const { fullRosters, teamKeys, teams } = params;

  let rosterBlock = '';
  if (fullRosters) {
    rosterBlock = 'FULL ROSTERS BY TEAM:\n';
    Object.keys(fullRosters).forEach(function(key) {
      if (fullRosters[key]) {
        rosterBlock += '\n' + key + ':\n' + fullRosters[key] + '\n';
      }
    });
  }

  let teamsBlock = '';
  if (teams && teams.length) {
    teamsBlock = 'TEAMS:\n';
    teams.forEach(function(t) {
      teamsBlock += '- ' + t.teamName + ' (Owner: ' + t.owner + ', Division: ' + t.div + ')\n';
    });
  }

  return `You are a seasoned fantasy baseball analyst writing the official 2026 Season Preview for the CVC Fantasy Baseball League. This league has been running since 1997 — it's now in its 30th season. There are 12 teams in a head-to-head categories format (13 categories: AVG, OBP, R, HR, RBI, SB, TB, W+QS, SV+HLD, IP, K, ERA, WHIP).

Write a comprehensive, entertaining preseason preview. Be bold, opinionated, and fun — like a real preseason preview magazine piece.

${teamsBlock}
${rosterBlock}

RESPOND WITH ONLY valid JSON (no preamble, no explanation, no markdown wrapping). The JSON must be an object with these exact fields:

{
  "predictedChampion": {
    "teamKey": "key_here",
    "blurb": "A full paragraph (4-6 sentences) explaining why this team will win it all. Be specific about their roster strengths, key players, and why they're the favorite."
  },
  "predictedStandings": [
    { "rank": 1, "teamKey": "key_here", "predictedRecord": "28-8", "blurb": "2-3 sentence scouting report" },
    ...all 12 teams...
  ],
  "onesToWatch": [
    { "title": "Storyline title", "blurb": "2-3 sentence description" },
    ...3-4 storylines...
  ],
  "boldPredictions": [
    "Bold prediction sentence 1",
    "Bold prediction sentence 2",
    ...5 total...
  ]
}

GUIDELINES:
- predictedStandings must include all 12 teams ranked 1-12 with realistic predicted records (36 game season)
- Each scouting report should reference specific players from that team's roster
- onesToWatch should cover rivalries, bounce-back candidates, dynasty threats, or rebuilding teams
- boldPredictions should be provocative, fun, and specific — name names and make definitive claims
- Reference roster construction, positional balance, pitching depth, and lineup quality
- The teamKey values must match exactly from: ${teamKeys ? teamKeys.join(', ') : 'N/A'}

CRITICAL MATHEMATICAL RULES — you must follow these exactly:
- Predicted W/L: the league as a whole must finish exactly .500. Total predicted wins across all 12 teams MUST equal total predicted losses across all 12 teams.
- In a 36-game season with 12 teams, there are 6 games per period × 36 periods = 216 total matchups (each producing 1 win + 1 loss). So total wins across the league = 216 and total losses = 216. Each team plays 36 games so W+L must equal 36 for every team.
- No team can be predicted to go undefeated (36-0) or winless (0-36). The worst predicted record should be no worse than about 8-28 and the best no better than about 28-8.
- Before finalizing, verify: sum all 12 teams' predicted wins and confirm the total equals 216. Sum all 12 teams' predicted losses and confirm that also equals 216. If they don't match, recalculate until they do.

JSON only, nothing else.`;
}

function callClaude(apiKey, prompt, maxTokens) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens || 2500,
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
