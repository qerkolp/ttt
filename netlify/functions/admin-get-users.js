const { Client } = require('pg');
exports.handler = async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        // Načte ID, Jméno a Roli všech uživatelů seřazené podle ID
        const result = await client.query("SELECT id, username, role FROM users ORDER BY id ASC");
        await client.end();
        return { statusCode: 200, body: JSON.stringify(result.rows) };
    } catch (error) { return { statusCode: 500, body: JSON.stringify({ error: error.message }) }; }
};