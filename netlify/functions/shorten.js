const { createClient } = require('@supabase/supabase-js');
const shortid = require('shortid');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.handler = async (event) => {
    const { url } = event.queryStringParameters;
    const shortCode = shortid.generate();

    await supabase
        .from('urls')
        .insert([{ original_url: url, short_code: shortCode, clicks: 0 }]);

    return {
        statusCode: 200,
        body: JSON.stringify({ shortUrl: `https://${event.headers.host}/${shortCode}` })
    };
};
