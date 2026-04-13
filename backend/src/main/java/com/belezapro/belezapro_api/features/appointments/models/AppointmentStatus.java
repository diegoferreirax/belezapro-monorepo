package com.belezapro.belezapro_api.features.appointments.models;

public enum AppointmentStatus {
    PENDING("Pendente"),
    CONFIRMED("Confirmado"),
    COMPLETED("Concluído"),
    CANCELLED("Cancelado");

    private final String description;

    AppointmentStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
