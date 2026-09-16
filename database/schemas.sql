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
    FOREIGN KEY (almoxarifado_id) REFERENCES almoxarifados(id),
    FOREIGN KEY (item_id) REFERENCES itens(id)
);
