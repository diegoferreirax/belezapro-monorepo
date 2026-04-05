# Implementação da Listagem de Agendamentos do Cliente

Este plano visa resolver o requisito the permitir que o cliente final visualize seu histórico the agendamentos agrupado/filtrado pelas empresas que ele frequenta. 

## Mudanças Propostas

### 1. Backend: Camada de Persistência (MongoDB)
Para suportar ambas visões (a do Administrador que vê seus clientes, e a do Cliente que vê suas empresas), as consultas baseadas em filtros dinâmicos devem evoluir.

#### [MODIFY] `AppointmentRepositoryCustom.java` / `AppointmentRepositoryCustomImpl.java`
- Remover a restrição fixa hardcoded the `adminId` para torná-la condicional (permitindo buscas puramente por `clientId`), OU incluir um novo método `findClientAppointmentsDynamic`.

#### [MODIFY] `AppointmentRepository.java`
- Criar a agregação para obter as empresas únicas relacionadas ao cliente logado:
```java
@Aggregation(pipeline = { "{ $match: { clientId: ?0 } }", "{ $group: { _id: '$companyId' } }" })
List<String> findDistinctCompanyIdsByClientId(String clientId);
```

### 2. Backend: Camada de Negócios e API
Um novo controller dedicado à visão do cliente para isolar totalmente a segurança the operações limitadas aos administradores.

#### [NEW] `ClientAgendaController.java` ou `ClientPortalController.java` (`/api/v1/client-portal/appointments`)
- Anotado com `@RequireRoles({"CLIENT"})`.
- **Endpoint 1:** `GET /companies`: Busca os IDs únicos no `AppointmentRepository`, e em seguida pesquisa os objetos reais (nome, dados) no `CompanyRepository`, retornando uma `List<Company>`.
- **Endpoint 2:** `GET /`: Usa os métodos dinâmicos de paginação, desta vez passando o ID extraído do Token JWT para o campo `clientId`, com filtro opcional de `companyId` da url (`@RequestParam`).

### 3. Frontend: Integração Angular

#### [NEW / MODIFY] `ClientPortalService.ts`
- Mapear a requisição HTTTP para as entidades e paginação com base no `/api/v1/client-portal`.

#### [MODIFY] `client-appointments.component.ts` e `.html`
- Introduzir um array (Signal) `companies = signal<Company[]>([])`.
- Introduzir um filtro ativo (Signal) `selectedCompanyId`.
- Incluir no template (HTML) um Dropdown `<select>` logo ao lado da caixa the pesquisa contendo as empresas carregadas.
- O efeito reativo do Angular (`effect` / ou subscribe na troca da página/company/termo) deverá varrer os agendamentos reais pelo backend em vez de utilizar o Array mockado que consta atualmente.

---

## Perguntas Abertas / Questões de Review

> [!IMPORTANT]
> - O cliente poderá listar *todos* os agendamentos misturados na tela escolhendo algo como **"Todas as Empresas"** no Select? Ou a seleção the uma empresa será obrigatória antes the aparecer a tabela? (Como no Booking Form). Recomendação: Exibir a opção "Todas as Listagens" e carregar todas as empresas the uma vez (companyId opcional). Qual prefere?

> [!WARNING]
> - Podemos nomear o novo controller the `ClientPortalController`? Assim ficaria claro que é exclusivo the ações do Cliente na plataforma multi-tenant.

## Plano de Validação
- **Backend**: Testes manuais / Bruno endpoints verificando e atestando que os endpoints the CLIENT falham se chamados com token de ADMIN, e vice versa. 
- **Frontend**: Logar como `client@belezapro.com` e checar a visualização na listagem.
