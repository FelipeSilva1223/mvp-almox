const { afterEach, beforeEach, describe, mock, test } = require('node:test');
const assert = require('node:assert/strict');

const repositoryPath = require.resolve('../repositories/FuncionarioRepository');
const controllerPath = require.resolve('../controllers/FuncionarioControllers');

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
        deleteFunc: mock.fn()
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

describe('FuncionarioControllers', () => {
    test('createFuncionario creates and responds with 201', async () => {
        const result = { insertId: 1, affectedRows: 1 };
        repository.create.mock.mockImplementation(async () => result);
        const res = responseMock();

        await controller.createFuncionario({ body: { nome: 'Ana', matricula: 'MAT-001' } }, res);

        assert.deepEqual(repository.create.mock.calls[0].arguments, ['Ana', 'MAT-001']);
        assert.equal(res.statusCode, 201);
        assert.deepEqual(res.body, result);
    });

    test('getAll responds with 200 and all funcionarios', async () => {
        const rows = [{ id: 1, nome: 'Ana', matricula: 'MAT-001' }];
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
        assert.deepEqual(res.body, { message: 'Nenhum funcionário cadastrado.' });
    });

    test('getById responds with 200 when found', async () => {
        const funcionario = { id: 7, nome: 'Ana', matricula: 'MAT-001' };
        repository.findById.mock.mockImplementation(async () => funcionario);
        const res = responseMock();

        await controller.getById({ params: { id: '7' } }, res);

        assert.deepEqual(repository.findById.mock.calls[0].arguments, ['7']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, funcionario);
    });

    test('getById responds with 404 when not found', async () => {
        repository.findById.mock.mockImplementation(async () => null);
        const res = responseMock();

        await controller.getById({ params: { id: '99' } }, res);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Funcionário não encontrado.' });
    });

    test('updateNome updates and responds with 200', async () => {
        repository.update.mock.mockImplementation(async () => ({ affectedRows: 1 }));
        const res = responseMock();

        await controller.updateNome({ params: { id: '7' }, body: { nome: 'Bia' } }, res);

        assert.deepEqual(repository.update.mock.calls[0].arguments, ['7', 'Bia']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, { message: 'Nome atualizado.' });
    });

    test('updateNome responds with 404 when not found', async () => {
        repository.update.mock.mockImplementation(async () => ({ affectedRows: 0 }));
        const res = responseMock();

        await controller.updateNome({ params: { id: '99' }, body: { nome: 'Bia' } }, res);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Funcionário não encontrado.' });
    });

    test('deleteFuncionario uses deleteFunc and responds with 200', async () => {
        repository.deleteFunc.mock.mockImplementation(async () => ({ affectedRows: 1 }));
        const res = responseMock();

        await controller.deleteFuncionario({ params: { id: '7' } }, res);

        assert.deepEqual(repository.deleteFunc.mock.calls[0].arguments, ['7']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, { message: 'Funcionário apagado.' });
    });

    test('deleteFuncionario responds with 404 when not found', async () => {
        repository.deleteFunc.mock.mockImplementation(async () => ({ affectedRows: 0 }));
        const res = responseMock();

        await controller.deleteFuncionario({ params: { id: '99' } }, res);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Funcionário não encontrado.' });
    });

    const errors = [
        ['createFuncionario', 'create', { body: { nome: 'Ana', matricula: 'MAT-001' } }],
        ['getAll', 'findAll', {}],
        ['getById', 'findById', { params: { id: '7' } }],
        ['updateNome', 'update', { params: { id: '7' }, body: { nome: 'Bia' } }],
        ['deleteFuncionario', 'deleteFunc', { params: { id: '7' } }]
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
