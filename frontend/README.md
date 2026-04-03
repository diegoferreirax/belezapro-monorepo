# 💅 BelezaPro

Sistema de agendamento automatizado para serviços de manicure, pedicure e podologia.

Este projeto é uma aplicação full-stack moderna construída com **Angular 21+**, focada em oferecer uma experiência fluida tanto para administradores quanto para clientes do salão.

## 🚀 Tecnologias Principais

- **Frontend:** Angular 21+ (Standalone Components, Signals, Zoneless)
- **Estilização:** Tailwind CSS 4+
- **Animações:** Motion (Vanilla JS)
- **Banco de Dados:** SQLite (via Node.js/Express para SSR/API)
- **Testes:** Vitest

## 📂 Estrutura do Projeto

O projeto segue uma arquitetura modular baseada em responsabilidades:

- `src/app/core`: Lógica global, serviços singleton, modelos e guards.
- `src/app/shared`: Componentes, pipes e diretivas reutilizáveis em múltiplas features.
- `src/app/features`: Módulos de funcionalidade (Admin, Client, Public).

Para detalhes completos da arquitetura, veja [docs/architecture.md](docs/architecture.md).

## 🛠️ Como Rodar

### Pré-requisitos
- Node.js 20+
- npm

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:3000`.

### Testes
```bash
npm test
```

## 📖 Documentação Detalhada

- [Arquitetura e Padrões](docs/architecture.md)
- [Serviços e Lógica Core](docs/core-services.md) (Em breve)
- [Funcionalidades do Sistema](docs/features.md) (Em breve)
- [Estratégia de Testes](docs/testing.md) (Em breve)
