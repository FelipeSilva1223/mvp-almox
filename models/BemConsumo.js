class BemConsumo {
    constructor(id, nome, valor, quantidade, estoqueMinimo) {
        this.id = id;
        this.nome = nome;
        this.valor = valor;
        this.quantidade = quantidade;
        this.estoqueMinimo = estoqueMinimo;
    };
};

module.exports = BemConsumo;