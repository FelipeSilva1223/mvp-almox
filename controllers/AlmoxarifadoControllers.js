const {
    create,
    findAll,
    findById,
    update,
    deleteAlmox} = require('../repositories/AlmoxarifadoRepository')

async function createAlmoxarifado(req, res) {
    try {
        const nome = req.body.nome;
        const response = await create(nome);

        return res.status(201).json(response)
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: 'Erro interno'
        });
    };
};
    
async function getAll(req, res) {
    try {
        const response = await findAll();

        if(response.length > 0) {
            return res.status(200).json(response);
        } else { 
            return res.status(404).json({
                message: 'Nenhum almoxarifado cadastrado.'
            });
        };
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Erro interno'
        });
    };
};

async function getById(req, res) {
    const id = req.params.id;
    try {
        const response = await findById(id);

        if(!response) {
            return res.status(404).json({
                message: 'Unidade não encontrada.'
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
    const id = req.params.id;
    const nome = req.body.nome;
    try {
        const response = await update(id, nome);

        if (response.affectedRows === 0) {
            return res.status(404).json({
                message: 'Unidade não encontrada.'
            });
        };

        return res.status(200).json({
            message: 'Nome atualizado.'
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Erro interno'
        });
    };
};

async function deleteAlmoxarifado(req, res) {
    const id = req.params.id;
    try {
        const response = await deleteAlmox(id);

        if (response.affectedRows === 0) {
            return res.status(404).json({
                message: 'Unidade não encontrada.'
            });
        };

        return res.status(200).json({
            message: 'Unidade excluída.'
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Erro interno'
        });
    };
};

module.exports = {
    createAlmoxarifado,
    getAll,
    getById,
    updateNome,
    deleteAlmoxarifado};