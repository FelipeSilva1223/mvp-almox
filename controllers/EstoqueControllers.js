const estoqueRepository = require('../repositories/EstoqueRepository');

async function createEstoque(req, res) {
    try {
        const { almoxarifado_id, item_id, quantidade, estoque_minimo } = req.body;
        const response = await estoqueRepository.create(almoxarifado_id, item_id, quantidade, estoque_minimo);
        return res.status(201).json(response);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erro interno.' });
    };
};

async function getAll(req, res) {
    try {
        const response = await estoqueRepository.findAll();
        if (response.length === 0) {
            return res.status(404).json({ message: 'Nenhum estoque cadastrado.' });
        };
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erro interno.' });
    };
};

async function getById(req, res) {
    try {
        const response = await estoqueRepository.findById(req.params.almoxarifadoId, req.params.itemId);
        if (!response) {
            return res.status(404).json({ message: 'Estoque não encontrado.' });
        };
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erro interno.' });
    };
};

async function updateEstoque(req, res) {
    try {
        const { quantidade, estoque_minimo } = req.body;
        const response = await estoqueRepository.update(
            req.params.almoxarifadoId,
            req.params.itemId,
            quantidade,
            estoque_minimo
        );
        if (response.affectedRows === 0) {
            return res.status(404).json({ message: 'Estoque não encontrado.' });
        };
        return res.status(200).json({ message: 'Estoque atualizado.' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erro interno.' });
    };
};

async function deleteEstoque(req, res) {
    try {
        const response = await estoqueRepository.deleteStock(req.params.almoxarifadoId, req.params.itemId);
        if (response.affectedRows === 0) {
            return res.status(404).json({ message: 'Estoque não encontrado.' });
        };
        return res.status(200).json({ message: 'Estoque apagado.' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erro interno.' });
    };
};

module.exports = { 
    createEstoque,
    getAll,
    getById,
    updateEstoque,
    deleteEstoque };
