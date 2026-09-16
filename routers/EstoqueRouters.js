const express = require('express');
const routers = express.Router();
const { createEstoque, getAll, getById, updateEstoque, deleteEstoque } = require('../controllers/EstoqueControllers');

routers.get('/', getAll);
routers.get('/:almoxarifadoId/:itemId', getById);
routers.post('/', createEstoque);
routers.patch('/:almoxarifadoId/:itemId', updateEstoque);
routers.delete('/:almoxarifadoId/:itemId', deleteEstoque);

module.exports = routers;
