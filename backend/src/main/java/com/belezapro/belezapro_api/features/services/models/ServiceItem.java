package com.belezapro.belezapro_api.features.services.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.belezapro.belezapro_api.common.models.Auditable;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "services")
public class ServiceItem extends Auditable {
    @Id
    private String id;
    
    private String adminId; // Controle The Tenant!
    
    private String name;
    private BigDecimal price;
    private Integer durationMinutes;
    private Boolean isActive;
}
