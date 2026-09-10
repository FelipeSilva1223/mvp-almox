const { afterEach, beforeEach, describe, mock, test } = require('node:test');
const assert = require('node:assert/strict');

const databasePath = require.resolve('../database');
const repositoryPath = require.resolve('../repositories/UsuarioRepository');

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

describe('UsuarioRepository', () => {
    test('create inserts a user and returns the query result', async () => {
        const result = { insertId: 1, affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);

        assert.equal(await repository.create('Ana', 'MAT-001'), result);

        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /INSERT INTO usuarios \(nome, matricula\) VALUES \(\?, \?\)/);
        assert.deepEqual(values, ['Ana', 'MAT-001']);
    });

    test('findAll returns all users', async () => {
        const rows = [{ id: 1, nome: 'Ana', matricula: 'MAT-001' }];
        connection.query.mock.mockImplementation(async () => [rows]);

        assert.equal(await repository.findAll(), rows);
        assert.match(
            normalizeSql(connection.query.mock.calls[0].arguments[0]),
            /SELECT id, nome, matricula FROM usuarios/
        );
    });

    test('findById returns the matching user', async () => {
        const user = { id: 7, nome: 'Ana', matricula: 'MAT-001' };
        connection.query.mock.mockImplementation(async () => [[user]]);

        assert.equal(await repository.findById('7'), user);

        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /FROM usuarios WHERE id = \?/);
        assert.deepEqual(values, ['7']);
    });

    test('findById returns null when the user does not exist', async () => {
        connection.query.mock.mockImplementation(async () => [[]]);

        assert.equal(await repository.findById('99'), null);
    });

    test('update changes the user name using values in SQL placeholder order', async () => {
        const result = { affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);

        assert.equal(await repository.update('7', 'Novo nome'), result);

        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /UPDATE usuarios SET nome = \? WHERE id = \?/);
        assert.deepEqual(values, ['Novo nome', '7']);
    });

    test('deleteUser deletes the user and returns the query result', async () => {
        const result = { affectedRows: 1 };
        connection.query.mock.mockImplementation(async () => [result]);

        assert.equal(await repository.deleteUser('7'), result);

        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /DELETE FROM usuarios WHERE id = \?/);
        assert.deepEqual(values, ['7']);
    });

    for (const method of ['create', 'findAll', 'findById', 'update', 'deleteUser']) {
        test(`${method} propagates database errors`, async () => {
            const error = new Error('database error');
            connection.query.mock.mockImplementation(async () => {
                throw error;
            });

            const argumentsByMethod = {
                create: ['Ana', 'MAT-001'],
                findAll: [],
                findById: ['7'],
                update: ['7', 'Novo nome'],
                deleteUser: ['7']
            };

            await assert.rejects(
                repository[method](...argumentsByMethod[method]),
                error
            );
        });
    }
});
