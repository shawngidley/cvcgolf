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

    // Clear is_current from all tournaments
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

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
