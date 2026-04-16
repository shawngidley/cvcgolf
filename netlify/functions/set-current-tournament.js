// Netlify function - Set current tournament (bypasses RLS using service key)
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://iqahjyoytzhhkvwmujha.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { tournament_id } = JSON.parse(event.body || '{}');
    if (!tournament_id) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ success: false, error: 'tournament_id required' }) };
    }

    const usingServiceKey = !!process.env.SUPABASE_SERVICE_KEY;
    const keyPrefix = (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '').slice(0, 20);

    // Read existing row to confirm it exists and see current state
    const { data: existing, error: readError } = await supabase
      .from('tournaments')
      .select('id, name, is_current, week_number')
      .eq('id', tournament_id)
      .maybeSingle();

    if (readError) throw new Error('Read failed: ' + readError.message);
    if (!existing) throw new Error('No tournament found with id: ' + tournament_id + ' (type: ' + typeof tournament_id + ')');

    // Clear is_current from all tournaments that currently have it set
    const { error: clearError } = await supabase
      .from('tournaments')
      .update({ is_current: false })
      .eq('is_current', true);

    if (clearError) throw new Error('Clear failed: ' + clearError.message);

    // Set is_current on the selected tournament
    const { error: setError } = await supabase
      .from('tournaments')
      .update({ is_current: true })
      .eq('id', tournament_id);

    if (setError) throw new Error('Set failed: ' + setError.message);

    // Verify the write actually persisted
    const { data: verify, error: verifyError } = await supabase
      .from('tournaments')
      .select('id, name, is_current, week_number')
      .eq('id', tournament_id)
      .maybeSingle();

    if (verifyError) throw new Error('Verify read failed: ' + verifyError.message);
    if (!verify) throw new Error('Row disappeared after update?');
    if (!verify.is_current) {
      throw new Error('Write silently failed. key_prefix=' + keyPrefix + ' row_before=' + existing.is_current + ' row_after=' + verify.is_current);
    }

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true, tournament: verify.name }) };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
