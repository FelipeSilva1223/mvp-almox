const { afterEach, beforeEach, describe, mock, test } = require('node:test');
const assert = require('node:assert/strict');

const databasePath = require.resolve('../database');
const repositoryPath = require.resolve('../repositories/BemConsumoRepository');
let connection;
let repository;

const normalizeSql = (sql) => sql.replace(/\s+/g, ' ').trim();

beforeEach(() => {
    connection = { query: mock.fn() };
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

describe('BemConsumoRepository', () => {
    test('create inserts all fields into bens_consumo', async () => {
        const result = { insertId: 1, affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);

        assert.equal(await repository.create('Luva', 12.5, 20), result);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /INSERT INTO bens_consumo \(nome, valor, quantidade\) VALUES \(\?, \?, \?\)/);
        assert.deepEqual(values, ['Luva', 12.5, 20]);
    });

    test('findAll returns all bens de consumo', async () => {
        const rows = [{ id: 1, nome: 'Luva', valor: 12.5, quantidade: 20 }];
        connection.query.mock.mockImplementation(async () => [rows]);

        assert.equal(await repository.findAll(), rows);
        assert.match(normalizeSql(connection.query.mock.calls[0].arguments[0]), /SELECT id, nome, valor, quantidade FROM bens_consumo/);
    });

    test('findById returns the matching bem de consumo', async () => {
        const bem = { id: 7, nome: 'Luva', valor: 12.5, quantidade: 20 };
        connection.query.mock.mockImplementation(async () => [[bem]]);

        assert.equal(await repository.findById('7'), bem);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /FROM bens_consumo WHERE id = \?/);
        assert.deepEqual(values, ['7']);
    });

    test('findById returns null when not found', async () => {
        connection.query.mock.mockImplementation(async () => [[]]);
        assert.equal(await repository.findById('99'), null);
    });

    test('update changes only nome in placeholder order', async () => {
        const result = { affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);

        assert.equal(await repository.update('7', 'Luva nitrílica'), result);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /UPDATE bens_consumo SET nome = \? WHERE id = \?/);
        assert.doesNotMatch(normalizeSql(sql), /SET (valor|quantidade)/);
        assert.deepEqual(values, ['Luva nitrílica', '7']);
    });

    test('deleteBem deletes from bens_consumo', async () => {
        const result = { affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);

        assert.equal(await repository.deleteBem('7'), result);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /DELETE FROM bens_consumo WHERE id = \?/);
        assert.deepEqual(values, ['7']);
    });

    const errorArguments = {
        create: ['Luva', 12.5, 20],
        findAll: [],
        findById: ['7'],
        update: ['7', 'Luva nitrílica'],
        deleteBem: ['7']
    };

    for (const [method, args] of Object.entries(errorArguments)) {
        test(`${method} propagates database errors`, async () => {
            const error = new Error('database error');
            connection.query.mock.mockImplementation(async () => { throw error; });
            await assert.rejects(repository[method](...args), error);
        });
    }
});
