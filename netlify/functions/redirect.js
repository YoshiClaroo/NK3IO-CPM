const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async (event) => {
  const { code } = event.queryStringParameters;

  try {
    const { data, error } = await supabase
      .from('urls')
      .select('original_url, clicks')
      .eq('short_code', code)
      .single();

    if (error || !data) {
      return { statusCode: 404, body: JSON.stringify({ error: 'URL no encontrada' }) };
    }

    // Actualizar contador de clicks
    await supabase
      .from('urls')
      .update({ clicks: data.clicks + 1 })
      .eq('short_code', code);

    return {
      statusCode: 200,
      body: JSON.stringify({ url:
