# BelezaPro — Frontend

Sistema de agendamento para serviços de manicure, pedicure e podologia. Esta pasta contém a **SPA Angular** do monorepo; a persistência e regras de negócio ficam na API Java em [`../backend`](../backend).

## Papel no monorepo

| Camada | Tecnologia | Onde |
|--------|------------|------|
| **Este app** | Angular 21 (standalone, signals, zoneless), Angular Material, Tailwind CSS 4, Motion | `frontend/` |
| **API REST** | Spring Boot 4, Java 21, JWT, e-mail | `backend/` |
| **Banco** | MongoDB | `docker-compose.yml` na raiz do monorepo |

O frontend consome a API (JSON). Em desenvolvimento, o backend expõe CORS para `http://localhost:4200` (veja `backend/src/main/resources/application.properties`). A área **Financeiro / despesas** (admin) persiste em `GET|POST|PUT|DELETE|PATCH /api/v1/expenses` (escopo do profissional logado); dados antigos em `localStorage` (`salon_expenses`) não são migrados automaticamente.

## Stack deste projeto

- **Angular 21+** — componentes standalone, Signals, sem Zone.js
- **Estilização** — Tailwind CSS 4+
- **UI** — Angular Material e CDK
- **Animações** — Motion
- **Autenticação no cliente** — JWT (`jwt-decode`)
- **SSR** — `@angular/ssr` com servidor Node/Express para build de produção (não substitui a API Spring; é apenas entrega/renderização do app)
- **Testes** — Vitest (via `ng test`)

## Estrutura de pastas

- `src/app/core` — serviços singleton, guards, modelos compartilhados
- `src/app/shared` — componentes, pipes e diretivas reutilizáveis
- `src/app/features` — telas por persona (admin, cliente, público)

Detalhes em [docs/architecture.md](docs/architecture.md).

## Pré-requisitos

- Node.js 20+
- npm
- Para fluxo completo: **Docker** (MongoDB), **JDK 21** e **Gradle** (backend)

## Instalação

```bash
cd frontend
npm install
```

## Desenvolvimento

Servidor de desenvolvimento do Angular (porta padrão **4200**):

```bash
npm start
```

Equivalente: `ng serve`. A aplicação fica em `http://localhost:4200`.

> **Nota:** não existe o script `npm run dev` neste projeto; use `npm start` ou `ng serve`.

A URL base da API em desenvolvimento está em `src/environments/environment.ts` (`http://localhost:8080/api/v1`). Ajuste se o backend usar outra porta ou path.

## Rodar o stack local (visão geral)

1. Na **raiz do monorepo**, subir o MongoDB:

   ```bash
   docker compose up -d
   ```

2. No diretório `backend/`, subir a API (porta **8080**), por exemplo: `./gradlew bootRun` (Linux/macOS) ou `gradlew.bat bootRun` (Windows).

3. Subir o **frontend** com `npm start` nesta pasta.

Credenciais e URI do MongoDB devem bater com `application.properties` do backend (usuário/senha do container e `authSource`).

## Build e SSR

```bash
npm run build
```

Para servir o artefato SSR gerado (após build):

```bash
npm run serve:ssr:app
```

## Testes e lint

```bash
npm test
npm run lint
```

## Documentação adicional

- [Arquitetura e padrões](docs/architecture.md)
- [Funcionalidades](docs/features.md) (quando disponível)
- [Testes](docs/testing.md) (quando disponível)

Coleções HTTP de referência: pasta `.doc/bruno/` na raiz do monorepo.
