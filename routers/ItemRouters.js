const express = require('express');
const routers = express.Router();
const { createItem, getAll, getById, updateNome, deleteItem } = require('../controllers/ItemControllers');

routers.get('/', getAll);
routers.get('/:id', getById);
routers.post('/', createItem);
routers.patch('/:id', updateNome);
routers.delete('/:id', deleteItem);

module.exports = routers;
