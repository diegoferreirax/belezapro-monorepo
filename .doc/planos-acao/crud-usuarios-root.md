# Plano de Ação: Gestão (CRUD) the Usuários - Role ROOT

## Visão Geral
Construir uma interface robusta centralizada para a pessoa dona do sistema (ROOT) poder realizar a gestão, bloqueio, e convite de outros administradores e clientes, integrando nosso frontend com o Backend rest Spring.

## 1. Backend (Java / Spring Boot)
- **Segurança e Roles:** Criar a role `ROLE_ROOT` para o nível máximo. Proteger os Endpoints the `UserController` usando as anotações the controle the acesso (`@RequireRoles("ROLE_ROOT")`).
- **Endpoints the Gestão:**
  - `GET /api/users`: Listar todos os usuários da base the dados.
  - `POST /api/users`: Criar novos usuários (podendo assinalar se são ADMIN ou CLIENT's).
  - `PUT /api/users/{id}`: Atualizar dados base the um usuário.
  - `PATCH /api/users/{id}/block`: Criar um Toggle the Segurança. Suspender um usuário the entrar no sistema imediatamente mudando `isBlocked` para True.
- **Camada Security:** Configurar encriptação standard the senhas (`PasswordEncoder`) ao criar/atualizar usuários. Cuidar de DTO's (`CreateUserDto`, `UpdateUserDto` e um record The Resposta `UserDto` com os status).

## 2. Frontend (Angular 17+)
- Criar Rota the "Gestão the Usuários" no menu administrativo travada no Guard apenas para Perfil Root.
- Atualizar o `SystemUserService` para comportar todo CRUD REST das requisições via `HttpClient`.
- Criar Modal de Adição/Edição com aparência fosca (`backdrop`) baseada no padrão The Estilo Tailwind da plataforma.
- Implementação reativa na `Tabela`: Utilizar `BehaviorSubject` para recarregar automaticamente os itens se a deleção / bloqueio tiverem sucesso sem causar F5/refresh na tela ao usuário.

## 3. Segurança Preventiva
Para evitar que o "ROOT" seja banido sem querer, o frontend possuirá um `alert` de advertência bloqueando deleção caso a Tag da Tabela do Item for explicitamente "ROOT".
