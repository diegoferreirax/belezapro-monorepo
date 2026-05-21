# Agenda e configuração de horários (pontos críticos)

## Por que é crítico

Duas áreas compartilham regras e dados:

1. **Configuração de horários** (`ScheduleComponent` + `ScheduleService`).
2. **Calendário de agendamentos admin** (`AppointmentCalendarComponent` + `ScheduleService.getConfigForDate`).

Se a resolução “horário efetivo do dia” divergir entre web e app, slots clicáveis, bloqueios visuais e validações ficarão inconsistentes com o backend.

## Resolução de horário por data (`getConfigForDate`)

Implementação de referência: `frontend/src/app/core/services/schedule.service.ts`.

- Carregar **config padrão** (`GET /schedule/config`) — array por `dayOfWeek`.
- Carregar **overrides** (`GET /schedule/overrides`) — convertidos para `Record<date, DayScheduleConfig>`.
- Para uma `dateStr` (YYYY-MM-DD): se existir override para a data, usar override; senão, usar entrada cujo `dayOfWeek` coincide com o dia da semana da data.

O app deve centralizar essa lógica (hook + dados das queries, ou util puro + query cache).

## Tela de horários (admin)

Referência: `frontend/src/app/features/admin/schedule/schedule.component.ts`.

- Modos **padrão** (por dia da semana) vs **específico** (semana com uma linha por dia).
- Validações de intervalo (início/fim, pausas), clamp de horários no “hoje”, semanas passadas somente leitura no modo específico.
- **Ao marcar dia fechado no modo específico:** buscar agendamentos ativos na data (`getActiveByDate`); se houver, abrir modal de conflito e opção de cancelar em massa (`cancelAppointmentsByDate`) antes de persistir overrides (`saveOverrides`).
- **Persistência:** `saveConfigs` vs `saveOverrides` com regra de “só enviar override se difere do padrão ou já existia override” (evitar poluir o backend).

Replicar esse fluxo no app (mesmas chamadas e ordem), adaptando apenas a UI.

## Calendário semanal de agendamentos (admin)

Referência: `frontend/src/app/features/admin/appointments/appointment-calendar/appointment-calendar.ts` + template HTML.

Comportamento principal:

- Semana ancorada em `currentDate` (navegação anterior/próxima semana, “hoje”).
- **Bounds de horas** (`calendarBounds`): união do expediente resolvido por `ScheduleService` para cada um dos 7 dias + extensão se houver agendamento fora do expediente.
- **Slots de 30 min** para novo agendamento (`clickableSlots`).
- **Blocos indisponíveis** (`getUnavailableBlocksForDay`): dia fechado = coluna inteira; fora de `startTime`–`endTime`; pausas (`breaks`).
- Cards de agendamento com `top`/`height` proporcionais aos minutos desde o `minHour` da grade.

### Decisão: biblioteca vs custom (registro para o time)

- O web **não** usa biblioteca de calendário; é **grade custom** + geometria por minuto.
- **Recomendação:** no RN, **timeline semanal custom** (ScrollView/Views ou lista virtualizada) reutilizando a **mesma matemática** (idealmente extraída para funções puras compartilháveis no futuro).
- **Bibliotecas** de calendário mensal/agenda podem ajudar só em **seleção de data** auxiliar, não como substituto direto da timeline com overlays de expediente/pausa/fechado — salvo resultado positivo de um **spike** documentado aqui.

Quando um spike for feito, acrescentar subseção abaixo com nome da lib, limitações e decisão final.

---

## Spike de biblioteca (preencher após teste)

- **Biblioteca avaliada:** _a preencher_
- **Data:** _a preencher_
- **Atende colunas por dia + altura por duração + overlay fechado/pausas?** _sim/não_
- **Decisão:** _custom / lib / híbrido_
