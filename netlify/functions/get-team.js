const { Client } = require('pg');
exports.handler = async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        const result = await client.query("SELECT username, role, avatar_url FROM users WHERE role != 'user'");
        await client.end();
        return { statusCode: 200, body: JSON.stringify(result.rows) };
    } catch (error) { return { statusCode: 500, body: JSON.stringify({ error: error.message }) }; }
};