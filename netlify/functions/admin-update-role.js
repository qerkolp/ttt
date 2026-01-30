const { Client } = require('pg');
exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    const data = JSON.parse(event.body);

    // Bezpečnostní kontrola: Musíš poslat své heslo, abys dokázal, že jsi admin
    // V reálu by se to dělalo tokenem, ale pro jednoduchost ověříme admina heslem znovu.
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

    try {
        await client.connect();

        // 1. Ověříme, že ten kdo žádá (adminUsername), je skutečně Founder/Manager/Dev
        const checkAdmin = await client.query("SELECT role FROM users WHERE username = $1 AND password = $2", [data.adminUsername, data.adminPassword]);

        if (checkAdmin.rows.length === 0) {
            await client.end();
            return { statusCode: 403, body: JSON.stringify({ error: "Nemáš právo upravovat role!" }) };
        }

        const adminRole = checkAdmin.rows[0].role;
        const allowedRoles = ['founder', 'co-founder', 'head manager', 'manager', 'head dev', 'developer'];

        if (!allowedRoles.includes(adminRole)) {
            await client.end();
            return { statusCode: 403, body: JSON.stringify({ error: "Na tohle nemáš dostatečný rank." }) };
        }

        // 2. Pokud prošel kontrolou, změníme roli cílovému uživateli
        await client.query("UPDATE users SET role = $1 WHERE username = $2", [data.newRole, data.targetUsername]);

        await client.end();
        return { statusCode: 200, body: JSON.stringify({ message: "Role změněna!" }) };

    } catch (error) {
        await client.end();
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};