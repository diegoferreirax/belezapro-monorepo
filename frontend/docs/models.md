# Entidades e Modelos do Sistema

Este documento descreve as principais interfaces e modelos de dados do **BelezaPro**. As interfaces TypeScript ficam em `src/app/core/models/salon.models.ts`; os modelos Java correspondentes estão em `backend/src/main/java/com/belezapro/belezapro_api/features/*/models/`. A persistência é feita no **MongoDB** via Spring Data.

## 1. Empresa (`Company`)
Representa o salão ou estabelecimento (tenant). Cada profissional (`ADMIN`) pertence a uma company via `companyId`.
- **`id`** (`string`): Identificador único.
- **`name`** (`string`): Nome comercial do salão.
- **`document`** (`string`): CNPJ ou CPF do estabelecimento.
- **`phone`** (`string`): Telefone de contato.
- **`isActive`** (`boolean`): Flag de ativação do tenant.

Coleção MongoDB: `companies`.

---

## 2. Clientes (`Client`)
Representa a base de usuários consolidados do salão. No MongoDB, o cliente é um documento na coleção `users` com `role = CLIENT`; a associação com o profissional fica na coleção `client_admin_links`.
- **`id`** (`string`): Identificador único do cliente.
- **`name`** (`string`): Nome do cliente.
- **`email`** (`string`): Utilizado como chave de assinatura, contato e login via OTP.
- **`phone`** (`string`): Formato numérico, pilar da comunicação (SMS, OTP via WhatsApp no futuro).
- **`isBlocked`** (`boolean?`): Sinaliza se o cliente está na lista de exceção de agenda (banido por faltas graves/no-shows).
- **`linkedAt`** (`string?`): Data em que o vínculo com o profissional foi criado (derivada de `ClientAdminLink.createdAt`).

---

## 3. Vínculo Cliente-Profissional (`ClientAdminLink`)
Tabela de junção que associa um cliente (`userId`) a um profissional (`adminId`). Índice composto único impede duplicação.
- **`id`** (`string`): Identificador único.
- **`userId`** (`string`): Referência ao `User` com role `CLIENT`.
- **`adminId`** (`string`): Referência ao `User` com role `ADMIN` ou `ROOT`.
- **`isBlocked`** (`boolean`): Bloqueio do cliente no contexto daquele profissional.

Coleção MongoDB: `client_admin_links`.

---

## 4. Serviços (`Service`)
Tipos de procedimentos ou produtos prestados. Um fluxo de usuário pode combinar $N$ serviços no mesmo agendamento.
- **`id`** (`string`): Identificador único.
- **`name`** (`string`): Título público do procedimento.
- **`price`** (`number`): Valor numérico total em Reais.
- **`durationMinutes`** (`number`): Duração estimada em minutos. O somatório dos serviços selecionados define as aberturas disponíveis no calendário de reservas.
- **`isActive`** (`boolean`): Flag de ocultação. `false` o remove da visão de reservas sem expurgar transações antigas (soft delete de visibilidade).

No backend, o modelo `ServiceItem` inclui também `adminId` para isolamento multi-profissional. Coleção MongoDB: `services`.

---

## 5. Agendamentos (`Appointment`)
A entidade pivô. Conecta `Client` a `Services` no cruzeiro temporal lógico gerado pela agenda.
- **`id`** (`string`): Identificador do agendamento.
- **`companyId`** (`string?`): Referência à empresa (tenant).
- **`adminId`** (`string?`): Referência ao profissional responsável.
- **`clientId`** (`string`): Referência ao cliente.
- **`clientName`** (`string?`): Snapshot do nome do cliente no momento da criação.
- **`clientEmail`** (`string?`): Snapshot do e-mail do cliente.
- **`clientPhone`** (`string?`): Snapshot do telefone do cliente.
- **`serviceIds`** (`string[]`): UUIDs dos serviços incluídos.
- **`parsedServiceNames`** (`string[]?`): Nomes dos serviços resolvidos no momento da criação (desnormalizado).
- **`date`** (`string`): Formato ISO (`YYYY-MM-DD`).
- **`startTime`** (`string`): Formato `HH:mm`.
- **`totalDurationMinutes`** (`number`): Somatório das durações dos serviços incluídos (desnormalizado).
- **`totalPrice`** (`number`): Valor total cobrado (desnormalizado).
- **`status`** (`AppointmentStatus`): Enum do ciclo de vida da reserva.
   - `PENDING` — Pendente.
   - `CONFIRMED` — Confirmado e garantido na agenda.
   - `COMPLETED` — Finalizado.
   - `CANCELLED` — Cancelado.

Coleção MongoDB: `appointments`.

---

## 6. Matriz de Horarios (`DayScheduleConfig` & `TimeRange`)
Módulo que gera matrizes padrão semanais e exceções (overrides) para feriados, folgas ou datas festivas.
- **`dayOfWeek`** (`number`): `0` para Domingo ate `6` para Sabado.
- **`date`** (`string?`): Presente apenas em exceções/overrides (`YYYY-MM-DD`). Quando presente, sobrepõe a regra do `dayOfWeek`.
- **`startTime` / `endTime`** (`string`): Abertura e fechamento do dia (`HH:mm`).
- **`breaks`** (`TimeRange[]`): Blocos inoperantes (`start`, `end`) onde a engine de slots recusa alocar novos agendamentos (pausas, almoço, etc.).
- **`isClosed`** (`boolean`): Dia de fechamento total.

No backend, `ScheduleConfig` inclui `adminId` (índice composto único `adminId + dayOfWeek`). Overrides ficam em `ScheduleOverride`. Coleções MongoDB: `schedule_configs` e `schedule_overrides`.

---

## 7. Despesas & Financeiro (`Expense`)
Controle de caixa-saída do negócio, para subtrair das entradas dos agendamentos `COMPLETED`.
- **`id`** (`string`): Identificador único.
- **`description`** (`string`): Natureza do gasto (ex: "Equatorial Energia", "Mercantil").
- **`amount`** (`number`): Valor em Reais.
- **`date`** (`string`): Data da despesa ou vencimento (`YYYY-MM-DD`).
- **`category`** (`ExpenseCategory`): Enum — `Materiais`, `Aluguel`, `Utilidades (Luz/Água)`, `Marketing` ou `Outros`.
- **`isPaid`** (`boolean`): Diferencia fluxo de caixa real (pago) de competência (a pagar).

No backend, o modelo inclui `adminId` para isolamento por profissional (índice composto `adminId + date`). Coleção MongoDB: `expenses`.

---

## 8. Usuários do Sistema (`User`)
Entidade unificada de autenticação e autorização. Um mesmo documento na coleção `users` pode representar tanto staff do salão quanto clientes do portal.
- **`id`** (`string`): Identificador único.
- **`name`** (`string`): Nome de exibição.
- **`email`** (`string`): Credencial de login (admin via senha, cliente via OTP) e contato.
- **`phone`** (`string?`): Telefone de contato.
- **`companyId`** (`string?`): Referência à empresa/tenant. Presente para `ADMIN` e `ROOT`; ausente para `CLIENT`.
- **`role`** (`Role`): Enum que define o nível de acesso — `ROOT`, `ADMIN` ou `CLIENT`.
- **`password`** (`string`): Hash Bcrypt gerenciada no backend. Não é exposta ao frontend.
- **`isBlocked`** (`boolean`): Impede login quando `true`.

Coleção MongoDB: `users`.
