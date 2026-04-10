package com.belezapro.belezapro_api.features.appointments.services;

import com.belezapro.belezapro_api.features.appointments.models.Appointment;
import com.belezapro.belezapro_api.features.schedule.models.ScheduleConfig;
import com.belezapro.belezapro_api.features.schedule.models.TimeRange;
import com.belezapro.belezapro_api.features.schedule.services.ScheduleService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AvailabilityService {

    private static final int SLOT_STEP_MINUTES = 30;

    private final ScheduleService scheduleService;
    private final AppointmentService appointmentService;
    private final Clock clock;
    private final ZoneId businessZoneId;

    public AvailabilityService(ScheduleService scheduleService,
                               AppointmentService appointmentService,
                               Clock clock,
                               @Value("${app.timezone:America/Sao_Paulo}") String timezone) {
        this.scheduleService = scheduleService;
        this.appointmentService = appointmentService;
        this.clock = clock;
        this.businessZoneId = ZoneId.of(timezone);
    }

    /**
     * Lista horários início possíveis (grade de {@value #SLOT_STEP_MINUTES} min), respeitando config do dia,
     * pausas e agendamentos ativos. Alinhado ao cálculo anterior no frontend Angular.
     */
    public List<String> getAvailableTimes(String professionalId,
                                          String date,
                                          int durationMinutes,
                                          String excludeAppointmentId) {
        if (professionalId == null || professionalId.isBlank()
            || date == null || date.isBlank()
            || durationMinutes <= 0) {
            return List.of();
        }

        Optional<ScheduleConfig> configOpt = scheduleService.getConfigForDate(professionalId, date);
        if (configOpt.isEmpty()) {
            return List.of();
        }
        ScheduleConfig config = configOpt.get();
        if (config.isClosed()) {
            return List.of();
        }

        List<Appointment> appointments = appointmentService.getActiveByDate(professionalId, date);
        List<Appointment> blocking = appointments.stream()
            .filter(a -> excludeAppointmentId == null || excludeAppointmentId.isBlank()
                || !excludeAppointmentId.equals(a.getId()))
            .toList();

        List<TimeRange> breaks = config.getBreaks() != null ? config.getBreaks() : List.of();

        int current = timeToMinutes(config.getStartTime());
        int end = timeToMinutes(config.getEndTime());
        Instant now = clock.instant();

        List<String> times = new ArrayList<>();
        while (current + durationMinutes <= end) {
            final int slotStartMin = current;
            final int slotEndMin = current + durationMinutes;
            String timeStr = minutesToTime(slotStartMin);

            boolean hasOverlapWithBreak = breaks.stream().anyMatch(b ->
                overlaps(slotStartMin, slotEndMin, timeToMinutes(b.getStart()), timeToMinutes(b.getEnd())));

            boolean hasOverlapWithAppointment = blocking.stream().anyMatch(a ->
                overlaps(slotStartMin, slotEndMin,
                    timeToMinutes(a.getStartTime()),
                    timeToMinutes(a.getStartTime())
                        + (a.getTotalDurationMinutes() != null ? a.getTotalDurationMinutes() : 0)));

            if (!hasOverlapWithBreak && !hasOverlapWithAppointment) {
                ZonedDateTime slotStart = LocalDate.parse(date).atTime(LocalTime.parse(timeStr)).atZone(businessZoneId);
                if (!slotStart.toInstant().isBefore(now)) {
                    times.add(timeStr);
                }
            }

            current += SLOT_STEP_MINUTES;
        }

        return times;
    }

    /**
     * Garante que o horário de início está entre os retornados por {@link #getAvailableTimes}
     * (mesmas regras de disponibilidade).
     */
    public void assertSlotAvailable(String professionalId,
                                    String date,
                                    String startTime,
                                    int durationMinutes,
                                    String excludeAppointmentId) {
        if (startTime == null || startTime.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Horário inválido.");
        }
        if (durationMinutes <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duração inválida.");
        }
        List<String> slots = getAvailableTimes(professionalId, date, durationMinutes, excludeAppointmentId);
        if (!slots.contains(startTime)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Horário indisponível.");
        }
    }

    private static boolean overlaps(int startA, int endA, int startB, int endB) {
        return startA < endB && endA > startB;
    }

    private static int timeToMinutes(String time) {
        if (time == null || !time.contains(":")) {
            return 0;
        }
        String[] parts = time.split(":");
        int h = Integer.parseInt(parts[0]);
        int m = Integer.parseInt(parts[1]);
        return h * 60 + m;
    }

    private static String minutesToTime(int minutes) {
        int h = minutes / 60;
        int m = minutes % 60;
        return String.format("%02d:%02d", h, m);
    }
}
