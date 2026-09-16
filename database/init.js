const fs = require('node:fs/promises');
const path = require('node:path');
const mysql = require('mysql2/promise');
const { loadEnvFile } = require('node:process');

async function initDatabase() {
    try {
        loadEnvFile();
    } catch {
        throw new Error('Arquivo .env não encontrado. Copie .env.example para .env e configure o acesso ao MySQL.');
    }

    const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Variáveis ausentes no .env: ${missing.join(', ')}`);
    }

    const databaseName = process.env.DB_NAME;
    if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
        throw new Error('DB_NAME deve conter apenas letras, números e underscore.');
    }

    const schemaPath = path.join(__dirname, 'schemas.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    const configuredSchema = schema.replaceAll('db_almox', `\`${databaseName}\``);

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    try {
        await connection.query(configuredSchema);
        console.log(`Banco ${databaseName} inicializado com sucesso.`);
    } finally {
        await connection.end();
    }
}

initDatabase().catch(err => {
    console.error('Erro ao inicializar o banco:', err.message);
    process.exitCode = 1;
});
