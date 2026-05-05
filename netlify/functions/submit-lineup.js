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
      .select('picks_locked, is_complete, start_date')
      .eq('id', tournament_id)
      .single();

    const now = new Date();
    const startDate = new Date(tournament?.start_date + 'T00:00:00');
    if (tournament?.picks_locked || tournament?.is_complete || now >= startDate) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Picks are locked for this tournament' }) };
    }

    // Validate salary cap
    const { data: golfers } = await supabase
      .from('golfers')
      .select('id, name, salary, is_liv')
      .in('id', golfer_ids);

    const totalSalary = golfers.reduce((sum, g) => sum + g.salary, 0);
    if (totalSalary > 100) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: `Over $100 salary cap (total: $${totalSalary})` }) };
    }

    // Validate LIV golfer usage (max 2 uses total)
    const livGolfers = golfers.filter(g => g.is_liv);
    if (livGolfers.length > 0) {
      const { data: usage } = await supabase
        .from('golfer_usage')
        .select('golfer_id, times_used')
        .eq('player_id', player_id)
        .in('golfer_id', livGolfers.map(g => g.id));

      const usageMap = {};
      if (usage) usage.forEach(u => { usageMap[u.golfer_id] = u.times_used; });

      // Check if current tournament already has a lineup (re-submission doesn't add usage)
      const { data: existingLineup } = await supabase
        .from('lineups')
        .select('golfer_id')
        .eq('player_id', player_id)
        .eq('tournament_id', tournament_id);
      const existingIds = new Set((existingLineup || []).map(l => l.golfer_id));

      for (const g of livGolfers) {
        const currentUses = usageMap[g.id] || 0;
        const alreadyInLineup = existingIds.has(g.id);
        const effectiveUses = alreadyInLineup ? currentUses - 1 : currentUses;
        if (effectiveUses >= 2) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: `LIV golfer ${g.name} has reached the 2-use limit` }) };
        }
      }
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
