const { afterEach, beforeEach, mock, test } = require('node:test');
const assert = require('node:assert/strict');
const repoPath = require.resolve('../repositories/EstoqueRepository');
const ctrlPath = require.resolve('../controllers/EstoqueControllers');
let repo;
let ctrl;
const res = () => ({ statusCode: 0, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
beforeEach(() => { repo = { create: mock.fn(), findAll: mock.fn(), findById: mock.fn(), update: mock.fn(), deleteStock: mock.fn() }; require.cache[repoPath] = { id: repoPath, filename: repoPath, loaded: true, exports: repo }; delete require.cache[ctrlPath]; ctrl = require(ctrlPath); mock.method(console, 'log', () => {}); });
afterEach(() => { mock.restoreAll(); delete require.cache[ctrlPath]; delete require.cache[repoPath]; });

test('EstoqueControllers creates and reads stock by its two IDs', async () => {
    repo.create.mock.mockImplementation(async () => ({ affectedRows: 1 }));
    let response = res(); await ctrl.createEstoque({ body: { almoxarifado_id: 1, item_id: 2, quantidade: 10, estoque_minimo: 3 } }, response);
    assert.equal(response.statusCode, 201); assert.deepEqual(repo.create.mock.calls[0].arguments, [1, 2, 10, 3]);
    repo.findById.mock.mockImplementation(async () => ({ item_id: 2 })); response = res();
    await ctrl.getById({ params: { almoxarifadoId: '1', itemId: '2' } }, response);
    assert.equal(response.statusCode, 200); assert.deepEqual(repo.findById.mock.calls[0].arguments, ['1', '2']);
});

test('EstoqueControllers handles not-found update and delete', async () => {
    repo.update.mock.mockImplementation(async () => ({ affectedRows: 0 }));
    let response = res(); await ctrl.updateEstoque({ params: { almoxarifadoId: '1', itemId: '9' }, body: { quantidade: 2, estoque_minimo: 1 } }, response); assert.equal(response.statusCode, 404);
    repo.deleteStock.mock.mockImplementation(async () => ({ affectedRows: 0 }));
    response = res(); await ctrl.deleteEstoque({ params: { almoxarifadoId: '1', itemId: '9' } }, response); assert.equal(response.statusCode, 404);
});
