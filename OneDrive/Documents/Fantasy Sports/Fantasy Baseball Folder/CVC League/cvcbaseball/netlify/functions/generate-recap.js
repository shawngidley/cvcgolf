// Netlify serverless function: netlify/functions/generate-recap.js
// Generates AI-powered game recaps using the Claude API.
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

  const { period, team1, team2, team1_name, team2_name, team1_CW, team1_CL, team1_CT,
          team2_CW, team2_CL, team2_CT, winner, team1_stats, team2_stats, dates, context } = params;

  // Parse stat JSON strings
  let s1 = {}, s2 = {};
  try { s1 = typeof team1_stats === 'string' ? JSON.parse(team1_stats) : (team1_stats || {}); } catch(e) {}
  try { s2 = typeof team2_stats === 'string' ? JSON.parse(team2_stats) : (team2_stats || {}); } catch(e) {}

  // Parse context JSON
  let ctx = {};
  try { ctx = typeof context === 'string' ? JSON.parse(context) : (context || {}); } catch(e) {}

  const prompt = buildPrompt(period, team1, team2, team1_name, team2_name,
    team1_CW, team1_CL, team1_CT, team2_CW, team2_CL, team2_CT,
    winner, s1, s2, dates, ctx);

  try {
    const recap = await callClaude(apiKey, prompt);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, recap: recap })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};

