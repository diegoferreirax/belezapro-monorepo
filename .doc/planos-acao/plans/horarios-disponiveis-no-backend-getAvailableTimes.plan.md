# Plano: `getAvailableTimes` no backend Java

## Contexto atual

- **Frontend**: a regra está em [`frontend/src/app/core/services/schedule-calculator.service.ts`](frontend/src/app/core/services/schedule-calculator.service.ts) (grade 30 min, janela do dia efetivo, breaks, conflito com agendamentos não cancelados, exclusão de um id em edição, filtro de horários passados com `new Date()` no cliente). Coberta por [`frontend/src/app/core/services/schedule-calculator.service.spec.ts`](frontend/src/app/core/services/schedule-calculator.service.spec.ts).
- **Uso**: apenas [`frontend/src/app/shared/components/booking-form/booking-form.component.ts`](frontend/src/app/shared/components/booking-form/booking-form.component.ts) monta `availableTimes` chamando o serviço com `busySlots()` carregados via [`getBusySlots`](frontend/src/app/core/services/public-booking.service.ts) + config/override resolvido no browser.
- **Backend já tem peças**:
  - Config efetiva por data: [`ScheduleService.getConfigForDate`](backend/src/main/java/com/belezapro/belezapro_api/features/schedule/services/ScheduleService.java) (override ou dia da semana).
  - Ocupação do dia: [`AppointmentService.getActiveByDate`](backend/src/main/java/com/belezapro/belezapro_api/features/appointments/services/AppointmentService.java) e endpoint público [`GET .../appointments/busy`](backend/src/main/java/com/belezapro/belezapro_api/features/appointments/controllers/PublicBookingController.java).

## Objetivo

Centralizar o cálculo no servidor para **uma única fonte de verdade**, **horário “agora” confiável** e alinhar validação futura de criação/reagendamento com a mesma regra.

## Desenho proposto (backend)

1. **Novo serviço de domínio** (ex.: `AvailabilityService` ou método em serviço existente) em `backend/src/main/java/com/belezapro/belezapro_api/features/schedule/` ou `.../appointments/`:
   - Entrada: `professionalId` (hoje sinônimo de `adminId` nos agendamentos), `date` (`YYYY-MM-DD`), `durationMinutes`, `excludeAppointmentId` opcional.
   - Passos (espelhar o TS):
     - Resolver `Optional<ScheduleConfig> config = scheduleService.getConfigForDate(professionalId, date)`.
     - Se vazio ou `isClosed` → retornar lista vazia.
     - Carregar ocupação: `appointmentService.getActiveByDate(professionalId, date)` e **excluir** o agendamento com `excludeAppointmentId` (edição).
     - Gerar slots de 30 em 30 min de `startTime` até `endTime`, checando overlap com `breaks` e com cada agendamento (`startTime` + `totalDurationMinutes`), mesma lógica de intervalo aberto/fechado que o TS.
     - Filtrar “passados”: usar **`Clock` injetável** + **`ZoneId` explícito** (MVP: constante configurável, ex. `America/Sao_Paulo`, ou `ZoneId.systemDefault()` documentado; evoluir depois para timezone por empresa se existir modelo).
   - **Segurança**: manter coerência com `getActiveByDate` (já filtra cancelados no repositório; conferir implementação atual ao implementar).

2. **Novo endpoint HTTP** em [`PublicBookingController`](backend/src/main/java/com/belezapro/belezapro_api/features/appointments/controllers/PublicBookingController.java) (alinhado ao booking público já em `/api/v1/public`):
   - Ex.: `GET /api/v1/public/professionals/{professionalId}/available-times?date=...&durationMinutes=...&excludeAppointmentId=...`
   - Resposta: `List<String>` (`HH:mm`) ou DTO `{ "slots": ["09:00", ...] }` (preferir DTO se quiser metadados depois).

3. **Validação opcional (fase 2, recomendada)**: no `create`/`update` de agendamento, rejeitar horário fora da lista ou duplicar a checagem de overlap no servidor para evitar race condition (dois bookings simultâneos). Não é obrigatório para o primeiro PR, mas o plano deve mencionar como próximo passo.

## Desenho proposto (frontend)

1. [`PublicBookingService`](frontend/src/app/core/services/public-booking.service.ts): adicionar `getAvailableTimes(professionalId, date, duration, excludeId?)`.
2. [`BookingFormComponent`](frontend/src/app/shared/components/booking-form/booking-form.component.ts):
   - Trocar o `computed` de `availableTimes` para depender de um **signal atualizado por HTTP** (ex.: `effect` + `switchMap`/`exhaustMap` ou `toObservable` + `switchMap` para cancelar requisições antigas quando data/duração/profissional mudam).
   - **Remover** a dependência de `busySlots` + `ScheduleCalculatorService` **se** o único uso de `busySlots` for alimentar horários (hoje é o caso pelo grep).
3. **Serviço TS**: remover `ScheduleCalculatorService` ou deixá-lo como delegação fina ao backend apenas durante transição; migrar expectativas dos testes para Java.

## Testes

- **Java**: testes unitários do serviço de disponibilidade com `Clock` fixo (casos já cobertos no Vitest: dia fechado, sem breaks, com breaks, com agendamento, cancelado não bloqueia — validar contra `getActiveByDate` mock, exclusão por id).
- **Frontend**: ajustar/remover spec do calculator; se mantiver chamada HTTP, teste leve do serviço com `HttpClientTestingModule` ou teste de integração mínima do componente (opcional).

## Riscos e decisões explícitas

- **Timezone**: hoje o TS interpreta `date + T + time` no timezone local do browser; no Java é preciso **definir e documentar** o `ZoneId` usado para “agora” e para compor data/hora, senão horários passados/futuros podem “pular” perto da meia-noite.
- **Performance**: uma request a mais por mudança de data/serviços; mitigar com cancelamento de requests e eventual cache curto se necessário.
- **Admin vs público**: hoje o formulário usa apenas API pública para busy; o novo endpoint pode seguir o mesmo padrão. Se no futuro o booking admin não puder usar rota pública, adicionar endpoint autenticado espelhado.

## Ordem de implementação sugerida

1. Java: serviço + testes unitários.
2. Java: endpoint em `PublicBookingController`.
3. Frontend: `PublicBookingService` + refatoração do `BookingFormComponent`.
4. Remover código morto (`ScheduleCalculatorService` + spec) após validação manual do fluxo landing/admin que usa o formulário.
