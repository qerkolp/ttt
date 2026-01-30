const { Client } = require('pg');
exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    const data = JSON.parse(event.body);

    // Ověření hesla (aby si profil nemohl měnit cizí člověk)
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

    try {
        await client.connect();

        // 1. Zkontrolujeme, zda sedí heslo
        const verify = await client.query("SELECT * FROM users WHERE username = $1 AND password = $2", [data.username, data.password]);
        if (verify.rows.length === 0) {
            await client.end();
            return { statusCode: 403, body: JSON.stringify({ error: "Špatné heslo! Změny neuloženy." }) };
        }

        // 2. Provedeme update
        await client.query(
            "UPDATE users SET avatar_url = $1, bio = $2 WHERE username = $3",
            [data.newAvatar, data.newBio, data.username]
        );

        // 3. Vrátíme aktualizovaná data
        const updatedUser = await client.query("SELECT * FROM users WHERE username = $1", [data.username]);

        await client.end();
        return { statusCode: 200, body: JSON.stringify({ message: "Uloženo!", user: updatedUser.rows[0] }) };

    } catch (error) {
        await client.end();
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};