const { afterEach, beforeEach, describe, mock, test } = require('node:test');
const assert = require('node:assert/strict');

const databasePath = require.resolve('../database');
const repositoryPath = require.resolve('../repositories/FuncionarioRepository');

let connection;
let db;
let repository;

const normalizeSql = (sql) => sql.replace(/\s+/g, ' ').trim();

beforeEach(() => {
    db = {
        beginTransaction: mock.fn(async () => {}),
        query: mock.fn(),
        commit: mock.fn(async () => {}),
        rollback: mock.fn(async () => {}),
        release: mock.fn()
    };
    connection = {
        query: mock.fn(),
        getConnection: mock.fn(async () => db)
    };
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
    test('create inserts a funcionario and its ficha in one transaction', async () => {
        const results = [
            [{ insertId: 1, affectedRows: 1 }],
            [{ insertId: 5, affectedRows: 1 }]
        ];
        db.query.mock.mockImplementation(async () => results.shift());

        assert.deepEqual(await repository.create('Ana', 'MAT-001'), {
            funcionarioId: 1,
            fichaId: 5
        });

        assert.equal(db.beginTransaction.mock.callCount(), 1);
        assert.equal(db.commit.mock.callCount(), 1);
        assert.equal(db.rollback.mock.callCount(), 0);
        assert.equal(db.release.mock.callCount(), 1);

        const [funcionarioSql, funcionarioValues] = db.query.mock.calls[0].arguments;
        assert.match(normalizeSql(funcionarioSql), /INSERT INTO funcionarios \(nome, matricula\) VALUES \(\?, \?\)/);
        assert.deepEqual(funcionarioValues, ['Ana', 'MAT-001']);

        const [fichaSql, fichaValues] = db.query.mock.calls[1].arguments;
        assert.match(normalizeSql(fichaSql), /INSERT INTO fichas \(funcionario_id\) VALUES \(\?\)/);
        assert.deepEqual(fichaValues, [1]);
    });

    test('findAll returns all funcionarios', async () => {
        const rows = [{
            funcionario_id: 1,
            nome: 'Ana',
            matricula: 'MAT-001',
            ficha_id: 5,
            ficha_item_id: null
        }];
        connection.query.mock.mockImplementation(async () => [rows]);

        assert.deepEqual(await repository.findAll(), [{
            id: 1,
            nome: 'Ana',
            matricula: 'MAT-001',
            ficha: { id: 5, itens: [] }
        }]);
        assert.match(normalizeSql(connection.query.mock.calls[0].arguments[0]), /LEFT JOIN fichas/);
    });

    test('findById returns the matching funcionario', async () => {
        const rows = [{
            funcionario_id: 7,
            nome: 'Ana',
            matricula: 'MAT-001',
            ficha_id: 5,
            ficha_item_id: 12,
            item_id: 3,
            item_nome: 'Alicate',
            tipo: 'ferramenta',
            valor: '25.00',
            tag: null,
            status: 'disponivel',
            almoxarifado_id: 2,
            almoxarifado: 'Central',
            quantidade: 1,
            quantidade_devolvida: 0,
            recebido_em: '2026-09-18',
            devolvido: 0,
            devolvido_em: null
        }];
        connection.query.mock.mockImplementation(async () => [rows]);

        assert.deepEqual(await repository.findById('7'), {
            id: 7,
            nome: 'Ana',
            matricula: 'MAT-001',
            ficha: {
                id: 5,
                itens: [{
                    id: 12,
                    itemId: 3,
                    nome: 'Alicate',
                    tipo: 'ferramenta',
                    valor: '25.00',
                    tag: null,
                    status: 'disponivel',
                    almoxarifadoId: 2,
                    almoxarifado: 'Central',
                    quantidade: 1,
                    quantidadeDevolvida: 0,
                    recebidoEm: '2026-09-18',
                    devolvido: false,
                    devolvidoEm: null
                }]
            }
        });
        const [sql, values] = connection.query.mock.calls[0].arguments;
        assert.match(normalizeSql(sql), /WHERE funcionarios.id = \?/);
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

    const errorArguments = {
        findAll: [],
        findById: ['7'],
        update: ['7', 'Bia']
    };

    for (const [method, args] of Object.entries(errorArguments)) {
        test(`${method} propagates database errors`, async () => {
            const error = new Error('database error');
            connection.query.mock.mockImplementation(async () => { throw error; });
            await assert.rejects(repository[method](...args), error);
        });
    }

    test('create rolls back and propagates database errors', async () => {
        const error = new Error('database error');
        db.query.mock.mockImplementation(async () => { throw error; });

        await assert.rejects(repository.create('Ana', 'MAT-001'), error);
        assert.equal(db.rollback.mock.callCount(), 1);
        assert.equal(db.commit.mock.callCount(), 0);
        assert.equal(db.release.mock.callCount(), 1);
    });
});
