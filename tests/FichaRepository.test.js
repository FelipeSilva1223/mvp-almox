const { afterEach, beforeEach, describe, mock, test } = require('node:test');
const assert = require('node:assert/strict');

const databasePath = require.resolve('../database');
const repositoryPath = require.resolve('../repositories/FichaRepository');

let connection;
let db;
let repository;

const normalizeSql = sql => sql.replace(/\s+/g, ' ').trim();

beforeEach(() => {
    db = {
        beginTransaction: mock.fn(async () => {}),
        query: mock.fn(),
        commit: mock.fn(async () => {}),
        rollback: mock.fn(async () => {}),
        release: mock.fn()
    };
    connection = { getConnection: mock.fn(async () => db) };
    require.cache[databasePath] = {
        id: databasePath,
        filename: databasePath,
        loaded: true,
        exports: connection
    };
    delete require.cache[repositoryPath];
    repository = require(repositoryPath);
    mock.method(console, 'log', () => {});
});

afterEach(() => {
    mock.restoreAll();
    delete require.cache[repositoryPath];
    delete require.cache[databasePath];
});

describe('FichaRepository', () => {
    test('addItem removes stock and inserts the item in one transaction', async () => {
        const fichaResult = { insertId: 8, affectedRows: 1 };
        const results = [
            [{ affectedRows: 1 }],
            [fichaResult]
        ];
        db.query.mock.mockImplementation(async () => results.shift());

        assert.equal(await repository.addItem(2, 3, 4, 5), fichaResult);

        const [estoqueSql, estoqueValues] = db.query.mock.calls[0].arguments;
        assert.match(normalizeSql(estoqueSql), /UPDATE estoques SET quantidade = quantidade - \?/);
        assert.deepEqual(estoqueValues, [5, 3, 4, 5]);

        const [fichaSql, fichaValues] = db.query.mock.calls[1].arguments;
        assert.match(normalizeSql(fichaSql), /INSERT INTO ficha_itens/);
        assert.deepEqual(fichaValues, [2, 3, 4, 5]);
        assert.equal(db.commit.mock.callCount(), 1);
        assert.equal(db.release.mock.callCount(), 1);
    });

    test('addItem rolls back when stock is insufficient', async () => {
        db.query.mock.mockImplementationOnce(async () => [{ affectedRows: 0 }]);

        await assert.rejects(
            repository.addItem(2, 3, 4, 5),
            /Estoque insuficiente/
        );

        assert.equal(db.query.mock.callCount(), 1);
        assert.equal(db.rollback.mock.callCount(), 1);
        assert.equal(db.commit.mock.callCount(), 0);
        assert.equal(db.release.mock.callCount(), 1);
    });

    test('removeItem updates the ficha and restores stock in one transaction', async () => {
        const fichaResult = { affectedRows: 1 };
        const results = [
            [fichaResult],
            [{ affectedRows: 1 }]
        ];
        db.query.mock.mockImplementation(async () => results.shift());

        assert.equal(await repository.removeItem(8, 3, 4, 2), fichaResult);

        const [fichaSql, fichaValues] = db.query.mock.calls[0].arguments;
        assert.match(normalizeSql(fichaSql), /UPDATE ficha_itens/);
        assert.deepEqual(fichaValues, [2, 2, 2, 2, 8, 3, 4, 2]);

        const [estoqueSql, estoqueValues] = db.query.mock.calls[1].arguments;
        assert.match(normalizeSql(estoqueSql), /UPDATE estoques SET quantidade = quantidade \+ \?/);
        assert.deepEqual(estoqueValues, [2, 3, 4]);
        assert.equal(db.commit.mock.callCount(), 1);
        assert.equal(db.release.mock.callCount(), 1);
    });

    test('removeItem rolls back when the return is invalid', async () => {
        db.query.mock.mockImplementationOnce(async () => [{ affectedRows: 0 }]);

        await assert.rejects(
            repository.removeItem(8, 3, 4, 9),
            /quantidade devolvida inválida/
        );

        assert.equal(db.query.mock.callCount(), 1);
        assert.equal(db.rollback.mock.callCount(), 1);
        assert.equal(db.commit.mock.callCount(), 0);
        assert.equal(db.release.mock.callCount(), 1);
    });
});
