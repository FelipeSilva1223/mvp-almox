const connection = require('../database');

const items = [
    ['Alicate universal', 'ferramenta', 42.90, null, 'disponivel', [[18, 5], [8, 3]]],
    ['Martelo unha', 'ferramenta', 38.50, null, 'disponivel', [[12, 4], [6, 2]]],
    ['Chave de fenda', 'ferramenta', 19.90, null, 'disponivel', [[25, 8], [10, 4]]],
    ['Furadeira Bosch 1/2', 'ferramenta', 649.90, 'FER-001', 'disponivel', [[1, 1], [0, 0]]],
    ['Furadeira Bosch 1/2', 'ferramenta', 649.90, 'FER-002', 'indisponivel', [[0, 0], [1, 1]]],
    ['Parafusadeira a bateria', 'ferramenta', 529.00, 'FER-003', 'nao_entregue', [[1, 1], [0, 0]]],
    ['Uniforme operacional', 'epi', 89.90, null, null, [[35, 15], [18, 10]]],
    ['Botina de segurança', 'epi', 119.90, null, null, [[22, 10], [9, 8]]],
    ['Capacete de segurança', 'epi', 39.90, null, null, [[28, 12], [14, 8]]],
    ['Óculos de proteção', 'epi', 17.50, null, null, [[40, 20], [16, 10]]],
    ['Protetor auricular', 'epi', 8.90, null, null, [[50, 20], [24, 12]]],
    ['Luva descartável', 'bem_consumo', 1.20, null, null, [[150, 50], [80, 40]]],
    ['Fita isolante', 'bem_consumo', 9.90, null, null, [[30, 10], [6, 8]]],
    ['Abraçadeira de nylon', 'bem_consumo', 0.35, null, null, [[300, 100], [120, 60]]],
    ['Parafuso sextavado', 'bem_consumo', 0.80, null, null, [[250, 80], [90, 50]]],
    ['Desengripante spray', 'bem_consumo', 24.90, null, null, [[14, 6], [5, 4]]]
];

async function seed() {
    const db = await connection.getConnection();
    try {
        await db.beginTransaction();
        const warehouseIds = [];
        for (const nome of ['Almoxarifado Central', 'Almoxarifado da Oficina']) {
            await db.query('INSERT IGNORE INTO almoxarifados (nome) VALUES (?)', [nome]);
            const [[row]] = await db.query('SELECT id FROM almoxarifados WHERE nome = ?', [nome]);
            warehouseIds.push(row.id);
        }

        for (const [nome, tipo, valor, tag, status, stocks] of items) {
            const [[existing]] = await db.query(
                'SELECT id FROM itens WHERE nome = ? AND tipo = ? AND tag <=> ?',
                [nome, tipo, tag]
            );
            let itemId = existing?.id;
            if (!itemId) {
                const [result] = await db.query(
                    'INSERT INTO itens (nome, tipo, valor, tag, status) VALUES (?, ?, ?, ?, ?)',
                    [nome, tipo, valor, tag, status]
                );
                itemId = result.insertId;
            }
            for (let i = 0; i < stocks.length; i++) {
                await db.query(
                    'INSERT IGNORE INTO estoques (almoxarifado_id, item_id, quantidade, estoque_minimo) VALUES (?, ?, ?, ?)',
                    [warehouseIds[i], itemId, stocks[i][0], stocks[i][1]]
                );
            }
        }

        await db.commit();
        console.log(`Carga concluída: ${items.length} itens em ${warehouseIds.length} almoxarifados.`);
    } catch (err) {
        await db.rollback();
        throw err;
    } finally {
        db.release();
        await connection.end();
    }
}

seed().catch(err => {
    console.error('Erro ao executar a carga inicial:', err.message);
    process.exitCode = 1;
});
