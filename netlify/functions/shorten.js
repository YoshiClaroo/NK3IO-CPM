const { createClient } = require('@supabase/supabase-js');
const shortid = require('shortid');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async (event) => {
  const { url, custom } = event.queryStringParameters;
  const shortCode = custom || shortid.generate();

  try {
    const { error } = await supabase
      .from('urls')
      .insert([{ 
        original_url: url, 
        short_code: shortCode,
        clicks: 0
      }]);

    if (error) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'El código ya existe' }) 
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        shortUrl: `https://${event.headers.host}/${shortCode}`,
        shortCode
      })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
