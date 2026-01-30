const { Client } = require('pg');
exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    const data = JSON.parse(event.body);
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        const result = await client.query("SELECT username, role, avatar_url FROM users WHERE username = $1 AND password = $2", [data.username, data.password]);
        await client.end();
        if (result.rows.length > 0) return { statusCode: 200, body: JSON.stringify({ user: result.rows[0] }) };
        return { statusCode: 401, body: JSON.stringify({ error: "Chyba přihlášení" }) };
    } catch (error) { return { statusCode: 500, body: JSON.stringify({ error: error.message }) }; }
};