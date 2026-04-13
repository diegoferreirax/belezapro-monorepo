package com.belezapro.belezapro_api.features.schedule.services;

import com.belezapro.belezapro_api.features.schedule.models.ScheduleConfig;
import com.belezapro.belezapro_api.features.schedule.models.ScheduleOverride;
import com.belezapro.belezapro_api.features.schedule.repositories.ScheduleConfigRepository;
import com.belezapro.belezapro_api.features.schedule.repositories.ScheduleOverrideRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {

    private final ScheduleConfigRepository configRepository;
    private final ScheduleOverrideRepository overrideRepository;

    public ScheduleService(ScheduleConfigRepository configRepository,
                           ScheduleOverrideRepository overrideRepository) {
        this.configRepository = configRepository;
        this.overrideRepository = overrideRepository;
    }

    // ─── Schedule Configs (padrão semanal) ───────────────────────────────────

    public List<ScheduleConfig> getDefaultConfigs(String adminId) {
        List<ScheduleConfig> existing = configRepository.findAllByAdminIdOrderByDayOfWeekAsc(adminId);

        if (!existing.isEmpty()) {
            return existing;
        }

        // Lazy-seed: primeiro acesso de um admin sem configs → inicializa os 7 dias padrão
        List<ScheduleConfig> defaults = new ArrayList<>();
        for (int day = 0; day < 7; day++) {
            defaults.add(ScheduleConfig.builder()
                .adminId(adminId)
                .dayOfWeek(day)
                .startTime("08:00")
                .endTime("18:00")
                .breaks(new ArrayList<>())
                .isClosed(day == 0) // Domingo fechado por padrão
                .build());
        }

        return configRepository.saveAll(defaults);
    }

    /**
     * Upsert de configs padrão.
     * Para cada config recebida, atualiza o registro existente pelo dayOfWeek ou cria um novo.
     */
    public List<ScheduleConfig> saveDefaultConfigs(String adminId, List<ScheduleConfig> configs) {
        List<ScheduleConfig> saved = new ArrayList<>();

        for (ScheduleConfig incoming : configs) {
            ScheduleConfig config = configRepository
                .findByAdminIdAndDayOfWeek(adminId, incoming.getDayOfWeek())
                .map(existing -> {
                    existing.setStartTime(incoming.getStartTime());
                    existing.setEndTime(incoming.getEndTime());
                    existing.setBreaks(incoming.getBreaks());
                    existing.setClosed(incoming.isClosed());
                    return existing;
                })
                .orElseGet(() -> {
                    incoming.setAdminId(adminId);
                    return incoming;
                });

            saved.add(configRepository.save(config));
        }

        return saved;
    }

    // ─── Schedule Overrides (exceções por data) ───────────────────────────────

    public List<ScheduleOverride> getOverrides(String adminId) {
        return overrideRepository.findAllByAdminId(adminId);
    }

    /**
     * Upsert de overrides por data.
     * Atualiza o registro existente pela date ou cria um novo. Não apaga os demais overrides.
     */
    public List<ScheduleOverride> saveOverrides(String adminId, List<ScheduleOverride> overrides) {
        List<ScheduleOverride> saved = new ArrayList<>();

        for (ScheduleOverride incoming : overrides) {
            ScheduleOverride override = overrideRepository
                .findByAdminIdAndDate(adminId, incoming.getDate())
                .map(existing -> {
                    existing.setStartTime(incoming.getStartTime());
                    existing.setEndTime(incoming.getEndTime());
                    existing.setBreaks(incoming.getBreaks());
                    existing.setClosed(incoming.isClosed());
                    return existing;
                })
                .orElseGet(() -> ScheduleOverride.builder()
                    .adminId(adminId)
                    .date(incoming.getDate())
                    .startTime(incoming.getStartTime())
                    .endTime(incoming.getEndTime())
                    .breaks(incoming.getBreaks() != null ? incoming.getBreaks() : new java.util.ArrayList<>())
                    .isClosed(incoming.isClosed())
                    .build());

            saved.add(overrideRepository.save(override));
        }

        return saved;
    }

    // ─── Config efetiva para uma data ────────────────────────────────────────

    /**
     * Retorna o override para a data, se existir.
     * Caso contrário retorna a config padrão do dia da semana correspondente.
     */
    public Optional<ScheduleConfig> getConfigForDate(String adminId, String date) {
        // 1. Override específico para a data
        Optional<ScheduleOverride> override = overrideRepository.findByAdminIdAndDate(adminId, date);
        if (override.isPresent()) {
            ScheduleOverride ov = override.get();
            ScheduleConfig projected = ScheduleConfig.builder()
                .adminId(adminId)
                .dayOfWeek(null) // não aplicável para override
                .startTime(ov.getStartTime())
                .endTime(ov.getEndTime())
                .breaks(ov.getBreaks())
                .isClosed(ov.isClosed())
                .build();
            return Optional.of(projected);
        }

        // 2. Config padrão do dia da semana
        int dayOfWeek = java.time.LocalDate.parse(date).getDayOfWeek().getValue() % 7;
        // java.time: Mon=1..Sun=7 → frontend: Sun=0..Sat=6
        return configRepository.findByAdminIdAndDayOfWeek(adminId, dayOfWeek);
    }
}
