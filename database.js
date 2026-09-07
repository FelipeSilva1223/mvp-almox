const mysql2 = require('mysql2/promise');
const { loadEnvFile } = require('node:process');

loadEnvFile();

async function conectar() {
    const conn = await mysql2.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
    });

    try {
        const [result, fields] = await conn.query(
            'SELECT * FROM almoxarifado'
        );

        console.log(result);
        console.log(fields);
    } catch (err) {
        console.log(err);
    }

    await conn.end();
};

conectar();