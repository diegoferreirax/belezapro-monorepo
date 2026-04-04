package com.belezapro.belezapro_api.features.appointments.models;

import com.belezapro.belezapro_api.common.models.Auditable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "appointments")
public class Appointment extends Auditable {

    @Id
    private String id;

    @Indexed
    private String adminId;

    @Indexed
    private String clientId;

    private String clientName; // Desnormalizado para pesquisas textuais mais rapidas

    private List<String> serviceIds = new ArrayList<>();

    private List<String> parsedServiceNames = new ArrayList<>(); // Desnormalizado para pesquisas textuais e snapshot

    @Indexed
    private String date; // YYYY-MM-DD

    private String startTime; // HH:mm

    private Integer totalDurationMinutes;

    private BigDecimal totalPrice;

    private AppointmentStatus status;

}
