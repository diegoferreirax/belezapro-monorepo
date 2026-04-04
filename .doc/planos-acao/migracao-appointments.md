# Plano de Ação: Migração de Appointments para o Backend

## Contexto e Análise Atual
O restante da base operando inteiramente em `localStorage` compõe-se de:
1. **Appointments** (`salon_appointments`)
2. **Expenses** (`salon_expenses`)

Elegemos os Appointments (Agendamentos) como nossa prioridade total, por conta da forte dependência deles perante as funcionalidades do Schedule que recentemente migramos (a funcionalidade ainda aponta para o cache local na validação de agendamentos conflitantes no fechamento do dia).

## Desnormalização e NoSQL vs SQL
Optou-se por realizar **desnormalização** na tabela de Appointment para viabilizar performance.

### Diferenças de Paradigmas
- **SQL Server (Normalização):** O banco isola dados redundantes. Para exibir nomes dos clientes num agendamento, seriam usados UUIDs em chaves estrangeiras com "JOIN" (custoso, oneroso ao relacional).
- **MongoDB (Desnormalização):** Não lida performaticamente bem com `$lookup` (JOIN) em grande escala. Dados lidos juntos devem ser guardados juntos.
Para evitar atraso computacional, salvaremos `clientName` e a lista `parsedServiceNames` no exato momento que o agendamento for persistido no banco, imitando uma tabela denormalizada. Se um serviço no catálogo for renomeado no futuro, o Agendamento guardará o nome exato histórico que o serviço obteve na data e hora gravada daquele agendamento. Se o Agendamento for editado por conta própria, espelharmos os nomes atualizados em tempo de execução.

---

## Proposta de Implementação (Appointments)

### 1. Backend Java (`features/appointments`)

#### Modelo de Dados: `Appointment.java`
- `@Id String id`
- `String adminId` (multi-tenant)
- `String clientId`
- `String clientName` (Desnormalização: agilidade)
- `List<String> serviceIds`
- `List<String> parsedServiceNames` (Desnormalização: agilidade)
- `String date` (`YYYY-MM-DD`)
- `String startTime` (`HH:mm`)
- `Integer totalDurationMinutes`
- `BigDecimal totalPrice`
- `AppointmentStatus status`

#### Camada de Persistência e Lógica
- **`AppointmentRepository.java`**: Busca paginada. Filtro por `adminId` e/ou `clientId`.
- MongoTemplate / Criteria: Busca avançada por `term` global, filtros exatos de `status` e range de `date`.
- **`AppointmentService.java`**: CRUD e exclusão/cancelamento em lote de todos os ativos de uma data para o schedule.

#### Endpoints (`AppointmentController.java`)
- `GET /api/v1/appointments` (Paginação + `term` textual + `status` dinâmico + limites opcionais)
- `GET /api/v1/appointments/range?startDate={startDate}&endDate={endDate}` (Traz os agendamentos do intervalo otimizados para o Calendário Mensal/Semanal)
- `GET /api/v1/appointments/active/date/{date}`
- `POST /api/v1/appointments`
- `PUT /api/v1/appointments/{id}`
- `DELETE /api/v1/appointments/{id}`
- `PATCH /api/v1/appointments/cancel/date/{date}`

---

### 2. Frontend Angular

- **Novo Serviço (`appointment.service.ts`)**
- **Refatoração no `SalonService`**: Será despido do CRUD de appointment local. 
- **Refatoração de Componentes Orfãos**:
  - `appointment-calendar` e lista interna (Agenda diária)
  - `booking-form`
  - `client-modal` (A lista de Histórico de Consultas)
  - `schedule.component` (Onde o admin cancela tudo de uma respectiva data)
