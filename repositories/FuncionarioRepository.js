const connection = require('../database');

function formatFuncionarios(rows) {
    const funcionarios = new Map();

    for (const row of rows) {
        if (!funcionarios.has(row.funcionario_id)) {
            funcionarios.set(row.funcionario_id, {
                id: row.funcionario_id,
                nome: row.nome,
                matricula: row.matricula,
                ficha: row.ficha_id ? {
                    id: row.ficha_id,
                    itens: []
                } : null
            });
        };

        if (row.ficha_item_id) {
            funcionarios.get(row.funcionario_id).ficha.itens.push({
                id: row.ficha_item_id,
                itemId: row.item_id,
                nome: row.item_nome,
                tipo: row.tipo,
                valor: row.valor,
                tag: row.tag,
                status: row.status,
                almoxarifadoId: row.almoxarifado_id,
                almoxarifado: row.almoxarifado,
                quantidade: row.quantidade,
                quantidadeDevolvida: row.quantidade_devolvida,
                recebidoEm: row.recebido_em,
                devolvido: Boolean(row.devolvido),
                devolvidoEm: row.devolvido_em
            });
        };
    };

    return [...funcionarios.values()];
};

const funcionarioComFichaSql = `
    SELECT
        funcionarios.id AS funcionario_id,
        funcionarios.nome,
        funcionarios.matricula,
        fichas.id AS ficha_id,
        ficha_itens.id AS ficha_item_id,
        ficha_itens.item_id,
        itens.nome AS item_nome,
        itens.tipo,
        itens.valor,
        itens.tag,
        itens.status,
        ficha_itens.almoxarifado_id,
        almoxarifados.nome AS almoxarifado,
        ficha_itens.quantidade,
        ficha_itens.quantidade_devolvida,
        ficha_itens.recebido_em,
        ficha_itens.devolvido,
        ficha_itens.devolvido_em
    FROM funcionarios
    LEFT JOIN fichas
        ON fichas.funcionario_id = funcionarios.id
    LEFT JOIN ficha_itens
        ON ficha_itens.ficha_id = fichas.id
    LEFT JOIN itens
        ON itens.id = ficha_itens.item_id
    LEFT JOIN almoxarifados
        ON almoxarifados.id = ficha_itens.almoxarifado_id
`;

async function create(nome, matricula) {
    const db = await connection.getConnection();

    try {
        await db.beginTransaction();

        const funcionarioSql = `
        INSERT INTO funcionarios (nome, matricula) 
        VALUES (?, ?);
        `;

        const [funcionarioResult] = await db.query(funcionarioSql, [nome, matricula]);
        const funcionarioId = funcionarioResult.insertId;

        const fichaSql = `
        INSERT INTO fichas (funcionario_id)
        VALUES (?);
        `;

        const [fichaResult] = await db.query(fichaSql, [funcionarioId]);

        await db.commit();

        return {
            funcionarioId,
            fichaId: fichaResult.insertId
        };

    } catch (err) {
        await db.rollback();
        console.log(err);
        throw err;
    } finally {
        db.release();
    };
};

async function findAll() {
    try {
        const sql = `${funcionarioComFichaSql}
        ORDER BY funcionarios.id, ficha_itens.id;`;

        const [result] = await connection.query(sql);

        return formatFuncionarios(result);
    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function findById(id) {
    try {
        const sql = `${funcionarioComFichaSql}
        WHERE funcionarios.id = ?
        ORDER BY ficha_itens.id;`;

        const [result] = await connection.query(sql, [id]);

        return formatFuncionarios(result)[0] ?? null;
    } catch (err) {
        console.log(err);
        throw err;
    };
};

async function findByMatricula(matricula) {
    try {
        const sql = `
        SELECT id, nome, matricula
        FROM funcionarios
        WHERE matricula = ?;
        `;

        const [result] = await connection.query(sql, [matricula]);

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
        WHERE id = ?;
        `;

        const [result] = await connection.query(sql, [nome, id]);

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
    findByMatricula,
    update
};
