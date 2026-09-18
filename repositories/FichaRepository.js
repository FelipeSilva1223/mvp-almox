const connection = require('../database');

async function addItem(fichaId, almoxarifadoId, itemId, quantidade) {
    const db = await connection.getConnection();
    try {
        await db.beginTransaction();

        const estoqueSql = `
        UPDATE estoques
        SET quantidade = quantidade - ?
        WHERE almoxarifado_id = ?
            AND item_id = ?
            AND quantidade >= ?;
        `;

        const [estoqueResult] = await db.query(estoqueSql, [quantidade, almoxarifadoId, itemId, quantidade]);
        if (estoqueResult.affectedRows === 0) {
            throw new Error('Estoque insuficiente ou item não encontrado.');
        };

        const fichaSql = `
        INSERT INTO ficha_itens (ficha_id, almoxarifado_id, item_id, quantidade)
        VALUES (?, ?, ?, ?)
        `;

        const [fichaResult] = await db.query(fichaSql, [fichaId, almoxarifadoId, itemId, quantidade]);

        await db.commit();
        
        return fichaResult;

    } catch (err) {
        await db.rollback();
        console.log(err);
        throw err;

    } finally {
        db.release();
    };
};

async function removeItem(fichaItensId, almoxarifadoId, itemId, quantidadeDevolvida) {
    const db = await connection.getConnection();

    try {
        await db.beginTransaction();

        const fichaSql = `
        UPDATE ficha_itens
        SET 
            quantidade_devolvida = quantidade_devolvida + ?,
            devolvido = ( quantidade = ?),
            devolvido_em = 
                CASE
                    WHEN quantidade = ?
                    THEN CURRENT_TIMESTAMP
                    ELSE NULL
                END,
            quantidade = quantidade - ?
        WHERE id = ? 
        AND almoxarifado_id = ? 
        AND item_id = ? 
        AND quantidade >= ?;
        `;

        const [fichaResult] = await db.query(fichaSql, [quantidadeDevolvida, quantidadeDevolvida, quantidadeDevolvida, quantidadeDevolvida, fichaItensId, almoxarifadoId, itemId, quantidadeDevolvida]);
        if (fichaResult.affectedRows === 0) {
            throw new Error('Item não encontrado ou quantidade devolvida inválida.');
        }

        const estoqueSql = `
        UPDATE estoques
        SET quantidade = quantidade + ?
        WHERE almoxarifado_id = ?
            AND item_id = ?;
        `;

        const [estoqueResult] = await db.query(estoqueSql, [quantidadeDevolvida, almoxarifadoId, itemId]);
        if (estoqueResult.affectedRows === 0) {
            throw new Error('Estoque não encontrado');
        };

        await db.commit();

        return fichaResult;

    } catch (err) {
        await db.rollback();
        console.log(err);
        throw err;

    } finally {
        db.release();
    };
};

module.exports = {
    addItem,
    removeItem
};