const {
    create,
    findAll,
    findById,
    update,
    deleteUser
} = require('../repositories/UsuarioRepository');

async function createUsuario(req, res) {
    try {
        const nome = req.body.nome;
        const matricula = req.body.matricula;
        const response = await create(nome, matricula);

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
            return res.status(200).json(response)
        } else {
            return res.status(404).json({
                message: 'Nenhum usuário cadastrado.'
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

        if(!response) {
            return res.status(404).json({
                message: 'Usuário não encontrado.'
            });
        };

        return res.status(200).json(response);
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Erro interno'
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
                message: 'Usuário não encontrado.'
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

async function deleteUsuario(req, res) {
    try {
        const id = req.params.id;
        const response = await deleteUser(id);

        if (response.affectedRows == 0) {
            return res.status(404).json({
                message: 'Usuário não encontrado.'
            });
        };
        return res.status(200).json({
            message: 'Usuário apagado.'
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Erro interno.'
        });
    };
};

module.exports = {
    createUsuario,
    getAll,
    getById,
    updateNome,
    deleteUsuario
};