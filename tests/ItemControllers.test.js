const { afterEach, beforeEach, mock, test } = require('node:test');
const assert = require('node:assert/strict');
const repoPath = require.resolve('../repositories/ItemRepository');
const ctrlPath = require.resolve('../controllers/ItemControllers');
let repo;
let ctrl;
const res = () => ({ statusCode: 0, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
beforeEach(() => {
    repo = { create: mock.fn(), findAll: mock.fn(), findById: mock.fn(), update: mock.fn(), deleteItem: mock.fn() };
    require.cache[repoPath] = { id: repoPath, filename: repoPath, loaded: true, exports: repo };
    delete require.cache[ctrlPath]; ctrl = require(ctrlPath); mock.method(console, 'log', () => {});
});
afterEach(() => { mock.restoreAll(); delete require.cache[ctrlPath]; delete require.cache[repoPath]; });

test('ItemControllers handles create and successful reads', async () => {
    repo.create.mock.mockImplementation(async () => ({ insertId: 1 }));
    let response = res();
    await ctrl.createItem({ body: { nome: 'Luva', tipo: 'epi', valor: 10, tag: null, status: null } }, response);
    assert.equal(response.statusCode, 201);
    assert.deepEqual(repo.create.mock.calls[0].arguments, ['Luva', 'epi', 10, null, null]);
    repo.findAll.mock.mockImplementation(async () => [{ id: 1 }]); response = res(); await ctrl.getAll({}, response); assert.equal(response.statusCode, 200);
    repo.findById.mock.mockImplementation(async () => ({ id: 1 })); response = res(); await ctrl.getById({ params: { id: '1' } }, response); assert.equal(response.statusCode, 200);
});

test('ItemControllers handles not-found update and delete', async () => {
    repo.update.mock.mockImplementation(async () => ({ affectedRows: 0 }));
    let response = res(); await ctrl.updateNome({ params: { id: '9' }, body: { nome: 'Novo' } }, response); assert.equal(response.statusCode, 404);
    repo.deleteItem.mock.mockImplementation(async () => ({ affectedRows: 0 }));
    response = res(); await ctrl.deleteItem({ params: { id: '9' } }, response); assert.equal(response.statusCode, 404);
});
