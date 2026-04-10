package com.belezapro.belezapro_api.features.appointments.services;

import com.belezapro.belezapro_api.features.appointments.models.Appointment;
import com.belezapro.belezapro_api.features.appointments.models.AppointmentStatus;
import com.belezapro.belezapro_api.features.schedule.models.ScheduleConfig;
import com.belezapro.belezapro_api.features.schedule.models.TimeRange;
import com.belezapro.belezapro_api.features.schedule.services.ScheduleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AvailabilityServiceTest {

    private static final String PROF = "prof1";
    private static final String DATE = "2026-04-16";

    @Mock
    private ScheduleService scheduleService;
    @Mock
    private AppointmentService appointmentService;

    private AvailabilityService availabilityService;

    @BeforeEach
    void setUp() {
        ZonedDateTime fixed = ZonedDateTime.of(2026, 4, 16, 8, 0, 0, 0, ZoneId.of("America/Sao_Paulo"));
        Clock clock = Clock.fixed(fixed.toInstant(), ZoneId.of("America/Sao_Paulo"));
        availabilityService = new AvailabilityService(scheduleService, appointmentService, clock, "America/Sao_Paulo");
    }

    @Test
    void returnsEmptyWhenDurationIsZero() {
        assertThat(availabilityService.getAvailableTimes(PROF, DATE, 0, null)).isEmpty();
    }

    @Test
    void returnsEmptyWhenDayClosed() {
        ScheduleConfig config = ScheduleConfig.builder()
            .dayOfWeek(1)
            .startTime("09:00")
            .endTime("18:00")
            .breaks(Collections.emptyList())
            .isClosed(true)
            .build();
        when(scheduleService.getConfigForDate(PROF, DATE)).thenReturn(Optional.of(config));

        assertThat(availabilityService.getAvailableTimes(PROF, DATE, 30, null)).isEmpty();
    }

    @Test
    void normalDayWithoutBreaksOrAppointments() {
        ScheduleConfig config = ScheduleConfig.builder()
            .dayOfWeek(1)
            .startTime("09:00")
            .endTime("11:00")
            .breaks(Collections.emptyList())
            .isClosed(false)
            .build();
        when(scheduleService.getConfigForDate(PROF, DATE)).thenReturn(Optional.of(config));
        when(appointmentService.getActiveByDate(PROF, DATE)).thenReturn(Collections.emptyList());

        assertThat(availabilityService.getAvailableTimes(PROF, DATE, 60, null))
            .containsExactly("09:00", "09:30", "10:00");
    }

    @Test
    void skipsTimesOverlappingBreaks() {
        ScheduleConfig config = ScheduleConfig.builder()
            .dayOfWeek(1)
            .startTime("09:00")
            .endTime("12:00")
            .breaks(List.of(new TimeRange("10:00", "11:00")))
            .isClosed(false)
            .build();
        when(scheduleService.getConfigForDate(PROF, DATE)).thenReturn(Optional.of(config));
        when(appointmentService.getActiveByDate(PROF, DATE)).thenReturn(Collections.emptyList());

        assertThat(availabilityService.getAvailableTimes(PROF, DATE, 60, null))
            .containsExactly("09:00", "11:00");
    }

    @Test
    void skipsOverlappingAppointments() {
        ScheduleConfig config = ScheduleConfig.builder()
            .dayOfWeek(1)
            .startTime("09:00")
            .endTime("12:00")
            .breaks(Collections.emptyList())
            .isClosed(false)
            .build();
        when(scheduleService.getConfigForDate(PROF, DATE)).thenReturn(Optional.of(config));
        when(appointmentService.getActiveByDate(PROF, DATE))
            .thenReturn(List.of(Appointment.builder()
                .id("1")
                .date(DATE)
                .startTime("10:00")
                .totalDurationMinutes(60)
                .status(AppointmentStatus.CONFIRMED)
                .build()));

        assertThat(availabilityService.getAvailableTimes(PROF, DATE, 30, null))
            .containsExactly("09:00", "09:30", "11:00", "11:30");
    }

    @Test
    void ignoresExcludedAppointmentWhenEditing() {
        ScheduleConfig config = ScheduleConfig.builder()
            .dayOfWeek(1)
            .startTime("09:00")
            .endTime("12:00")
            .breaks(Collections.emptyList())
            .isClosed(false)
            .build();
        when(scheduleService.getConfigForDate(PROF, DATE)).thenReturn(Optional.of(config));
        when(appointmentService.getActiveByDate(PROF, DATE))
            .thenReturn(List.of(Appointment.builder()
                .id("1")
                .date(DATE)
                .startTime("10:00")
                .totalDurationMinutes(60)
                .status(AppointmentStatus.CONFIRMED)
                .build()));

        assertThat(availabilityService.getAvailableTimes(PROF, DATE, 60, "1"))
            .containsExactly("09:00", "09:30", "10:00", "10:30", "11:00");
    }

    @Test
    void filtersPastSlotsForToday() {
        ZonedDateTime fixed = ZonedDateTime.of(2026, 4, 16, 10, 31, 0, 0, ZoneId.of("America/Sao_Paulo"));
        Clock clock = Clock.fixed(fixed.toInstant(), ZoneId.of("America/Sao_Paulo"));
        availabilityService = new AvailabilityService(scheduleService, appointmentService, clock, "America/Sao_Paulo");

        ScheduleConfig config = ScheduleConfig.builder()
            .dayOfWeek(1)
            .startTime("09:00")
            .endTime("12:00")
            .breaks(Collections.emptyList())
            .isClosed(false)
            .build();
        when(scheduleService.getConfigForDate(PROF, DATE)).thenReturn(Optional.of(config));
        when(appointmentService.getActiveByDate(PROF, DATE)).thenReturn(Collections.emptyList());

        assertThat(availabilityService.getAvailableTimes(PROF, DATE, 30, null))
            .containsExactly("11:00", "11:30");
    }
}
