package com.belezapro.belezapro_api.features.appointments.models;

import lombok.Data;

import java.util.List;

@Data
public class ClientRescheduleRequest {
    private List<String> serviceIds;
    private String date;
    private String startTime;
}
