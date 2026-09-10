const { afterEach, beforeEach, describe, mock, test } = require('node:test');
const assert = require('node:assert/strict');

const databasePath = require.resolve('../database');
const repositoryPath = require.resolve('../repositories/FuncionarioRepository');

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

describe('FuncionarioRepository', () => {
    test('create inserts a funcionario', async () => {
        const result = { insertId: 1, affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);

        assert.equal(await repository.create('Ana', 'MAT-001'), result);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /INSERT INTO funcionarios \(nome, matricula\) VALUES \(\?, \?\)/);
        assert.deepEqual(values, ['Ana', 'MAT-001']);
    });

    test('findAll returns all funcionarios', async () => {
        const rows = [{ id: 1, nome: 'Ana', matricula: 'MAT-001' }];
        connection.query.mock.mockImplementation(async () => [rows]);

        assert.equal(await repository.findAll(), rows);
        assert.match(normalizeSql(connection.query.mock.calls[0].arguments[0]), /FROM funcionarios/);
    });

    test('findById returns the matching funcionario', async () => {
        const funcionario = { id: 7, nome: 'Ana', matricula: 'MAT-001' };
        connection.query.mock.mockImplementation(async () => [[funcionario]]);

        assert.equal(await repository.findById('7'), funcionario);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /FROM funcionarios WHERE id = \?/);
        assert.deepEqual(values, ['7']);
    });

    test('findById returns null when the funcionario does not exist', async () => {
        connection.query.mock.mockImplementation(async () => [[]]);
        assert.equal(await repository.findById('99'), null);
    });

    test('update changes nome with values in placeholder order', async () => {
        const result = { affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);

        assert.equal(await repository.update('7', 'Bia'), result);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /UPDATE funcionarios SET nome = \? WHERE id = \?/);
        assert.deepEqual(values, ['Bia', '7']);
    });

    test('deleteFunc deletes the funcionario', async () => {
        const result = { affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);

        assert.equal(await repository.deleteFunc('7'), result);
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /DELETE FROM funcionarios WHERE id = \?/);
        assert.deepEqual(values, ['7']);
    });

    const errorArguments = {
        create: ['Ana', 'MAT-001'],
        findAll: [],
        findById: ['7'],
        update: ['7', 'Bia'],
        deleteFunc: ['7']
    };

    for (const [method, args] of Object.entries(errorArguments)) {
        test(`${method} propagates database errors`, async () => {
            const error = new Error('database error');
            connection.query.mock.mockImplementation(async () => { throw error; });
            await assert.rejects(repository[method](...args), error);
        });
    }
});
