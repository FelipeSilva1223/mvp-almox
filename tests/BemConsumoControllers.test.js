const { afterEach, beforeEach, describe, mock, test } = require('node:test');
const assert = require('node:assert/strict');

const repositoryPath = require.resolve('../repositories/BemConsumoRepository');
const controllerPath = require.resolve('../controllers/BemConsumoControllers');
let repository;
let controller;

function responseMock() {
    const res = {
        statusCode: null,
        body: undefined,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
    mock.method(res, 'status');
    mock.method(res, 'json');
    return res;
}

beforeEach(() => {
    repository = {
        create: mock.fn(),
        findAll: mock.fn(),
        findById: mock.fn(),
        update: mock.fn(),
        deleteBem: mock.fn()
    };
    require.cache[repositoryPath] = {
        id: repositoryPath,
        filename: repositoryPath,
        loaded: true,
        exports: repository
    };
    delete require.cache[controllerPath];
    controller = require(controllerPath);
    mock.method(console, 'log', () => {});
});

afterEach(() => {
    mock.restoreAll();
    delete require.cache[controllerPath];
    delete require.cache[repositoryPath];
});

describe('BemConsumoControllers', () => {
    test('createBemConsumo sends all fields and responds with 201', async () => {
        const result = { insertId: 1, affectedRows: 1 };
        repository.create.mock.mockImplementation(async () => result);
        const res = responseMock();

        await controller.createBemConsumo({
            body: { nome: 'Luva', valor: 12.5, quantidade: 20 }
        }, res);

        assert.deepEqual(repository.create.mock.calls[0].arguments, ['Luva', 12.5, 20]);
        assert.equal(res.statusCode, 201);
        assert.deepEqual(res.body, result);
    });

    test('getAll responds with 200 and all bens de consumo', async () => {
        const rows = [{ id: 1, nome: 'Luva', valor: 12.5, quantidade: 20 }];
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
        assert.deepEqual(res.body, { message: 'Nenhum bem de consumo cadastrado.' });
    });

    test('getById responds with 200 when found', async () => {
        const bem = { id: 7, nome: 'Luva', valor: 12.5, quantidade: 20 };
        repository.findById.mock.mockImplementation(async () => bem);
        const res = responseMock();

        await controller.getById({ params: { id: '7' } }, res);

        assert.deepEqual(repository.findById.mock.calls[0].arguments, ['7']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, bem);
    });

    test('getById responds with 404 when not found', async () => {
        repository.findById.mock.mockImplementation(async () => null);
        const res = responseMock();

        await controller.getById({ params: { id: '99' } }, res);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Bem de consumo não encontrado.' });
    });

    test('updateNome sends only id and nome and responds with 200', async () => {
        repository.update.mock.mockImplementation(async () => ({ affectedRows: 1 }));
        const res = responseMock();

        await controller.updateNome({
            params: { id: '7' },
            body: { nome: 'Luva nitrílica', valor: 20, quantidade: 100 }
        }, res);

        assert.deepEqual(repository.update.mock.calls[0].arguments, ['7', 'Luva nitrílica']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, { message: 'Nome atualizado.' });
    });

    test('updateNome responds with 404 when not found', async () => {
        repository.update.mock.mockImplementation(async () => ({ affectedRows: 0 }));
        const res = responseMock();

        await controller.updateNome({ params: { id: '99' }, body: { nome: 'Nova' } }, res);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Bem de consumo não encontrado.' });
    });

    test('deleteBemConsumo uses deleteBem and responds with 200', async () => {
        repository.deleteBem.mock.mockImplementation(async () => ({ affectedRows: 1 }));
        const res = responseMock();

        await controller.deleteBemConsumo({ params: { id: '7' } }, res);

        assert.deepEqual(repository.deleteBem.mock.calls[0].arguments, ['7']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, { message: 'Bem de consumo apagado.' });
    });

    test('deleteBemConsumo responds with 404 when not found', async () => {
        repository.deleteBem.mock.mockImplementation(async () => ({ affectedRows: 0 }));
        const res = responseMock();

        await controller.deleteBemConsumo({ params: { id: '99' } }, res);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Bem de consumo não encontrado.' });
    });

    const errors = [
        ['createBemConsumo', 'create', { body: { nome: 'Luva', valor: 12.5, quantidade: 20 } }],
        ['getAll', 'findAll', {}],
        ['getById', 'findById', { params: { id: '7' } }],
        ['updateNome', 'update', { params: { id: '7' }, body: { nome: 'Nova' } }],
        ['deleteBemConsumo', 'deleteBem', { params: { id: '7' } }]
    ];

    for (const [handler, method, req] of errors) {
        test(`${handler} responds with 500 on repository error`, async () => {
            repository[method].mock.mockImplementation(async () => { throw new Error('database error'); });
            const res = responseMock();

            await controller[handler](req, res);

            assert.equal(res.statusCode, 500);
            assert.deepEqual(res.body, { message: 'Erro interno.' });
        });
    }
});
