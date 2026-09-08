const mysql2 = require('mysql2/promise');
const { loadEnvFile } = require('node:process');

loadEnvFile();

const connection = mysql2.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
});

module.exports = connection;