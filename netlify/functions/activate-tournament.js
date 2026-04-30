// Netlify scheduled function - Auto-activate tournament when first tee time passes
// Runs every hour on Thursdays. No-op if a tournament is already active.

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://iqahjyoytzhhkvwmujha.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

exports.handler = async () => {
  console.log('[activate-tournament] Starting check...');

  try {
    // Skip if there's already an active tournament
    const { data: active } = await supabase
      .from('tournaments')
      .select('id, name')
      .eq('is_current', true)
      .eq('is_complete', false)
      .limit(1);

    if (active?.[0]) {
      console.log(`[activate-tournament] "${active[0].name}" already active. Skipping.`);
      return { statusCode: 200, body: JSON.stringify({ status: 'skipped', reason: 'Already active', tournament: active[0].name }) };
    }

    // Find the tournament whose first_tee_time has passed and isn't complete
    const now = new Date().toISOString();
    const { data: ready } = await supabase
      .from('tournaments')
      .select('id, name, week_number')
      .eq('is_complete', false)
      .eq('is_current', false)
      .lte('first_tee_time', now)
      .order('first_tee_time', { ascending: false })
      .limit(1);

    const tournament = ready?.[0];

    if (!tournament) {
      console.log('[activate-tournament] No tournament ready to activate.');
      return { statusCode: 200, body: JSON.stringify({ status: 'skipped', reason: 'No tournament ready' }) };
    }

    // Clear any stale is_current flags, then activate
    await supabase.from('tournaments').update({ is_current: false }).eq('is_current', true);
    await supabase.from('tournaments').update({ is_current: true }).eq('id', tournament.id);

    console.log(`[activate-tournament] Activated "${tournament.name}" (Week ${tournament.week_number}).`);

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'activated', tournament: tournament.name, week: tournament.week_number })
    };

  } catch (err) {
    console.error('[activate-tournament] Error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ status: 'error', error: err.message }) };
  }
};
