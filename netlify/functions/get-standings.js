// Netlify function - Get standings
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://iqahjyoytzhhkvwmujha.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYWhqeW95dHpoaGt2d211amhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NjkwNTgsImV4cCI6MjA5MTE0NTA1OH0.kki64pr4YG3aQufc3n4nn2KDpmzURYDLx7_zYneoyKY'
);

exports.handler = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const { data, error } = await supabase
      .from('standings')
      .select('*, players(name)')
      .order('total_earnings', { ascending: false });

    if (error) throw error;
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
