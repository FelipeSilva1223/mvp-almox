const express = require('express');
const routers = express.Router();

const {
    createEpi,
    getAll,
    getById,
    updateNome,
    deleteEpiController
} = require('../controllers/EpiControllers');

routers.get('/', getAll);
routers.get('/:id', getById);
routers.post('/', createEpi);
routers.patch('/:id', updateNome);
routers.delete('/:id', deleteEpiController);

module.exports = routers;
