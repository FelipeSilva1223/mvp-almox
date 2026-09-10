const express = require('express');
const routers = express.Router();

const {
    createFuncionario,
    getAll,
    getById,
    updateNome,
    deleteFuncionario
} = require('../controllers/FuncionarioControllers');

routers.get('/', getAll);
routers.get('/:id', getById);

routers.post('/', createFuncionario);

routers.patch('/:id', updateNome);

routers.delete('/:id', deleteFuncionario);

module.exports = routers;
