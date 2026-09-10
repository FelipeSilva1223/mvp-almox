const { afterEach, beforeEach, describe, mock, test } = require('node:test');
const assert = require('node:assert/strict');
const databasePath = require.resolve('../database');
const repositoryPath = require.resolve('../repositories/EpiRepository');
let connection;
let repository;
const sqlText = (sql) => sql.replace(/\s+/g, ' ').trim();

beforeEach(() => {
    connection = { query: mock.fn() };
    require.cache[databasePath] = { id: databasePath, filename: databasePath, loaded: true, exports: connection };
    delete require.cache[repositoryPath];
    repository = require(repositoryPath);
    mock.method(console, 'log', () => {});
});

afterEach(() => {
    mock.restoreAll();
    delete require.cache[repositoryPath];
    delete require.cache[databasePath];
});

describe('EpiRepository', () => {
    test('create inserts all fields into epis', async () => {
        const result = { insertId: 1, affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);
        assert.equal(await repository.create('Capacete', 80.5, 10), result);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(sqlText(sql), /INSERT INTO epis \(nome, valor, quantidade\) VALUES \(\?, \?, \?\)/);
        assert.deepEqual(values, ['Capacete', 80.5, 10]);
    });

    test('findAll selects and returns all EPIs', async () => {
        const rows = [{ id: 1, nome: 'Capacete', valor: 80.5, quantidade: 10 }];
        connection.query.mock.mockImplementation(async () => [rows]);
        assert.equal(await repository.findAll(), rows);
        assert.match(sqlText(connection.query.mock.calls[0].arguments[0]), /SELECT id, nome, valor, quantidade FROM epis/);
    });

    test('findById returns one EPI and passes its id', async () => {
        const epi = { id: 7, nome: 'Capacete', valor: 80.5, quantidade: 10 };
        connection.query.mock.mockImplementation(async () => [[epi]]);
        assert.equal(await repository.findById('7'), epi);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(sqlText(sql), /FROM epis WHERE id = \?/);
        assert.deepEqual(values, ['7']);
    });

    test('findById returns null when not found', async () => {
        connection.query.mock.mockImplementation(async () => [[]]);
        assert.equal(await repository.findById('99'), null);
    });

    test('update changes only nome in placeholder order', async () => {
        const result = { affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);
        assert.equal(await repository.update('7', 'Capacete novo'), result);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(sqlText(sql), /UPDATE epis SET nome = \? WHERE id = \?/);
        assert.doesNotMatch(sqlText(sql), /SET (valor|quantidade)/);
        assert.deepEqual(values, ['Capacete novo', '7']);
    });

    test('deleteEpi deletes from epis', async () => {
        const result = { affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);
        assert.equal(await repository.deleteEpi('7'), result);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(sqlText(sql), /DELETE FROM epis WHERE id = \?/);
        assert.deepEqual(values, ['7']);
    });

    const failures = { create: ['EPI', 10, 2], findAll: [], findById: ['7'], update: ['7', 'Novo'], deleteEpi: ['7'] };
    for (const [method, args] of Object.entries(failures)) {
        test(`${method} propagates database errors`, async () => {
            const error = new Error('database error');
            connection.query.mock.mockImplementation(async () => { throw error; });
            await assert.rejects(repository[method](...args), error);
        });
    }
});
