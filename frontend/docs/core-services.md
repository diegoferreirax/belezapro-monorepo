# 🧠 Serviços e Lógica Core

Este documento detalha os serviços principais e a lógica de negócio do **BelezaPro**.

## 🛠️ Serviços Principais (`src/app/core/services/`)

### 1. `SalonService`
O serviço central para gestão de dados do salão.
- **Responsabilidades:**
  - Gerenciar agendamentos (`Appointment`), clientes (`Client`) e serviços (`Service`).
  - Fornecer configurações de horários de funcionamento (`DayScheduleConfig`).
  - Realizar operações de CRUD (Create, Read, Update, Delete) para as entidades principais.
- **Estado Reativo:** Utiliza `signal()` para manter listas de dados atualizadas e sincronizadas entre componentes.

### 2. `ScheduleCalculatorService`
Lógica pura para cálculos de tempo e disponibilidade.
- **Responsabilidades:**
  - Calcular horários disponíveis com base na duração dos serviços e agendamentos existentes.
  - Validar se um horário está dentro do expediente do salão.
  - Gerenciar fusos horários e formatação de datas.

### 3. `AuthService`
Gestão de identidade e segurança.
- **Responsabilidades:**
  - Autenticação de administradores e clientes.
  - Fluxo de login via OTP (One-Time Password) para clientes.
  - Armazenamento seguro de tokens e estado de sessão.

### 4. `ExpenseService`
Controle financeiro do salão.
- **Responsabilidades:**
  - CRUD e status pago/pendente via API (`/api/v1/expenses`), com filtro por mês/ano no servidor.
  - Cálculo de totais a partir da lista carregada (`calculateTotals`).

---

## 📊 Modelos de Dados (`src/app/core/models/`)

### `Salon.models.ts`
Contém as interfaces fundamentais:
- **`Appointment`**: ID, cliente, serviços, data, hora de início, duração total, preço total, status (Pendente, Confirmado, Concluído, Cancelado).
- **`Client`**: ID, nome, telefone, email, histórico de agendamentos.
- **`Service`**: ID, nome, descrição, preço, duração (minutos), categoria.
- **`DayScheduleConfig`**: Dia da semana, horário de abertura/fechamento, intervalos (breaks), flag de fechado.

---

## 🛡️ Guards (`src/app/core/guards/`)
- **`AdminGuard`**: Garante que apenas administradores autenticados acessem o painel `/admin`.
- **`ClientGuard`**: Protege a área do cliente `/client`.
