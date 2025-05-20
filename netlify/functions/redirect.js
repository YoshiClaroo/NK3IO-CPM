const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event, context) => {
    const { shortCode } = event.queryStringParameters;
    
    if (!shortCode) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Código corto requerido' }) };
    }

    try {
        const client = new faunadb.Client({ secret: process.env.FAUNADB_SECRET });
        
        // Buscar URL por shortCode
        const result = await client.query(
            q.Map(
                q.Paginate(q.Match(q.Index('urls_by_shortcode'), shortCode)),
                q.Lambda('ref', q.Get(q.Var('ref')))
        );
        
        if (result.data.length === 0) {
            return { statusCode: 404, body: JSON.stringify({ error: 'URL no encontrada' }) };
        }
        
        const urlData = result.data[0];
        
        // Incrementar contador de clicks
        await client.query(
            q.Update(
                urlData.ref,
                { data: { clicks: q.Add(urlData.data.clicks, 1) } }
            )
        );
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                originalUrl: urlData.data.originalUrl,
                shortCode: urlData.data.shortCode
            })
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: error.message }) 
        };
    }
};
