const {
    addItem,
    removeItem
} = require('../repositories/FichaRepository');

async function addToFicha (req, res) {
    const { fichaId, almoxarifadoId, itemId, quantidade } = req.body;
    if (quantidade <= 0) {
        return res.status(400).json({
            message: 'Quantidade precisa ser maior que 0'
        });
    };

    try {
        const response = await addItem(fichaId, almoxarifadoId, itemId, quantidade);

        return res.status(200).json(response);

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Erro interno'
        });
    };
};

async function removeFromFicha(req, res) {
    const { fichaItensId, almoxarifadoId, itemId, quantidadeDevolvida } = req.body;
    if (quantidadeDevolvida <= 0) {
    return res.status(400).json({
        message: 'Quantidade devolvida precisa ser maior que 0'
    });
}
    try {
        const response = await removeItem(fichaItensId, almoxarifadoId, itemId, quantidadeDevolvida);

        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Erro interno'
        });
    };
};

module.exports = {
    addToFicha,
    removeFromFicha
};