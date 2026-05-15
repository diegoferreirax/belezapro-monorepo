# API Java e estado de comunicação no app

## Base URL e versão

O frontend web usa `environment.apiUrl`, por exemplo `http://localhost:8080/api/v1` (`frontend/src/environments/environment.ts`). O app deve usar a mesma convenção via variável de ambiente Expo (`EXPO_PUBLIC_API_URL` ou equivalente definido no projeto).

## Endpoints usados pelo admin (referência Angular)

Resumo a partir de `frontend/src/app/core/services/`:

| Domínio | Métodos / paths principais |
|---------|----------------------------|
| Auth | `POST /auth/login` — body `{ email, password }` → `{ token }` |
| Agendamentos | `GET /appointments` (paginação Spring), `GET /appointments/range`, `GET /appointments/active/date/{date}`, `POST/PUT/DELETE /appointments/...`, `PATCH /appointments/cancel/date/{date}` |
| Horários | `GET/PUT /schedule/config`, `GET/PUT /schedule/overrides` |
| Serviços | `GET/POST /services`, `PUT/DELETE /services/{id}` |
| Clientes | `GET/POST /clients`, `PUT /clients/{id}`, `PATCH /clients/{id}/toggle-block` |
| Despesas | `GET /expenses?month=&year=`, `POST/PUT/DELETE`, `PATCH /expenses/{id}/paid` |
| Usuários | `GET /users?page=&size=&...`, `POST/PUT/DELETE`, `PATCH /users/{id}/toggle-block` |

Tipos de payload e modelos: espelhar `frontend/src/app/core/models/salon.models.ts` e `pagination.models.ts` no app (pasta `src/types` ou similar).

## Autenticação

- **Web:** `authInterceptor` adiciona `Authorization: Bearer <token>` lendo `auth_token` do `LocalStorageRepository`.
- **App:** persistir o token de forma segura (ex.: `expo-secure-store`), montar o header no `apiClient` ou num fetch wrapper único.
- Tratar **401** de forma centralizada (limpar sessão e redirecionar para login).

## Loading e dados “juntos” (objetivo do app)

No Angular, `ApiService` mantém um **contador global** de requisições ativas e um `isLoading` signal (`frontend/src/app/core/services/api.service.ts`). Isso evita espalhar flags manuais para *tudo*, mas **não** acopla `loading` ao `data` por operação.

No React Native, o alinhamento recomendado com esse objetivo é:

1. **`apiClient`:** função única `request<T>(path, options)` com base URL, JSON, headers de auth e tratamento de erro HTTP.
2. **TanStack Query (`@tanstack/react-query`):** cada leitura vira `useQuery` com `{ data, isPending, isFetching, isError, error, refetch }`; mutações com `useMutation` e `invalidateQueries` após sucesso.
3. **Spinner global (opcional):** `useIsFetching()` no layout raiz, análogo ao loading global do Angular, sem obrigar cada tela a duplicar estado.

Assim, as telas consomem **um objeto de estado por query** em vez de `useState` para `isLoading` em todo componente.

## Paginação Spring

Vários `GET` retornam página no formato Spring (`content`, `totalElements`, `number`, `size`, ...). O `AppointmentService` e `SystemUserService` já mapeiam para `PageResponse` no frontend — repetir o mesmo mapeamento no app para consistência.

## Logout e limpeza de cache

No web, `AuthService.logout` limpa caches de tenant (`SalonService`, `ClientService`, `ScheduleService`, `ExpenseService`). No app, ao deslogar: limpar secure storage **e** `queryClient.clear()` (ou remover queries por prefixo de chave).

## Implementação no mobile (fase 1)

| Peça | Caminho |
|------|---------|
| Base URL + dev fallback | `mobile/src/config/env.ts` (`EXPO_PUBLIC_API_URL`) |
| Exemplo de env | `mobile/.env.example` |
| Tipagem `ProcessEnv` | `mobile/types/process-env.d.ts` |
| `fetch` + `ApiHttpError` + Bearer opcional | `mobile/src/api/client.ts` (`apiRequest`) |
| Token (reader registrável na fase 2) | `mobile/src/api/access-token.ts` |
| `QueryClient` | `mobile/src/api/query-client.ts` |
| Provider | `mobile/app/_providers.tsx` (usado em `mobile/app/_layout.tsx`) |
| Modelos + `mapSpringPageToPageResponse` | `mobile/src/types/salon.models.ts`, `mobile/src/types/pagination.models.ts` |
