const { afterEach, beforeEach, describe, mock, test } = require('node:test');
const assert = require('node:assert/strict');

const repositoryPath = require.resolve('../repositories/AlmoxarifadoRepository');
const controllerPath = require.resolve('../controllers/AlmoxarifadoControllers');

let repository;
let controller;

function createResponse() {
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
        deleteAlmox: mock.fn()
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

describe('createAlmoxarifado', () => {
    test('creates an almoxarifado and responds with 201', async () => {
        const result = { insertId: 1, affectedRows: 1 };
        repository.create.mock.mockImplementation(async () => result);
        const req = { body: { nome: 'Central' } };
        const res = createResponse();

        await controller.createAlmoxarifado(req, res);

        assert.deepEqual(repository.create.mock.calls[0].arguments, ['Central']);
        assert.equal(res.statusCode, 201);
        assert.deepEqual(res.body, result);
    });

    test('responds with 500 when the repository throws', async () => {
        repository.create.mock.mockImplementation(async () => {
            throw new Error('database error');
        });
        const res = createResponse();

        await controller.createAlmoxarifado({ body: { nome: 'Central' } }, res);

        assert.equal(res.statusCode, 500);
        assert.deepEqual(res.body, { message: 'Erro interno' });
    });
});

describe('getAll', () => {
    test('responds with 200 and all records', async () => {
        const records = [{ id: 1, nome: 'Central' }];
        repository.findAll.mock.mockImplementation(async () => records);
        const res = createResponse();

        await controller.getAll({}, res);

        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, records);
    });

    test('responds with 404 when there are no records', async () => {
        repository.findAll.mock.mockImplementation(async () => []);
        const res = createResponse();

        await controller.getAll({}, res);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Nenhum almoxarifado cadastrado.' });
    });

    test('responds with 500 when the repository throws', async () => {
        repository.findAll.mock.mockImplementation(async () => {
            throw new Error('database error');
        });
        const res = createResponse();

        await controller.getAll({}, res);

        assert.equal(res.statusCode, 500);
        assert.deepEqual(res.body, { message: 'Erro interno' });
    });
});

describe('getById', () => {
    test('responds with 200 when the record exists', async () => {
        const record = { id: 7, nome: 'Central' };
        repository.findById.mock.mockImplementation(async () => record);
        const res = createResponse();

        await controller.getById({ params: { id: '7' } }, res);

        assert.deepEqual(repository.findById.mock.calls[0].arguments, ['7']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, record);
    });

    test('responds with 404 when the record does not exist', async () => {
        repository.findById.mock.mockImplementation(async () => null);
        const res = createResponse();

        await controller.getById({ params: { id: '99' } }, res);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Unidade não encontrada.' });
    });

    test('responds with 500 when the repository throws', async () => {
        repository.findById.mock.mockImplementation(async () => {
            throw new Error('database error');
        });
        const res = createResponse();

        await controller.getById({ params: { id: '7' } }, res);

        assert.equal(res.statusCode, 500);
        assert.deepEqual(res.body, { message: 'Erro interno.' });
    });
});

describe('updateNome', () => {
    test('updates the name and responds with 200', async () => {
        repository.update.mock.mockImplementation(async () => ({ affectedRows: 1 }));
        const res = createResponse();

        await controller.updateNome(
            { params: { id: '7' }, body: { nome: 'Novo nome' } },
            res
        );

        assert.deepEqual(repository.update.mock.calls[0].arguments, ['7', 'Novo nome']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, { message: 'Nome atualizado.' });
    });

    test('responds with 404 when the record does not exist', async () => {
        repository.update.mock.mockImplementation(async () => ({ affectedRows: 0 }));
        const res = createResponse();

        await controller.updateNome(
            { params: { id: '99' }, body: { nome: 'Novo nome' } },
            res
        );

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Unidade não encontrada.' });
    });

    test('responds with 500 when the repository throws', async () => {
        repository.update.mock.mockImplementation(async () => {
            throw new Error('database error');
        });
        const res = createResponse();

        await controller.updateNome(
            { params: { id: '7' }, body: { nome: 'Novo nome' } },
            res
        );

        assert.equal(res.statusCode, 500);
        assert.deepEqual(res.body, { message: 'Erro interno' });
    });
});

describe('deleteAlmoxarifado', () => {
    test('deletes the record and responds with 200', async () => {
        repository.deleteAlmox.mock.mockImplementation(async () => ({ affectedRows: 1 }));
        const res = createResponse();

        await controller.deleteAlmoxarifado({ params: { id: '7' } }, res);

        assert.deepEqual(repository.deleteAlmox.mock.calls[0].arguments, ['7']);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, { message: 'Unidade excluída.' });
    });

    test('responds with 404 when the record does not exist', async () => {
        repository.deleteAlmox.mock.mockImplementation(async () => ({ affectedRows: 0 }));
        const res = createResponse();

        await controller.deleteAlmoxarifado({ params: { id: '99' } }, res);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { message: 'Unidade não encontrada.' });
    });

    test('responds with 500 when the repository throws', async () => {
        repository.deleteAlmox.mock.mockImplementation(async () => {
            throw new Error('database error');
        });
        const res = createResponse();

        await controller.deleteAlmoxarifado({ params: { id: '7' } }, res);

        assert.equal(res.statusCode, 500);
        assert.deepEqual(res.body, { message: 'Erro interno' });
    });
});
