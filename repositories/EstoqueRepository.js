const connection = require('../database');

async function create(almoxarifadoId, itemId, quantidade, estoqueMinimo) {
    try {
        const sql = `
        INSERT INTO estoques (almoxarifado_id, item_id, quantidade, estoque_minimo)
        VALUES (?, ?, ?, ?);`;
        const [result] = await connection.query(sql, [almoxarifadoId, itemId, quantidade, estoqueMinimo]);
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
            estoques.almoxarifado_id,
            almoxarifados.nome AS almoxarifado,
            estoques.item_id,
            itens.nome AS item,
            itens.tipo,
            itens.valor,
            itens.tag,
            itens.status,
            estoques.quantidade,
            estoques.estoque_minimo
        FROM estoques
        INNER JOIN almoxarifados ON almoxarifados.id = estoques.almoxarifado_id
        INNER JOIN itens ON itens.id = estoques.item_id;`;
        const [result] = await connection.query(sql);
        return result;
    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function findById(almoxarifadoId, itemId) {
    try {
        const sql = `
        SELECT almoxarifado_id, item_id, quantidade, estoque_minimo
        FROM estoques
        WHERE almoxarifado_id = ? AND item_id = ?;`;
        const [result] = await connection.query(sql, [almoxarifadoId, itemId]);
        return result[0] ?? null;
    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function update(almoxarifadoId, itemId, quantidade, estoqueMinimo) {
    try {
        const sql = `
        UPDATE estoques
        SET quantidade = ?, estoque_minimo = ?
        WHERE almoxarifado_id = ? AND item_id = ?;`;
        const [result] = await connection.query(sql, [quantidade, estoqueMinimo, almoxarifadoId, itemId]);
        return result;
    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function deleteStock(almoxarifadoId, itemId) {
    try {
        const sql = `
        DELETE FROM estoques
        WHERE almoxarifado_id = ? AND item_id = ?;`;
        const [result] = await connection.query(sql, [almoxarifadoId, itemId]);
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
    deleteStock };
