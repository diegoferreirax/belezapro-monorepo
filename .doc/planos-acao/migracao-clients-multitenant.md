# Plano de Ação: Centralização de Clients na Collection Users

## Decisão Arquitetural

Abandonada a collection `clients` separada. Clientes agora são `User` com `Role.CLIENT`,
centralizando todas as entidades de usuário em uma única collection MongoDB.

## Arquitetura Final

```
users  (ROOT + ADMIN + CLIENT)
  id, name, email, phone, password, role, isBlocked

client_admin_links  (vínculo many-to-many)
  userId  ──▶ users.id (Role.CLIENT)
  adminId ──▶ users.id (Role.ADMIN)
  isBlocked  (scoped por admin — bloquear no Salão A não afeta Salão B)
```

## O que foi Reaproveitado

- `ClientAdminLink.java` — só renomeou `clientId` → `userId`
- `ClientController.java` — mesmos endpoints, zero mudança
- `ClientDto.java` — mesmos campos, fonte agora é User
- DTOs de criação/atualização — inalterados
- Frontend (`client.service.ts`, `clients.component.ts`) — zero mudança

## O que foi Modificado

- `User.java` — adicionado campo `phone` (nullable)
- `ClientAdminLink.java` — `clientId` renomeado para `userId`
- `ClientAdminLinkRepository.java` — queries atualizadas
- `ClientService.java` — usa `UserRepository` + `PasswordEncoder`

## O que foi Deletado

- `Client.java` (collection `clients` eliminada)
- `ClientRepository.java`

## Fluxo de Criação de Cliente

1. **Via admin panel**: `POST /api/v1/clients` → upsert em `users` (Role.CLIENT) + cria link
2. **Via OTP login**: `validateOtp` já cria `User(Role.CLIENT)` automaticamente → admin depois faz o vínculo
3. **Proteção**: se email já existe como ADMIN/ROOT, retorna erro 400

## Pendências Futuras

- Cancelamento de agendamentos ao bloquear cliente (TODO no ClientService — implementar quando Appointments for migrado)
