const connection = require('../database');

async function create(nome, matricula) {
    try {
        const sql = `
        INSERT INTO funcionarios (nome, matricula) VALUES (?, ?);
        `;

        const [result] = await connection.query(sql, [nome, matricula]);

        return result;

    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function findAll() {
    try {
        const sql = `
        SELECT id, nome, matricula
        FROM funcionarios;`;

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
        SELECT id, nome, matricula
        FROM funcionarios
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
        UPDATE funcionarios
        SET nome = ?
        WHERE id = ?;`;

        const [result] = await connection.query(sql, [nome, id]);

        return result;

    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function deleteFunc(id) {
    try {
        const sql = `
        DELETE FROM funcionarios
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
    deleteFunc
};
