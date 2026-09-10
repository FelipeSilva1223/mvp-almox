const express = require('express');
const routers = express.Router();

const {
    createFerramenta,
    getAll,
    getById,
    updateNome,
    deleteFerramenta
} = require('../controllers/FerramentaControllers');

routers.get('/', getAll);
routers.get('/:id', getById);

routers.post('/', createFerramenta);

routers.patch('/:id', updateNome);

routers.delete('/:id', deleteFerramenta);

module.exports = routers;
