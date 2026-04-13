package com.belezapro.belezapro_api.features.appointments.repositories;

import com.belezapro.belezapro_api.features.appointments.models.Appointment;
import com.belezapro.belezapro_api.features.appointments.models.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AppointmentRepositoryCustom {
    Page<Appointment> findAppointmentsDynamic(
        String adminId, 
        String clientId, 
        String term, 
        String startDate, 
        String endDate, 
        AppointmentStatus status, 
        Pageable pageable
    );

    Page<Appointment> findClientAppointmentsDynamic(
        String clientId, 
        String companyId, 
        String term, 
        String startDate, 
        String endDate, 
        AppointmentStatus status, 
        Pageable pageable
    );
}
