# Plano the Ação: Abstração the API Reativa + Environment Config

Para escalarmos o front-end sem espalhar urls fixas (`localhost:8080`) e sem poluir o código com dezenas de `isLoading = true` toda vez que realizarmos uma requisição POST/GET, a criação the uma "Camada do Meio" the de Base Service é a solução perfeita!

Aqui está o mapa para arquitetar essas duas frentes:

## 1. Mapeamento de Environment (Variável do Sistema)
Manipular o diretório padrão `src/environments/environment.ts` do Angular:
*   Exportar a constante genérica de ambiente contendo propriedade raiz `apiUrl: 'http://localhost:8080/api'`.
*   Alterar todos os serviços que tiverem URL chumbada para usar essa constante amarrada. Servirá para futuros deploys também.

## 2. A Camada "Wrapper" Padrão de API (O Novo `ApiService`)
Serviço utilitário genérico chamado `ApiService` injetável (`@Injectable`):

### Estrutura Inovadora Sugerida:
Criar métodos wrappers como: `get<T>(endpoint: string)`, `post<T>(endpoint: string, body: any)`, etc. 
Mas em vez the devolver apenas um observable clássico, ele fará o acoplamento da barra URL inteira (Environment + Endpoint) além the orquestrar o ciclo do loading via `finalize`.

### Na Prática pros Components
Nos serviços vitais (`auth.service.ts` ou `system-user.service.ts`), iremos arrancar a injeção do `HttpClient` base. 
No seu lugar, eles injetarão o `ApiService`.
Isso nos permitirá injetar o Signal de `isLoading` atrelado diretamente no template html the forma transparente.
