# Checklist por fase (execução incremental)

Use este arquivo como controle entre pausas para revisão. Marque os itens conforme forem concluídos.

## Fase 0 — Documentação (este pacote)

- [x] Pasta `.doc/migracao-mobile-admin/` criada
- [x] `README.md`
- [x] `comparativo-angular-expo.md`
- [x] `api-e-estado.md`
- [x] `agenda-e-horarios.md`
- [x] `checklist-por-feature.md`

## Fase 1 — Fundação API no mobile

- [x] Variável de ambiente para `apiUrl` (paridade com `environment.apiUrl`)
- [x] `apiClient` (fetch, JSON, headers, erros)
- [x] `QueryClient` + provider no layout raiz
- [x] Tipos / mapeamentos copiados ou gerados a partir de `salon.models` + paginação Spring

## Fase 2 — Autenticação admin

- [x] Tela login (email/senha) → `POST /auth/login`
- [x] Armazenamento seguro do token
- [x] Decodificar claims mínimas (role, exp) para guards de navegação
- [x] Logout limpando storage + cache de queries

## Fase 3 — Shell de navegação admin

- [x] Grupo de rotas autenticadas vs públicas (Expo Router)
- [x] Tabs alinhados ao admin (Início + **Serviços**; aba Explore oculta na barra; agendamentos/horários/etc. nas próximas fases)
- [x] Ocultar “Usuários” se não for ROOT

## Fase 4 — Serviços (catálogo)

- [x] Listagem `GET /services`
- [x] Criar / editar / excluir com mutations + invalidação

## Fase 5 — Clientes

- [x] Lista `GET /clients`
- [x] Criar/editar, toggle block — paridade com `ClientService`
- [] TODO: Criar agendamento direto pelo cliente (quando toda a parte de agendamento estiver concluída)

## Fase 6 — Despesas

- [x] Lista por mês/ano + CRUD + marcar pago

## Fase 7 — Usuários sistema (ROOT)

- [x] Lista paginada + filtros
- [x] CRUD / toggle block conforme `SystemUserService`

## Fase 8 — Horários (crítico)

- [ ] Carregar e exibir config padrão e overrides
- [ ] Modos padrão vs semana específica
- [ ] Salvar com mesma regra de diff e payload stripado que o web
- [ ] Fluxo de conflito ao fechar dia (modal + cancelamento em massa se aceito)

## Fase 9 — Agendamentos

- [ ] Lista paginada + busca
- [ ] Modais criar/editar/cancelar/concluir (regras de status como no web)
- [ ] Calendário semanal (implementação alinhada a [agenda-e-horarios.md](./agenda-e-horarios.md))
- [ ] Integração com dados de schedule (bounds, bloqueios, slots)

---

**Ordem sugerida:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → **8** → **9** (horários antes da agenda facilita testes realistas; se inverter 9 e 8, documentar o motivo aqui).
