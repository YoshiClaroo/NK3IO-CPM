const faunadb = require('faunadb');
const q = faunadb.query;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { email, password, action } = JSON.parse(event.body);
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const JWT_SECRET = process.env.JWT_SECRET || 'nk3io_secret_key';

    try {
        // Solo hay un usuario (el admin)
        if (email !== ADMIN_EMAIL) {
            return { 
                statusCode: 401, 
                body: JSON.stringify({ error: 'Credenciales inválidas' }) 
            };
        }

        // Verificar contraseña (en producción usa bcrypt.compare)
        if (password !== ADMIN_PASSWORD) {
            return { 
                statusCode: 401, 
                body: JSON.stringify({ error: 'Credenciales inválidas' }) 
            };
        }

        // Generar token JWT
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Login exitoso', 
                token,
                user: { email }
            })
        };

    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: error.message }) 
        };
    }
};
