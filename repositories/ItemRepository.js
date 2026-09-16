const connection = require('../database');

async function create(nome, tipo, valor, tag, status) {
    try {
        const sql = `
        INSERT INTO itens (nome, tipo, valor, tag, status)
        VALUES (?, ?, ?, ?, ?);`;
        const [result] = await connection.query(sql, [nome, tipo, valor, tag, status]);
        return result;
    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function findAll() {
    try {
        const sql = `
        SELECT id, nome, tipo, valor, tag, status
        FROM itens;`;
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
        SELECT id, nome, tipo, valor, tag, status
        FROM itens
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
        UPDATE itens
        SET nome = ?
        WHERE id = ?;`;
        const [result] = await connection.query(sql, [nome, id]);
        return result;
    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function deleteItem(id) {
    try {
        const sql = `
        DELETE FROM itens
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
    deleteItem };
