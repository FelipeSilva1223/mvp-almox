const {
    create,
    findAll,
    findById,
    update,
    deleteFerr
} = require('../repositories/FerramentaRepository');

async function createFerramenta(req, res) {
    try {
        const nome = req.body.nome;
        const tag = req.body.tag;
        const status = req.body.status;
        const valor = req.body.valor;
        const response = await create(nome, tag, status, valor);

        return res.status(201).json(response);

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Erro interno.'
        });
    };
};

async function getAll(req, res) {
    try {
        const response = await findAll();

        if (response.length > 0) {
            return res.status(200).json(response);
        } else {
            return res.status(404).json({
                message: 'Nenhuma ferramenta cadastrada.'
            });
        };

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Erro interno.'
        });
    };
};

async function getById(req, res) {
    try {
        const id = req.params.id;
        const response = await findById(id);

        if (!response) {
            return res.status(404).json({
                message: 'Ferramenta não encontrada.'
            });
        };

        return res.status(200).json(response);

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Erro interno.'
        });
    };
};

async function updateNome(req, res) {
    try {
        const id = req.params.id;
        const nome = req.body.nome;
        const response = await update(id, nome);

        if (response.affectedRows === 0) {
            return res.status(404).json({
                message: 'Ferramenta não encontrada.'
            });
        };

        return res.status(200).json({
            message: 'Nome atualizado.'
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Erro interno.'
        });
    };
};

async function deleteFerramenta(req, res) {
    try {
        const id = req.params.id;
        const response = await deleteFerr(id);

        if (response.affectedRows === 0) {
            return res.status(404).json({
                message: 'Ferramenta não encontrada.'
            });
        };

        return res.status(200).json({
            message: 'Ferramenta apagada.'
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Erro interno.'
        });
    };
};

module.exports = {
    createFerramenta,
    getAll,
    getById,
    updateNome,
    deleteFerramenta
};
