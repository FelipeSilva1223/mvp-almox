const { afterEach, beforeEach, describe, mock, test } = require('node:test');
const assert = require('node:assert/strict');

const databasePath = require.resolve('../database');
const repositoryPath = require.resolve('../repositories/FerramentaRepository');

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

describe('FerramentaRepository', () => {
    test('create inserts all ferramenta fields', async () => {
        const result = { insertId: 1, affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);

        assert.equal(
            await repository.create('Furadeira', 'FER-001', 'disponivel', 499.9),
            result
        );

        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(
            normalizeSql(sql),
            /INSERT INTO ferramentas \(nome, tag, status, valor\) VALUES \(\?, \?, \?, \?\)/
        );
        assert.deepEqual(values, ['Furadeira', 'FER-001', 'disponivel', 499.9]);
    });

    test('findAll returns all ferramentas', async () => {
        const rows = [{
            id: 1,
            nome: 'Furadeira',
            tag: 'FER-001',
            status: 'disponivel',
            valor: 499.9
        }];
        connection.query.mock.mockImplementation(async () => [rows]);

        assert.equal(await repository.findAll(), rows);
        assert.match(
            normalizeSql(connection.query.mock.calls[0].arguments[0]),
            /SELECT id, nome, tag, status, valor FROM ferramentas/
        );
    });

    test('findById returns the matching ferramenta', async () => {
        const ferramenta = {
            id: 7,
            nome: 'Furadeira',
            tag: 'FER-001',
            status: 'disponivel',
            valor: 499.9
        };
        connection.query.mock.mockImplementation(async () => [[ferramenta]]);

        assert.equal(await repository.findById('7'), ferramenta);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /FROM ferramentas WHERE id = \?/);
        assert.deepEqual(values, ['7']);
    });

    test('findById returns null when the ferramenta does not exist', async () => {
        connection.query.mock.mockImplementation(async () => [[]]);
        assert.equal(await repository.findById('99'), null);
    });

    test('update changes only nome and follows placeholder order', async () => {
        const result = { affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);

        assert.equal(await repository.update('7', 'Furadeira nova'), result);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /UPDATE ferramentas SET nome = \? WHERE id = \?/);
        assert.doesNotMatch(normalizeSql(sql), /SET (tag|status|valor)/);
        assert.deepEqual(values, ['Furadeira nova', '7']);
    });

    test('deleteFerr deletes the ferramenta', async () => {
        const result = { affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);

        assert.equal(await repository.deleteFerr('7'), result);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /DELETE FROM ferramentas WHERE id = \?/);
        assert.deepEqual(values, ['7']);
    });

    const errorArguments = {
        create: ['Furadeira', 'FER-001', 'disponivel', 499.9],
        findAll: [],
        findById: ['7'],
        update: ['7', 'Furadeira nova'],
        deleteFerr: ['7']
    };

    for (const [method, args] of Object.entries(errorArguments)) {
        test(`${method} propagates database errors`, async () => {
            const error = new Error('database error');
            connection.query.mock.mockImplementation(async () => { throw error; });
            await assert.rejects(repository[method](...args), error);
        });
    }
});
