const express = require('express');
const routers = express.Router();

const {
    createAlmoxarifado,
    getAll,
    getById
} = require('../controllers/AlmoxarifadoControllers')

routers.get('/almoxarifado', getAll);
routers.get('/almoxarifado/:id', getById)

routers.post('/almoxarifado', createAlmoxarifado)

module.exports = routers;