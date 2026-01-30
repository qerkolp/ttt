const { Client } = require('pg');
exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    const data = JSON.parse(event.body);
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        await client.query("INSERT INTO users (username, password) VALUES ($1, $2)", [data.username, data.password]);
        await client.end();
        return { statusCode: 200, body: JSON.stringify({ message: "OK" }) };
    } catch (error) {
        await client.end();
        return { statusCode: 500, body: JSON.stringify({ error: "Jméno zabráno." }) };
    }
};