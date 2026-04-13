package com.belezapro.belezapro_api.features.appointments.models;

import com.belezapro.belezapro_api.common.models.Auditable;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "appointments")
public class Appointment extends Auditable {

    @Id
    private String id;

    @Indexed
    private String companyId;

    @Indexed
    private String adminId;

    @Indexed
    private String clientId;

    private String clientName;
    private String clientEmail;
    private String clientPhone;

    @Builder.Default
    private List<String> serviceIds = new ArrayList<>();

    @Builder.Default
    private List<String> parsedServiceNames = new ArrayList<>();

    @Indexed
    private String date;

    private String startTime;

    private Integer totalDurationMinutes;

    private BigDecimal totalPrice;

    private AppointmentStatus status;

}
