const {
    create,
    findAll,
    findById,
    update,
    deleteEpi
} = require('../repositories/EpiRepository');

async function createEpi(req, res) {
    try {
        const nome = req.body.nome;
        const valor = req.body.valor;
        const quantidade = req.body.quantidade;
        const response = await create(nome, valor, quantidade);
        return res.status(201).json(response);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erro interno.' });
    };
};

async function getAll(req, res) {
    try {
        const response = await findAll();
        if (response.length > 0) {
            return res.status(200).json(response);
        } else {
            return res.status(404).json({ message: 'Nenhum EPI cadastrado.' });
        };
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erro interno.' });
    };
};

async function getById(req, res) {
    try {
        const id = req.params.id;
        const response = await findById(id);
        if (!response) {
            return res.status(404).json({ message: 'EPI não encontrado.' });
        };
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erro interno.' });
    };
};

async function updateNome(req, res) {
    try {
        const id = req.params.id;
        const nome = req.body.nome;
        const response = await update(id, nome);
        if (response.affectedRows === 0) {
            return res.status(404).json({ message: 'EPI não encontrado.' });
        };
        return res.status(200).json({ message: 'Nome atualizado.' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erro interno.' });
    };
};

async function deleteEpiController(req, res) {
    try {
        const id = req.params.id;
        const response = await deleteEpi(id);
        if (response.affectedRows === 0) {
            return res.status(404).json({ message: 'EPI não encontrado.' });
        };
        return res.status(200).json({ message: 'EPI apagado.' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erro interno.' });
    };
};

module.exports = { createEpi, getAll, getById, updateNome, deleteEpiController };
