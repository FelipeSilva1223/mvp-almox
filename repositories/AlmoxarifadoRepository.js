const connection = require('../database');

async function create(nome) {
    try {
        const sql = `
        INSERT INTO almoxarifado (nome) VALUES (?);`

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
        SELECT
            almoxarifado.id,
            almoxarifado.nome
        FROM almoxarifado;`;

        const [result] = await connection.query(sql);

        console.log(result);
        return result;

    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function findById(id) {
    try {
        const sql = `
        SELECT
            almoxarifado.id,
            almoxarifado.nome
        FROM almoxarifado
        WHERE almoxarifado.id = ?`

        const [result] = await connection.query(sql, [id])

        return result;
    } catch (err) {
        console.log(err);
        throw err;
    };
};

module.exports = {
    findAll,
    findById,
    create};