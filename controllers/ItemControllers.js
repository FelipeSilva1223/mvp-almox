const itemRepository = require('../repositories/ItemRepository');

async function createItem(req, res) {
    try {
        const { nome, tipo, valor, tag, status } = req.body;
        const response = await itemRepository.create(nome, tipo, valor, tag, status);
        return res.status(201).json(response);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erro interno.' });
    };
};

async function getAll(req, res) {
    try {
        const response = await itemRepository.findAll();
        if (response.length === 0) {
            return res.status(404).json({ message: 'Nenhum item cadastrado.' });
        };
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erro interno.' });
    };
};

async function getById(req, res) {
    try {
        const response = await itemRepository.findById(req.params.id);
        if (!response) {
            return res.status(404).json({ message: 'Item não encontrado.' });
        };
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erro interno.' });
    };
};

async function updateNome(req, res) {
    try {
        const response = await itemRepository.update(req.params.id, req.body.nome);
        if (response.affectedRows === 0) {
            return res.status(404).json({ message: 'Item não encontrado.' });
        };
        return res.status(200).json({ message: 'Nome atualizado.' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erro interno.' });
    };
};

async function deleteItem(req, res) {
    try {
        const response = await itemRepository.deleteItem(req.params.id);
        if (response.affectedRows === 0) {
            return res.status(404).json({ message: 'Item não encontrado.' });
        };
        return res.status(200).json({ message: 'Item apagado.' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erro interno.' });
    };
};

module.exports = { createItem, getAll, getById, updateNome, deleteItem };
