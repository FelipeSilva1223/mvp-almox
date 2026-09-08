const { loadEnvFile } = require('node:process');
loadEnvFile();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const almoxarifadoRouters = require('./routers/AlmoxaridoRouters');

app.use(express.json());

app.use('/', almoxarifadoRouters);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});