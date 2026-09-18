const { afterEach, beforeEach, describe, mock, test } = require('node:test');
const assert = require('node:assert/strict');

const repositoryPath = require.resolve('../repositories/FichaRepository');
const controllerPath = require.resolve('../controllers/FichaControllers');

let repository;
let controller;

function responseMock() {
    return {
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
};

beforeEach(() => {
    repository = {
        addItem: mock.fn(),
        removeItem: mock.fn()
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

describe('FichaControllers', () => {
    test('addToFicha sends the item data to the repository', async () => {
        const result = { insertId: 8, affectedRows: 1 };
        repository.addItem.mock.mockImplementation(async () => result);
        const res = responseMock();

        await controller.addToFicha({
            body: { fichaId: 2, almoxarifadoId: 3, itemId: 4, quantidade: 5 }
        }, res);

        assert.deepEqual(repository.addItem.mock.calls[0].arguments, [2, 3, 4, 5]);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body, result);
    });

    test('addToFicha rejects a non-positive quantity', async () => {
        const res = responseMock();
        await controller.addToFicha({ body: { quantidade: 0 } }, res);
        assert.equal(res.statusCode, 400);
        assert.equal(repository.addItem.mock.callCount(), 0);
    });

    test('removeFromFicha sends the return data to the repository', async () => {
        const result = { affectedRows: 1 };
        repository.removeItem.mock.mockImplementation(async () => result);
        const res = responseMock();

        await controller.removeFromFicha({
            body: {
                fichaItensId: 8,
                almoxarifadoId: 3,
                itemId: 4,
                quantidadeDevolvida: 2
            }
        }, res);

        assert.deepEqual(repository.removeItem.mock.calls[0].arguments, [8, 3, 4, 2]);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body, result);
    });

    test('removeFromFicha rejects a non-positive quantity', async () => {
        const res = responseMock();
        await controller.removeFromFicha({ body: { quantidadeDevolvida: 0 } }, res);
        assert.equal(res.statusCode, 400);
        assert.equal(repository.removeItem.mock.callCount(), 0);
    });

    for (const [handler, method, body] of [
        ['addToFicha', 'addItem', { quantidade: 1 }],
        ['removeFromFicha', 'removeItem', { quantidadeDevolvida: 1 }]
    ]) {
        test(`${handler} responds with 500 on repository error`, async () => {
            repository[method].mock.mockImplementation(async () => {
                throw new Error('database error');
            });
            const res = responseMock();

            await controller[handler]({ body }, res);

            assert.equal(res.statusCode, 500);
            assert.deepEqual(res.body, { message: 'Erro interno' });
        });
    };
});
