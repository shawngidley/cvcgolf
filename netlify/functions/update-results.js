// Netlify function - Update tournament results and recalculate
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://iqahjyoytzhhkvwmujha.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { tournament_id, results } = JSON.parse(event.body);

    if (!tournament_id || !results) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing tournament_id or results' }) };
    }

    // Upsert golfer results
    for (const r of results) {
      await supabase.from('results').upsert({
        tournament_id,
        golfer_id: r.golfer_id,
        finish_position: r.position,
        score_to_par: r.score_to_par || 0,
        earnings: r.earnings || 0,
        made_cut: (r.earnings || 0) > 0
      }, { onConflict: 'tournament_id,golfer_id' });
    }

    // Recalculate weekly scores
    const { data: players } = await supabase.from('players').select('id');

    for (const player of players) {
      const { data: lineup } = await supabase
        .from('lineups')
        .select('golfer_id, golfers(name, salary)')
        .eq('player_id', player.id)
        .eq('tournament_id', tournament_id);

      if (!lineup || lineup.length === 0) continue;

      let totalEarnings = 0;
      let totalSalary = 0;
      let bestGolfer = '';
      let bestEarnings = 0;

      for (const l of lineup) {
        totalSalary += l.golfers?.salary || 0;
        const { data: result } = await supabase
          .from('results')
          .select('earnings')
          .eq('tournament_id', tournament_id)
          .eq('golfer_id', l.golfer_id)
          .single();

        const e = parseFloat(result?.earnings || 0);
        totalEarnings += e;
        if (e > bestEarnings) { bestEarnings = e; bestGolfer = l.golfers?.name || ''; }
      }

      await supabase.from('weekly_scores').upsert({
        player_id: player.id,
        tournament_id,
        total_earnings: totalEarnings,
        total_salary: totalSalary,
        best_golfer: bestGolfer,
        best_golfer_earnings: bestEarnings
      }, { onConflict: 'player_id,tournament_id' });
    }

    // Update season standings
    for (const player of players) {
      const { data: scores } = await supabase
        .from('weekly_scores')
        .select('total_earnings')
        .eq('player_id', player.id);

      if (!scores || scores.length === 0) continue;

      const earns = scores.map(s => parseFloat(s.total_earnings || 0));
      const total = earns.reduce((a, b) => a + b, 0);

      await supabase.from('standings').upsert({
        player_id: player.id,
        total_earnings: total,
        weeks_played: earns.length,
        best_week: Math.max(...earns),
        worst_week: Math.min(...earns),
        avg_weekly: total / earns.length,
        updated_at: new Date().toISOString()
      }, { onConflict: 'player_id' });
    }

    // Mark tournament complete
    await supabase.from('tournaments')
      .update({ is_complete: true, is_current: false, picks_locked: true })
      .eq('id', tournament_id);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Results saved and standings recalculated' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
