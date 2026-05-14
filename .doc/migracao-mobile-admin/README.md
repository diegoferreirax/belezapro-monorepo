# Migração admin: Angular web → app React Native (Expo)

Este diretório concentra a documentação da migração das funcionalidades de **administrador / funcionário** (e evolução futura ligada à **empresa**) do frontend Angular para o aplicativo em [mobile/](../../mobile/).

## Escopo

- **Incluído:** equivalente ao que hoje está em `frontend/src/app/features/admin/` (login, agendamentos, serviços, clientes, horários, despesas, usuários root).
- **Excluído (por ora):** `client`, `public` e fluxos fora do perfil admin no app móvel.

## Documentos

| Arquivo | Conteúdo |
|---------|-----------|
| [comparativo-angular-expo.md](./comparativo-angular-expo.md) | Mapeamento feature a feature e diferenças de UX plataforma. |
| [api-e-estado.md](./api-e-estado.md) | Contrato com a API Java, camada HTTP e padrão de loading/dados centralizado. |
| [agenda-e-horarios.md](./agenda-e-horarios.md) | Pontos críticos de agenda e configuração de horários; decisão de calendário. |
| [checklist-por-feature.md](./checklist-por-feature.md) | Fases executáveis com pausa para revisão entre features. |

## Referências rápidas no monorepo

- Rotas admin web: `frontend/src/app/app.routes.ts` (prefixo `/admin`).
- Serviços HTTP e modelos: `frontend/src/app/core/services/`, `frontend/src/app/core/models/`.
- App móvel: `mobile/` (Expo Router, ver `mobile/package.json`).

## Como usar este material

Siga o [checklist-por-feature.md](./checklist-por-feature.md) em ordem. Entre uma fase e outra, valide comportamento e ajuste este texto se a decisão de produto ou técnica mudar.
