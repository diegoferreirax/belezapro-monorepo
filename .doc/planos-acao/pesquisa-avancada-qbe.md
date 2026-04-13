# Plano de Execução: Pesquisa Avançada "And Combinada"

Excelente pivotada no UX! Remover uma "busca cega" por um painel de "Busca Avançada Combinada" (*AND Filters*) entrega muito mais poder para telas admin, como a interface ROOT.

A boa notícia é que o **esforço arquitetural é muito baixo e seguro**, graças aos recursos avançados do Angular (Layout dinâmico) e do Spring Data MongoDB (Query by Example) que podemos alavancar facilmente sem precisar escrever Query Strings gigantes de if/else.

Aqui está o mapa the arquitetura the Busca Avançada Combinada:

## Parte 1: Painel Angular (UX)
1. **Layout**: O botão `"Filtros Avançados"` vai abrir uma grade (Grid Css). Ao iterar sobre ele, revela-se 3 campos específicos:
   - Input: **Nome**
   - Input: **Email**
   - Select: **Role (ROOT, ADMIN, CLIENT, Todos)**
2. **Reatividade**: Expandir o Signal para abranger todo o pacote - `filters = signal({ name: '', email: '', role: '' })`.
3. Adicionar *debounceTime* the 50 ms.

## Parte 2: A Ponte (Angular HttpClient)
Refatoração do `SystemUserService.getUsers(page, size, filters)`. 
Fazer um loop condicional the URL the GET params:
`GET /api/users?page=0&size=10&name=João&role=ADMIN`.  

## Parte 3: O Motor the Busca Mutante MongoDB (Java)
Uso tático da classe The Serviço the Spring, o `QueryByExampleExecutor`. 
- `UserService` mapeia dados recebidos não nulos para um **Example Probe**
- Implementa um `ExampleMatcher` that `.withIgnoreNullValues()` e `.withStringMatcher(CONTAINING)`.
- Disparar `userRepository.findAll(example, pageable)`.
Isso gera cruzamento massivo com "AND" the todos os itens the tabela the imediato na memória the Mongo.
