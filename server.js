const { loadEnvFile } = require('node:process');
loadEnvFile();
const express = require('express');
const path = require('node:path');
const app = express();
const PORT = process.env.PORT || 3000;

const almoxarifadoRouters = require('./routers/AlmoxarifadoRouters');
const usuarioRouters = require('./routers/UsuarioRouters');
const funcionarioRouters = require('./routers/FuncionarioRouters');
const itemRouters = require('./routers/ItemRouters');
const estoqueRouters = require('./routers/EstoqueRouters');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/almoxarifados', almoxarifadoRouters);
app.use('/usuarios', usuarioRouters);
app.use('/funcionarios', funcionarioRouters);
app.use('/itens', itemRouters);
app.use('/estoques', estoqueRouters);


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
