const express = require('express');
const routers = express.Router();

const {
    createAlmoxarifado,
    getAll,
    getById,
    updateNome,
    deleteAlmoxarifado
} = require('../controllers/AlmoxarifadoControllers');

routers.get('/almoxarifado', getAll);
routers.get('/almoxarifado/:id', getById);

routers.post('/almoxarifado', createAlmoxarifado);

routers.patch('/almoxarifado/:id', updateNome);

routers.delete('/almoxarifado/:id', deleteAlmoxarifado);

module.exports = routers;