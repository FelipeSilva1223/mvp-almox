const { afterEach, beforeEach, describe, mock, test } = require('node:test');
const assert = require('node:assert/strict');

const repositoryPath = require.resolve('../repositories/FerramentaRepository');
const controllerPath = require.resolve('../controllers/FerramentaControllers');

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
        deleteFerr: mock.fn()
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

describe('FerramentaControllers', () => {
    test('createFerramenta sends all fields and responds with 201', async () => {
        const result = { insertId: 1, affectedRows: 1 };
        repository.create.mock.mockImplementation(async () => result);
        const res = responseMock();

        await controller.createFerramenta({
            body: {
                nome: 'Furadeira',
                tag: 'FER-001',
                status: 'disponivel',
                valor: 499.9
            }
        }, res);

        assert.deepEqual(
            repository.create.mock.calls[0].arguments,
            ['Furadeira', 'FER-001', 'disponivel', 499.9]
        );
        assert.equal(res.statusCode, 201);
        assert.deepEqual(res.body, result);
    });

    test('getAll responds with 200 and all ferramentas', async () => {
        const rows = [{ id: 1, nome: 'Furadeira', tag: 'FER-001', status: 'disponivel', valor: 499.9 }];
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
        assert.deepEqual(res.body, { message: 'Nenhuma ferramenta cadastrada.' });
    });

    test('getById responds with 200 when found', async () => {
        const ferramenta = { id: 7, nome: 'Furadeira', tag: 'FER-001', status: 'disponivel', valor: 499.9 };
        repository.findById.mock.mockImplementation(async () => ferramenta);
        const res = responseMock();

        await controller.getById({ params: { id: '7' } }, res);

        assert.deepEqual(repository.findById.mock.calls[0].arguments, ['7']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, ferramenta);
    });

    test('getById responds with 404 when not found', async () => {
        repository.findById.mock.mockImplementation(async () => null);
        const res = responseMock();

        await controller.getById({ params: { id: '99' } }, res);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Ferramenta não encontrada.' });
    });

    test('updateNome sends only id and nome and responds with 200', async () => {
        repository.update.mock.mockImplementation(async () => ({ affectedRows: 1 }));
        const res = responseMock();

        await controller.updateNome({
            params: { id: '7' },
            body: { nome: 'Furadeira nova', status: 'indisponivel' }
        }, res);

        assert.deepEqual(repository.update.mock.calls[0].arguments, ['7', 'Furadeira nova']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, { message: 'Nome atualizado.' });
    });

    test('updateNome responds with 404 when not found', async () => {
        repository.update.mock.mockImplementation(async () => ({ affectedRows: 0 }));
        const res = responseMock();

        await controller.updateNome({ params: { id: '99' }, body: { nome: 'Nova' } }, res);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Ferramenta não encontrada.' });
    });

    test('deleteFerramenta uses deleteFerr and responds with 200', async () => {
        repository.deleteFerr.mock.mockImplementation(async () => ({ affectedRows: 1 }));
        const res = responseMock();

        await controller.deleteFerramenta({ params: { id: '7' } }, res);

        assert.deepEqual(repository.deleteFerr.mock.calls[0].arguments, ['7']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, { message: 'Ferramenta apagada.' });
    });

    test('deleteFerramenta responds with 404 when not found', async () => {
        repository.deleteFerr.mock.mockImplementation(async () => ({ affectedRows: 0 }));
        const res = responseMock();

        await controller.deleteFerramenta({ params: { id: '99' } }, res);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Ferramenta não encontrada.' });
    });

    const errors = [
        ['createFerramenta', 'create', { body: { nome: 'Furadeira', tag: 'FER-001', status: 'disponivel', valor: 499.9 } }],
        ['getAll', 'findAll', {}],
        ['getById', 'findById', { params: { id: '7' } }],
        ['updateNome', 'update', { params: { id: '7' }, body: { nome: 'Nova' } }],
        ['deleteFerramenta', 'deleteFerr', { params: { id: '7' } }]
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