function buildPrompt(period, team1, team2, team1_name, team2_name,
    t1CW, t1CL, t1CT, t2CW, t2CL, t2CT, winner, s1, s2, dates, ctx) {

  const winnerName = winner === team1 ? (team1_name || team1) :
                     winner === team2 ? (team2_name || team2) : 'Neither (Tie)';
  const loserName = winner === team1 ? (team2_name || team2) :
                    winner === team2 ? (team1_name || team1) : null;

  // Build context sections only if data exists
  let contextBlock = '';
  if (ctx.team1_record || ctx.team2_record) {
    contextBlock += '\nSTANDINGS ENTERING THIS GAME:\n';
    if (ctx.team1_record) contextBlock += `${team1_name || team1}: ${ctx.team1_record}${ctx.team1_strk && ctx.team1_strk !== '—' ? ' (Streak: ' + ctx.team1_strk + ')' : ''}\n`;
    if (ctx.team2_record) contextBlock += `${team2_name || team2}: ${ctx.team2_record}${ctx.team2_strk && ctx.team2_strk !== '—' ? ' (Streak: ' + ctx.team2_strk + ')' : ''}\n`;
  }
  if (ctx.h2h) contextBlock += `HEAD-TO-HEAD THIS SEASON: ${ctx.h2h}\n`;
  if (ctx.team1_injuries || ctx.team2_injuries) {
    contextBlock += '\nINJURED PLAYERS:\n';
    if (ctx.team1_injuries) contextBlock += `${team1_name || team1}: ${ctx.team1_injuries}\n`;
    if (ctx.team2_injuries) contextBlock += `${team2_name || team2}: ${ctx.team2_injuries}\n`;
  }
  if (ctx.team1_key_hitters || ctx.team2_key_hitters) {
    contextBlock += '\nKEY ROSTER PLAYERS:\n';
    if (ctx.team1_key_hitters) contextBlock += `${team1_name || team1} hitters: ${ctx.team1_key_hitters}\n`;
    if (ctx.team1_key_pitchers) contextBlock += `${team1_name || team1} pitchers: ${ctx.team1_key_pitchers}\n`;
    if (ctx.team2_key_hitters) contextBlock += `${team2_name || team2} hitters: ${ctx.team2_key_hitters}\n`;
    if (ctx.team2_key_pitchers) contextBlock += `${team2_name || team2} pitchers: ${ctx.team2_key_pitchers}\n`;
  }

  return `You are an MLB beat reporter covering the CVC Fantasy Baseball League. Write a game recap for the following matchup in 3-5 paragraphs. This should read like a real sports article — fun, exciting, and dramatic. No two recaps should ever feel the same.

VOICE & STYLE:
- Write like an MLB beat reporter — dramatic language, sports metaphors, vivid storytelling
- Lead with the most dramatic or important moment of the period
- Bold the headline at the top (use **headline text** format for just the headline)
- End with a forward-looking sentence about what each team needs going forward
- Vary your structure, tone, and rhythm from recap to recap — some can be intense, some wry, some celebratory

CONTENT — Pick 3-5 of the following elements based on what the data supports. Do NOT force all of them into every recap. Only weave in what feels natural:
- Outstanding or surprising individual performances by hitters or pitchers (reference actual player names from the rosters provided)
- Underperformances or busts that may have hurt a team
- A late-period stat swing that decided the outcome
- Injuries to rostered players that may have impacted the result (only if injury data is provided)
- Standings implications — was this a pivotal game? Contenders or cellar dwellers?
- Previous head-to-head history between these two teams this season
- Lineup decisions, roster construction, or pitching depth that helped or hurt
- Historical CVC league context — rivalries, past championship meetings, dynasty runs, playoff history

MATCHUP: Game ${period} (${dates || 'this week'})
${team1_name || team1} (Owner: ${team1}) vs ${team2_name || team2} (Owner: ${team2})

RESULT: ${team1_name || team1} ${t1CW}-${t1CL}${t1CT > 0 ? '-' + t1CT : ''}, ${team2_name || team2} ${t2CW}-${t2CL}${t2CT > 0 ? '-' + t2CT : ''}
WINNER: ${winnerName}${loserName ? '\nLOSER: ' + loserName : ''}

${team1_name || team1} STATS:
Hitting: AVG ${fmtAvg(s1.avg)}, OBP ${fmtAvg(s1.obp)}, R ${s1.r || 0}, HR ${s1.hr || 0}, RBI ${s1.rbi || 0}, SB ${s1.sb || 0}, TB ${s1.tb || 0}
Pitching: W+QS ${s1.wqs || 0}, SV+HLD ${s1.hsv || 0}, IP ${fmtIP(s1.ip)}, K ${s1.k || 0}, ERA ${fmtERA(s1.era)}, WHIP ${fmtWHIP(s1.whip)}

${team2_name || team2} STATS:
Hitting: AVG ${fmtAvg(s2.avg)}, OBP ${fmtAvg(s2.obp)}, R ${s2.r || 0}, HR ${s2.hr || 0}, RBI ${s2.rbi || 0}, SB ${s2.sb || 0}, TB ${s2.tb || 0}
Pitching: W+QS ${s2.wqs || 0}, SV+HLD ${s2.hsv || 0}, IP ${fmtIP(s2.ip)}, K ${s2.k || 0}, ERA ${fmtERA(s2.era)}, WHIP ${fmtWHIP(s2.whip)}

SCORING: Each matchup has 13 head-to-head categories. Hitting: AVG, OBP, R, HR, RBI, SB, TB. Pitching: W+QS, SV+HLD, IP, K, ERA, WHIP. The team that wins more categories wins the game.
${contextBlock}
IMPORTANT RULES:
- Do NOT include any "Generated by AI" disclaimer or any meta-commentary about the writing
- Do NOT use ## or any markdown headings — only use **bold** for the headline on the first line
- Keep it to 3-5 paragraphs after the headline
- Reference actual player names from the rosters when discussing performances
- Be specific about which stat categories were won or lost when it adds drama`;
}

function fmtAvg(v) { return v ? Number(v).toFixed(3) : 'N/A'; }
function fmtERA(v) { return v ? Number(v).toFixed(2) : 'N/A'; }
function fmtWHIP(v) { return v ? Number(v).toFixed(3) : 'N/A'; }
function fmtIP(v) { return v ? Number(v).toFixed(1) : '0.0'; }

function callClaude(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
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
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('API timeout')); });
    req.write(postData);
    req.end();
  });
}
