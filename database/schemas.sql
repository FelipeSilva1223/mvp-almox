CREATE DATABASE IF NOT EXISTS db_almox;

USE db_almox;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS almoxarifados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(45) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS funcionarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    matricula VARCHAR(45) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM ('ferramenta', 'bem_consumo', 'epi') NOT NULL,
    valor DECIMAL (10, 2) NOT NULL DEFAULT 0,
    tag VARCHAR(45) UNIQUE,
    status ENUM('disponivel', 'indisponivel', 'nao_entregue')
);

CREATE TABLE IF NOT EXISTS estoques (
    almoxarifado_id INT NOT NULL,
    item_id INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 0,
    estoque_minimo INT NOT NULL DEFAULT 1,

    PRIMARY KEY (almoxarifado_id, item_id),
    FOREIGN KEY (almoxarifado_id) 
        REFERENCES almoxarifados(id),

    FOREIGN KEY (item_id) 
        REFERENCES itens(id)
);

CREATE TABLE IF NOT EXISTS fichas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    funcionario_id INT NOT NULL UNIQUE,
    FOREIGN KEY (funcionario_id)
        REFERENCES funcionarios(id)
);

CREATE TABLE IF NOT EXISTS ficha_itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    almoxarifado_id INT NOT NULL,
    ficha_id INT NOT NULL,
    item_id INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    CHECK (quantidade >= 0),
    recebido_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    devolvido BOOLEAN NOT NULL DEFAULT FALSE,
    quantidade_devolvida INT NOT NULL DEFAULT 0,
    devolvido_em DATETIME DEFAULT NULL,
    CHECK (quantidade_devolvida >= 0),

    FOREIGN KEY (almoxarifado_id)
        REFERENCES almoxarifados(id),
        
    FOREIGN KEY (ficha_id)
        REFERENCES fichas(id),

    FOREIGN KEY (item_id)
        REFERENCES itens(id)
);
