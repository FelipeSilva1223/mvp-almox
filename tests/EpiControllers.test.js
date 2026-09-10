const { afterEach, beforeEach, describe, mock, test } = require('node:test');
const assert = require('node:assert/strict');
const repositoryPath = require.resolve('../repositories/EpiRepository');
const controllerPath = require.resolve('../controllers/EpiControllers');
let repository;
let controller;

function responseMock() {
    const res = {
        statusCode: null,
        body: undefined,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
    mock.method(res, 'status');
    mock.method(res, 'json');
    return res;
}

beforeEach(() => {
    repository = { create: mock.fn(), findAll: mock.fn(), findById: mock.fn(), update: mock.fn(), deleteEpi: mock.fn() };
    require.cache[repositoryPath] = { id: repositoryPath, filename: repositoryPath, loaded: true, exports: repository };
    delete require.cache[controllerPath];
    controller = require(controllerPath);
    mock.method(console, 'log', () => {});
});

afterEach(() => {
    mock.restoreAll();
    delete require.cache[controllerPath];
    delete require.cache[repositoryPath];
});

describe('EpiControllers', () => {
    test('createEpi sends all fields and responds with 201', async () => {
        const result = { insertId: 1, affectedRows: 1 };
        repository.create.mock.mockImplementation(async () => result);
        const res = responseMock();
        await controller.createEpi({ body: { nome: 'Capacete', valor: 80.5, quantidade: 10 } }, res);
        assert.deepEqual(repository.create.mock.calls[0].arguments, ['Capacete', 80.5, 10]);
        assert.equal(res.statusCode, 201);
        assert.deepEqual(res.body, result);
    });

    test('getAll responds with 200 and all EPIs', async () => {
        const rows = [{ id: 1, nome: 'Capacete', valor: 80.5, quantidade: 10 }];
        repository.findAll.mock.mockImplementation(async () => rows);
        const res = responseMock();
        await controller.getAll({}, res);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, rows);
    });

    test('getAll responds with 404 when empty', async () => {
        repository.findAll.mock.mockImplementation(async () => []);
        const res = responseMock();
        await controller.getAll({}, res);
        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Nenhum EPI cadastrado.' });
    });

    test('getById responds with 200 when found', async () => {
        const epi = { id: 7, nome: 'Capacete', valor: 80.5, quantidade: 10 };
        repository.findById.mock.mockImplementation(async () => epi);
        const res = responseMock();
        await controller.getById({ params: { id: '7' } }, res);
        assert.deepEqual(repository.findById.mock.calls[0].arguments, ['7']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, epi);
    });

    test('getById responds with 404 when not found', async () => {
        repository.findById.mock.mockImplementation(async () => null);
        const res = responseMock();
        await controller.getById({ params: { id: '99' } }, res);
        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'EPI não encontrado.' });
    });

    test('updateNome sends only id and nome and responds with 200', async () => {
        repository.update.mock.mockImplementation(async () => ({ affectedRows: 1 }));
        const res = responseMock();
        await controller.updateNome({ params: { id: '7' }, body: { nome: 'Novo', valor: 100, quantidade: 3 } }, res);
        assert.deepEqual(repository.update.mock.calls[0].arguments, ['7', 'Novo']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, { message: 'Nome atualizado.' });
    });

    test('updateNome responds with 404 when not found', async () => {
        repository.update.mock.mockImplementation(async () => ({ affectedRows: 0 }));
        const res = responseMock();
        await controller.updateNome({ params: { id: '99' }, body: { nome: 'Novo' } }, res);
        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'EPI não encontrado.' });
    });

    test('deleteEpiController deletes and responds with 200', async () => {
        repository.deleteEpi.mock.mockImplementation(async () => ({ affectedRows: 1 }));
        const res = responseMock();
        await controller.deleteEpiController({ params: { id: '7' } }, res);
        assert.deepEqual(repository.deleteEpi.mock.calls[0].arguments, ['7']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, { message: 'EPI apagado.' });
    });

    test('deleteEpiController responds with 404 when not found', async () => {
        repository.deleteEpi.mock.mockImplementation(async () => ({ affectedRows: 0 }));
        const res = responseMock();
        await controller.deleteEpiController({ params: { id: '99' } }, res);
        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'EPI não encontrado.' });
    });

    const failures = [
        ['createEpi', 'create', { body: { nome: 'EPI', valor: 10, quantidade: 2 } }],
        ['getAll', 'findAll', {}],
        ['getById', 'findById', { params: { id: '7' } }],
        ['updateNome', 'update', { params: { id: '7' }, body: { nome: 'Novo' } }],
        ['deleteEpiController', 'deleteEpi', { params: { id: '7' } }]
    ];
    for (const [handler, method, req] of failures) {
        test(`${handler} responds with 500 on repository error`, async () => {
            repository[method].mock.mockImplementation(async () => { throw new Error('database error'); });
            const res = responseMock();
            await controller[handler](req, res);
            assert.equal(res.statusCode, 500);
            assert.deepEqual(res.body, { message: 'Erro interno.' });
        });
    }
});
