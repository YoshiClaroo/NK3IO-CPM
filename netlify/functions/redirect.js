const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.handler = async (event) => {
    const { code } = event.queryStringParameters;
    const { data } = await supabase
        .from('urls')
        .select('original_url, clicks')
        .eq('short_code', code)
        .single();

    if (!data) return { statusCode: 404, body: JSON.stringify({ error: "URL no encontrada" }) };

    await supabase
        .from('urls')
        .update({ clicks: data.clicks + 1 })
        .eq('short_code', code);

    return { statusCode: 200, body: JSON.stringify({ url: data.original_url }) };
};
