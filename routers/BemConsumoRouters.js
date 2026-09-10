const express = require('express');
const routers = express.Router();

const {
    createBemConsumo,
    getAll,
    getById,
    updateNome,
    deleteBemConsumo
} = require('../controllers/BemConsumoControllers');

routers.get('/', getAll);
routers.get('/:id', getById);

routers.post('/', createBemConsumo);

routers.patch('/:id', updateNome);

routers.delete('/:id', deleteBemConsumo);

module.exports = routers;
