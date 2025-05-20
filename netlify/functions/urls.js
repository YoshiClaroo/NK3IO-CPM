const faunadb = require('faunadb');
const q = faunadb.query;
const shortid = require('shortid');

exports.handler = async (event, context) => {
    // Verificar token JWT
    const token = event.headers['authorization']?.split(' ')[1];
    if (!token) {
        return { statusCode: 401, body: JSON.stringify({ error: 'No autorizado' }) };
    }

    try {
        const jwt = require('jsonwebtoken');
        jwt.verify(token, process.env.JWT_SECRET || 'nk3io_secret_key');
        
        const client = new faunadb.Client({ secret: process.env.FAUNADB_SECRET });
        
        if (event.httpMethod === 'POST') {
            // Crear nueva URL acortada
            const { originalUrl, customCode } = JSON.parse(event.body);
            const shortCode = customCode || shortid.generate();
            
            const result = await client.query(
                q.Create(
                    q.Collection('urls'),
                    { 
                        data: { 
                            originalUrl,
                            shortCode,
                            createdAt: q.Now(),
                            clicks: 0
                        } 
                    }
                )
            );
            
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    shortUrl: `https://${event.headers.host}/${shortCode}`,
                    ...result.data
                })
            };
        } 
        else if (event.httpMethod === 'GET') {
            // Listar todas las URLs
            const result = await client.query(
                q.Map(
                    q.Paginate(q.Documents(q.Collection('urls'))),
                    q.Lambda('ref', q.Get(q.Var('ref')))
                )
            );
            
            return {
                statusCode: 200,
                body: JSON.stringify(result.data.map(item => ({
                    id: item.ref.id,
                    ...item.data
                })))
            };
        }
        else {
            return { statusCode: 405, body: 'Method Not Allowed' };
        }
    } catch (error) {
        return { 
            statusCode: error.name === 'JsonWebTokenError' ? 401 : 500, 
            body: JSON.stringify({ error: error.message }) 
        };
    }
};
