package com.belezapro.belezapro_api.features.appointments.models;

import lombok.Data;
import java.util.List;

@Data
public class PublicAppointmentRequest {
    private ClientData client;
    private List<String> selectedServices;
    private String date;
    private String time;

    @Data
    public static class ClientData {
        private String name;
        private String email;
        private String phone;
    }
}
