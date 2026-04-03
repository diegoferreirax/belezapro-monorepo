# Plano de Ação: Otimização the Paginação Server-Side (Spring Data)

## Contexto e Problema
A tabela the usuários da role `ROOT` puxava os registros the uma vez do cache e operava paginação no front-end. O plano de ação é delegar a performance de memória e processamento para o Backend e garantir a robustez de lidar com milhares de clientes sem congelamentos da aba.

## 1. Componente the Paginação the UI (Reaproveitamento)
- Analisar e re-adotar a TAG visual Componente de Paginação já existente `<app-pagination>` na nova Grid.
- Realizar Injeção de dependência reativa the Inputs/Outputs: `[currentPage]`, `[pageSize]`, e reagir aos cliques (emissões de eventos) `(pageChange)` e `(pageSizeChange)`.

## 2. Estrutura do Backend (Spring Data MongoDB)
- Subistituir Arrays pesadas em retornos The Controller.
- No `UserRepository` e serviço/camadas do `UserService`, adotar o pacote nativo **Pageable**.
- O endpoint Java sofrerá refatoração e receberá anotações em rota:
  - `@RequestParam(defaultValue = "0") int page`
  - `@RequestParam(defaultValue = "10") int size`  
O Spring fará o Skip e Limit dentro da querie do Mongo sem trazer a lista inteira pra Ram Java.

## 3. Lógica Reativa the Atualização Visual no Angular
- Mudar tipagem da Store via HTTP para aceitar O DTO The Pages (Retorno contendo `.content`, `.totalElements`, `.totalPages`).
- Usar a arquitetura reativa **Signals** (`signal(1)`) + Manipuladores `toObservable()` agrupada num `combineLatest([refresh, página, limites])` engatado no `switchMap()`. Assim a mínima alteração num evento da barra visual recarrega a requisição na hora the forma transparente.
