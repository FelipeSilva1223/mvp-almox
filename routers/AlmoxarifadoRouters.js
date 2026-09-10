const express = require('express');
const routers = express.Router();

const {
    createAlmoxarifado,
    getAll,
    getById,
    updateNome,
    deleteAlmoxarifado
} = require('../controllers/AlmoxarifadoControllers');

routers.get('/', getAll);
routers.get('/:id', getById);

routers.post('/', createAlmoxarifado);

routers.patch('/:id', updateNome);

routers.delete('/:id', deleteAlmoxarifado);

module.exports = routers;
