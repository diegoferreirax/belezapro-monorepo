# Comparativo: Angular (admin web) vs Expo (app)

## Visão geral

| Aspecto | Frontend Angular (`features/admin`) | App Expo (`mobile/`) |
|---------|--------------------------------------|----------------------|
| Navegação | Rotas com `AdminLayoutComponent`, sidebar | `expo-router`: stacks e tabs por papel (ADMIN/ROOT) |
| Estado servidor | `Observable` + `signal` em serviços | Recomendado: TanStack Query + `apiClient` (ver [api-e-estado.md](./api-e-estado.md)) |
| Auth / token | `localStorage` + interceptor HTTP | Secure storage + header em cada request (ou wrapper único) |
| Layout calendário | HTML/CSS, posicionamento absoluto por minuto | Views RN + mesma matemática de slots (ver [agenda-e-horarios.md](./agenda-e-horarios.md)) |

## Mapeamento de features (admin web → app)

| Pasta / rota web | Responsabilidade | Notas para o app |
|------------------|------------------|------------------|
| `admin/login` | Login email/senha (`POST /auth/login`) | Tela inicial não autenticada; após sucesso, ir para shell admin. |
| `admin/appointments` | Lista paginada, modais criar/editar/cancelar/concluir, modo lista/calendário | Maior superfície; calendário semanal é custom no web — replicar UX com grid RN. |
| `admin/schedule` | Horário padrão por dia da semana + exceções por semana; conflitos ao fechar dia | Crítico: mesma sequência de APIs e modais de confirmação que o web. |
| `admin/services` | CRUD catálogo de serviços | Formulários e lista; alinhado a `SalonService` / `/services`. |
| `admin/clients` | Lista clientes, bloqueio, modais | `ClientService` / `/clients`. |
| `admin/expenses` | Despesas por mês/ano, pago/não pago | `ExpenseService` / `/expenses` + query params. |
| `admin/users` (root) | Usuários sistema, paginação, bloquear | Apenas se JWT indicar ROOT; `SystemUserService` / `/users`. |

## O que não entra no app (decisão atual)

- `features/client/**` — portal do cliente.
- `features/public/**` — landing e booking público.
- Fluxos “root” fora do necessário para administrar usuários (se algo existir só na web genérica, revisar caso a caso).

## Multi-tenant / empresa (futuro)

O JWT já carrega `companyId` onde aplicável (`AuthService` no Angular). O app deve respeitar o mesmo tenant implícito da sessão, sem telas públicas de troca de empresa até o produto definir isso.
