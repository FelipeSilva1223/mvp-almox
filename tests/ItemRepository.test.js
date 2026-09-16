const { afterEach, beforeEach, mock, test } = require('node:test');
const assert = require('node:assert/strict');
const dbPath = require.resolve('../database');
const repoPath = require.resolve('../repositories/ItemRepository');
let db;
let repo;
const clean = sql => sql.replace(/\s+/g, ' ').trim();
beforeEach(() => {
    db = { query: mock.fn() };
    require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: db };
    delete require.cache[repoPath];
    repo = require(repoPath);
    mock.method(console, 'log', () => {});
});
afterEach(() => { mock.restoreAll(); delete require.cache[repoPath]; delete require.cache[dbPath]; });

test('ItemRepository performs CRUD with safe placeholder values', async () => {
    db.query.mock.mockImplementation(async () => [{ affectedRows: 1, insertId: 1 }]);
    await repo.create('Furadeira', 'ferramenta', 500, 'FUR-1', 'disponivel');
    let [sql, values] = db.query.mock.calls[0].arguments;
    assert.match(clean(sql), /INSERT INTO itens .* VALUES \(\?, \?, \?, \?, \?\)/);
    assert.deepEqual(values, ['Furadeira', 'ferramenta', 500, 'FUR-1', 'disponivel']);
    await repo.update('1', 'Furadeira nova');
    [sql, values] = db.query.mock.calls[1].arguments;
    assert.match(clean(sql), /UPDATE itens SET nome = \? WHERE id = \?/);
    assert.deepEqual(values, ['Furadeira nova', '1']);
    await repo.deleteItem('1');
    assert.deepEqual(db.query.mock.calls[2].arguments[1], ['1']);
});

test('ItemRepository find methods return rows and null', async () => {
    const item = { id: 1, nome: 'Luva', tipo: 'epi' };
    let call = 0;
    db.query.mock.mockImplementation(async () => call++ < 2 ? [[item]] : [[]]);
    assert.deepEqual(await repo.findAll(), [item]);
    assert.equal(await repo.findById('1'), item);
    assert.equal(await repo.findById('99'), null);
});
