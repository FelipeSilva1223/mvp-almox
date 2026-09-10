const connection = require('../database');

async function create(nome, valor, quantidade) {
    try {
        const sql = `
        INSERT INTO bens_consumo (nome, valor, quantidade)
        VALUES (?, ?, ?);
        `;

        const [result] = await connection.query(sql, [nome, valor, quantidade]);

        return result;

    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function findAll() {
    try {
        const sql = `
        SELECT id, nome, valor, quantidade
        FROM bens_consumo;`;

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
        SELECT id, nome, valor, quantidade
        FROM bens_consumo
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
        UPDATE bens_consumo
        SET nome = ?
        WHERE id = ?;`;

        const [result] = await connection.query(sql, [nome, id]);

        return result;

    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function deleteBem(id) {
    try {
        const sql = `
        DELETE FROM bens_consumo
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
    deleteBem
};
