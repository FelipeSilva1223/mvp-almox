# MVP Almox

Sistema de controle de almoxarifados desenvolvido com Node.js, Express e MySQL.

## Pré-requisitos

- Node.js 24 ou versão compatível
- MySQL 8 ou versão compatível

## Configuração

1. Instale as dependências:

```powershell
npm install
```

2. Copie `.env.example` para `.env` e informe as credenciais do MySQL:

```powershell
Copy-Item .env.example .env
```

3. Crie o banco e as tabelas:

```powershell
npm.cmd run db:init
```

4. Opcionalmente, carregue os dados de demonstração:

```powershell
npm.cmd run seed
```

5. Inicie a aplicação:

```powershell
npm.cmd start
```

Link do server: `http://localhost:3000`

## Comandos

```text
npm.cmd start         Inicia o servidor
npm.cmd test          Executa todos os testes
npm.cmd run db:init   Cria o banco e as tabelas ausentes
npm.cmd run seed      Adiciona dados de demonstração sem sobrescrever os existentes
npm.cmd run setup     Inicializa o banco e adiciona os dados de demonstração
```