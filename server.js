const { loadEnvFile } = require('node:process');
loadEnvFile();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const almoxarifadoRouters = require('./routers/AlmoxarifadoRouters');
const usuarioRouters = require('./routers/UsuarioRouters');
const funcionarioRouters = require('./routers/FuncionarioRouters');
const ferramentaRouters = require('./routers/FerramentaRouters');
const bemConsumoRouters = require('./routers/BemConsumoRouters');
const epiRouters = require('./routers/EpiRouters');

app.use(express.json());

app.use('/almoxarifados', almoxarifadoRouters);
app.use('/usuarios', usuarioRouters);
app.use('/funcionarios', funcionarioRouters);
app.use('/ferramentas', ferramentaRouters);
app.use('/bens-consumo', bemConsumoRouters);
app.use('/epis', epiRouters);


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
