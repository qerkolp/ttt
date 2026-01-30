const { Client } = require('pg');
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  const data = JSON.parse(event.body);
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    // Nutné mít vytvořenou tabulku 'applications' z dřívějška
    await client.query("INSERT INTO applications (discord, age_ooc, age_ic, char_name, experience, backstory) VALUES ($1, $2, $3, $4, $5, $6)",
      [data.discord, data.age_ooc, data.age_ic, data.char_name, data.experience, data.backstory]);
    await client.end();
    return { statusCode: 200, body: JSON.stringify({ message: "Uloženo" }) };
  } catch (error) { return { statusCode: 500, body: JSON.stringify({ error: error.message }) }; }
};