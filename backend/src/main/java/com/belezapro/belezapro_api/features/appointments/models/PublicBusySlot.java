package com.belezapro.belezapro_api.features.appointments.models;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PublicBusySlot {
    private String date;
    private String startTime;
    private Integer totalDurationMinutes;
    private AppointmentStatus status;
}
