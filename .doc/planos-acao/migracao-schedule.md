# Plano de Ação: Migração de Schedule Config + Overrides

## Decisão

Schedule Config (padrão semanal) e Schedule Overrides (exceções por data) foram migrados do LocalStorage para MongoDB, mantendo isolamento por `adminId` (multi-tenant).

## Collections MongoDB

```
schedule_configs   — padrão semanal, índice único (adminId + dayOfWeek)
schedule_overrides — exceções por data, índice único (adminId + date)
```

## Endpoints

| Method | Path | Descrição |
|---|---|---|
| `GET` | `/api/v1/schedule/config` | Configs padrão do admin |
| `PUT` | `/api/v1/schedule/config` | Upsert de configs padrão |
| `GET` | `/api/v1/schedule/overrides` | Todos os overrides do admin |
| `PUT` | `/api/v1/schedule/overrides` | Upsert de overrides |
| `GET` | `/api/v1/schedule/date/{date}` | Config efetiva para uma data |

## Prioridade de resolução de config para uma data

1. Override específico (`schedule_overrides.date == date`)
2. Config padrão do dia da semana (`schedule_configs.dayOfWeek == date.getDayOfWeek()`)

## Dependência Temporária Remanescente

O `ScheduleComponent` ainda usa `salonService.getActiveAppointmentsByDate()` e `salonService.cancelAppointmentsByDate()` para detectar e cancelar agendamentos ao marcar um dia como fechado. Esta dependência será removida quando `Appointments` for migrado para o backend.

## DataSeeder

Ao iniciar com banco vazio, semeia os 7 dias para `admin@belezapro.com`:
- Segunda a Sábado: 08:00 – 18:00 (aberto)
- Domingo: fechado
