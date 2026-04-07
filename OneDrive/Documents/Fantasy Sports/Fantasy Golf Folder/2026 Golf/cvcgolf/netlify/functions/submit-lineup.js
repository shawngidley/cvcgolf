// Netlify function - Submit lineup
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
    const { player_id, tournament_id, golfer_ids } = JSON.parse(event.body);

    if (!player_id || !tournament_id || !golfer_ids || golfer_ids.length !== 5) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Need player_id, tournament_id, and exactly 5 golfer_ids' }) };
    }

    // Check tournament not locked
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('picks_locked, is_complete')
      .eq('id', tournament_id)
      .single();

    if (tournament?.picks_locked || tournament?.is_complete) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Picks are locked for this tournament' }) };
    }

    // Validate salary cap
    const { data: golfers } = await supabase
      .from('golfers')
      .select('id, salary')
      .in('id', golfer_ids);

    const totalSalary = golfers.reduce((sum, g) => sum + g.salary, 0);
    if (totalSalary > 100) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: `Over $100 salary cap (total: $${totalSalary})` }) };
    }

    // Delete existing and insert new
    await supabase.from('lineups').delete().eq('player_id', player_id).eq('tournament_id', tournament_id);

    const rows = golfer_ids.map((gId, i) => ({
      player_id, tournament_id, golfer_id: gId, slot: i + 1
    }));

    const { error } = await supabase.from('lineups').insert(rows);
    if (error) throw error;

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
