const express = require('express');
const routers = express.Router();

const {
    createFuncionario,
    getAll,
    getById,
    updateNome
} = require('../controllers/FuncionarioControllers');

const { addToFicha, removeFromFicha } = require('../controllers/FichaControllers');

routers.get('/', getAll);
routers.get('/:id', getById);

routers.post('/', createFuncionario);
routers.post('/receber-item', addToFicha);

routers.patch('/devolucao-item', removeFromFicha);
routers.patch('/:id', updateNome);

module.exports = routers;
