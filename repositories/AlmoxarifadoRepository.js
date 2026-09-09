const connection = require('../database');

async function create(nome) {
    try {
        const sql = `
        INSERT INTO almoxarifado (nome) VALUES (?);
        `;

        const [result] = await connection.query(sql, [nome])

        return result;
    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function findAll() {
    try {
        const sql = `
        SELECT id, nome
        FROM almoxarifado;
        `;

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
        SELECT id, nome
        FROM almoxarifado
        WHERE almoxarifado.id = ?
        `;

        const [result] = await connection.query(sql, [id])

        return result[0] ?? null;
    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function update(id, nome) {
    try {
        const sql = `
        UPDATE almoxarifado
        SET nome = ?
        WHERE id = ?;
        `;

        const [result] = await connection.query(sql, [nome, id]);

        return result;

    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function deleteAlmox(id) {
    try {
        const sql = `
        DELETE FROM almoxarifado
        WHERE id = ?;
        `;
    
        const [result] = await connection.query(sql, [id]);

        return result;

    } catch (err) {
        console.log(err);
        throw err;
    };
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteAlmox};