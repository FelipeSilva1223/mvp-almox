const express = require('express');
const routers = express.Router();

const {
    createUsuario,
    getAll,
    getById,
    updateNome,
    deleteUsuario
} = require('../controllers/UsuarioControllers');

routers.get('/', getAll);
routers.get('/:id', getById);

routers.post('/', createUsuario);

routers.patch('/:id', updateNome);

routers.delete('/:id', deleteUsuario);

module.exports = routers;