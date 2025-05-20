const { createClient } = require('@supabase/supabase-js');
const shortid = require('shortid');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async (event) => {
  // GET: Listar todas las URLs
  if (event.httpMethod === 'GET') {
    const { data } = await supabase.from('urls').select('*').order('created_at', { ascending: false });
    return { statusCode: 200, body: JSON.stringify(data) };
  }

  // POST: Acortar nueva URL
  if (event.httpMethod === 'POST') {
    const { url } = JSON.parse(event.body);
    const shortCode = shortid.generate();
    
    await supabase.from('urls').insert([{ 
      original_url: url, 
      short_code: shortCode 
    }]);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        shortUrl: `https://${event.headers.host}/${shortCode}` 
      })
    };
  }

  return { statusCode: 405 };
};
