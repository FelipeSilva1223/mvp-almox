const { afterEach, beforeEach, mock, test } = require('node:test');
const assert = require('node:assert/strict');
const dbPath = require.resolve('../database');
const repoPath = require.resolve('../repositories/EstoqueRepository');
let db;
let repo;
const clean = sql => sql.replace(/\s+/g, ' ').trim();
beforeEach(() => { db = { query: mock.fn() }; require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: db }; delete require.cache[repoPath]; repo = require(repoPath); mock.method(console, 'log', () => {}); });
afterEach(() => { mock.restoreAll(); delete require.cache[repoPath]; delete require.cache[dbPath]; });

test('EstoqueRepository uses both composite-key values in CRUD', async () => {
    db.query.mock.mockImplementation(async () => [{ affectedRows: 1 }]);
    await repo.create('1', '2', 10, 3);
    assert.deepEqual(db.query.mock.calls[0].arguments[1], ['1', '2', 10, 3]);
    await repo.update('1', '2', 8, 3);
    let [sql, values] = db.query.mock.calls[1].arguments;
    assert.match(clean(sql), /WHERE almoxarifado_id = \? AND item_id = \?/);
    assert.deepEqual(values, [8, 3, '1', '2']);
    await repo.deleteStock('1', '2');
    assert.deepEqual(db.query.mock.calls[2].arguments[1], ['1', '2']);
});

test('EstoqueRepository returns joined lists, one row, and null', async () => {
    const stock = { almoxarifado_id: 1, item_id: 2, quantidade: 10 };
    let call = 0;
    db.query.mock.mockImplementation(async () => call++ < 2 ? [[stock]] : [[]]);
    assert.deepEqual(await repo.findAll(), [stock]);
    assert.match(clean(db.query.mock.calls[0].arguments[0]), /INNER JOIN almoxarifados.*INNER JOIN itens/);
    assert.equal(await repo.findById('1', '2'), stock);
    assert.equal(await repo.findById('1', '99'), null);
});
