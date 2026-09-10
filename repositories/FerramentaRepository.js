const connection = require('../database');

async function create(nome, tag, status, valor) {
    try {
        const sql = `
        INSERT INTO ferramentas (nome, tag, status, valor)
        VALUES (?, ?, ?, ?);
        `;

        const [result] = await connection.query(sql, [nome, tag, status, valor]);

        return result;

    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function findAll() {
    try {
        const sql = `
        SELECT id, nome, tag, status, valor
        FROM ferramentas;`;

        const [result] = await connection.query(sql);

        return result;
    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function findById(id) {
    try {
        const sql = `
        SELECT id, nome, tag, status, valor
        FROM ferramentas
        WHERE id = ?;`;

        const [result] = await connection.query(sql, [id]);

        return result[0] ?? null;
    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function update(id, nome) {
    try {
        const sql = `
        UPDATE ferramentas
        SET nome = ?
        WHERE id = ?;`;

        const [result] = await connection.query(sql, [nome, id]);

        return result;

    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function deleteFerr(id) {
    try {
        const sql = `
        DELETE FROM ferramentas
        WHERE id = ?;`;

        const [result] = await connection.query(sql, [id]);

        return result;

    } catch (err) {
        console.log(err);
        throw err;
    };
};

module.exports = {
    create,
    findAll,
    findById,
    update,
    deleteFerr
};
