const { afterEach, beforeEach, describe, mock, test } = require('node:test');
const assert = require('node:assert/strict');

const repositoryPath = require.resolve('../repositories/UsuarioRepository');
const controllerPath = require.resolve('../controllers/UsuarioControllers');

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
        deleteUser: mock.fn()
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

describe('UsuarioControllers', () => {
    test('createUsuario creates a user and responds with 201', async () => {
        const result = { insertId: 1, affectedRows: 1 };
        repository.create.mock.mockImplementation(async () => result);
        const res = responseMock();

        await controller.createUsuario({ body: { nome: 'Ana', matricula: 'MAT-001' } }, res);

        assert.deepEqual(repository.create.mock.calls[0].arguments, ['Ana', 'MAT-001']);
        assert.equal(res.statusCode, 201);
        assert.deepEqual(res.body, result);
    });

    test('getAll responds with 200 and all users', async () => {
        const users = [{ id: 1, nome: 'Ana', matricula: 'MAT-001' }];
        repository.findAll.mock.mockImplementation(async () => users);
        const res = responseMock();

        await controller.getAll({}, res);

        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, users);
    });

    test('getAll responds with 404 when there are no users', async () => {
        repository.findAll.mock.mockImplementation(async () => []);
        const res = responseMock();

        await controller.getAll({}, res);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Nenhum usuário cadastrado.' });
    });

    test('getById responds with 200 when the user exists', async () => {
        const user = { id: 7, nome: 'Ana', matricula: 'MAT-001' };
        repository.findById.mock.mockImplementation(async () => user);
        const res = responseMock();

        await controller.getById({ params: { id: '7' } }, res);

        assert.deepEqual(repository.findById.mock.calls[0].arguments, ['7']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, user);
    });

    test('getById responds with 404 when the user does not exist', async () => {
        repository.findById.mock.mockImplementation(async () => null);
        const res = responseMock();

        await controller.getById({ params: { id: '99' } }, res);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Usuário não encontrado.' });
    });

    test('updateNome updates the name and responds with 200', async () => {
        repository.update.mock.mockImplementation(async () => ({ affectedRows: 1 }));
        const res = responseMock();

        await controller.updateNome({ params: { id: '7' }, body: { nome: 'Bia' } }, res);

        assert.deepEqual(repository.update.mock.calls[0].arguments, ['7', 'Bia']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, { message: 'Nome atualizado.' });
    });

    test('updateNome responds with 404 when the user does not exist', async () => {
        repository.update.mock.mockImplementation(async () => ({ affectedRows: 0 }));
        const res = responseMock();

        await controller.updateNome({ params: { id: '99' }, body: { nome: 'Bia' } }, res);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Usuário não encontrado.' });
    });

    test('deleteUsuario deletes the user and responds with 200', async () => {
        repository.deleteUser.mock.mockImplementation(async () => ({ affectedRows: 1 }));
        const res = responseMock();

        await controller.deleteUsuario({ params: { id: '7' } }, res);

        assert.deepEqual(repository.deleteUser.mock.calls[0].arguments, ['7']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, { message: 'Usuário apagado.' });
    });

    test('deleteUsuario responds with 404 when the user does not exist', async () => {
        repository.deleteUser.mock.mockImplementation(async () => ({ affectedRows: 0 }));
        const res = responseMock();

        await controller.deleteUsuario({ params: { id: '99' } }, res);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Usuário não encontrado.' });
    });

    const errorCases = [
        ['createUsuario', 'create', { body: { nome: 'Ana', matricula: 'MAT-001' } }, 'Erro interno.'],
        ['getAll', 'findAll', {}, 'Erro interno.'],
        ['getById', 'findById', { params: { id: '7' } }, 'Erro interno'],
        ['updateNome', 'update', { params: { id: '7' }, body: { nome: 'Bia' } }, 'Erro interno.'],
        ['deleteUsuario', 'deleteUser', { params: { id: '7' } }, 'Erro interno.']
    ];

    for (const [handler, method, req, message] of errorCases) {
        test(`${handler} responds with 500 when the repository throws`, async () => {
            repository[method].mock.mockImplementation(async () => {
                throw new Error('database error');
            });
            const res = responseMock();

            await controller[handler](req, res);

            assert.equal(res.statusCode, 500);
            assert.deepEqual(res.body, { message });
        });
    }
});
