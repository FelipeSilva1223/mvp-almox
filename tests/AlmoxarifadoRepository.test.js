const { afterEach, beforeEach, describe, mock, test } = require('node:test');
const assert = require('node:assert/strict');

const databasePath = require.resolve('../database');
const repositoryPath = require.resolve('../repositories/AlmoxarifadoRepository');

let connection;
let repository;

function normalizeSql(sql) {
    return sql.replace(/\s+/g, ' ').trim();
}

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

describe('AlmoxarifadoRepository plural table name', () => {
    test('create inserts into almoxarifados', async () => {
        const result = { insertId: 1, affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);

        assert.equal(await repository.create('Central'), result);
        assert.match(normalizeSql(connection.query.mock.calls[0].arguments[0]), /INSERT INTO almoxarifados \(nome\) VALUES \(\?\)/);
        assert.deepEqual(connection.query.mock.calls[0].arguments[1], ['Central']);
    });

    test('findAll selects from almoxarifados', async () => {
        const rows = [{ id: 1, nome: 'Central' }];
        connection.query.mock.mockImplementation(async () => [rows]);

        assert.equal(await repository.findAll(), rows);
        assert.match(normalizeSql(connection.query.mock.calls[0].arguments[0]), /FROM almoxarifados/);
    });

    test('findById selects from almoxarifados', async () => {
        const row = { id: 7, nome: 'Central' };
        connection.query.mock.mockImplementation(async () => [[row]]);

        assert.equal(await repository.findById('7'), row);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /FROM almoxarifados WHERE almoxarifados\.id = \?/);
        assert.deepEqual(values, ['7']);
    });

    test('update modifies almoxarifados', async () => {
        const result = { affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);

        assert.equal(await repository.update('7', 'Novo nome'), result);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /UPDATE almoxarifados SET nome = \? WHERE id = \?/);
        assert.deepEqual(values, ['Novo nome', '7']);
    });

    test('deleteAlmox deletes from almoxarifados', async () => {
        const result = { affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);

        assert.equal(await repository.deleteAlmox('7'), result);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /DELETE FROM almoxarifados WHERE id = \?/);
        assert.deepEqual(values, ['7']);
    });
});
