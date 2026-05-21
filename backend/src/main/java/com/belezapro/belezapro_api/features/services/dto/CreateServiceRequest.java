package com.belezapro.belezapro_api.features.services.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateServiceRequest {
    private String name;
    private BigDecimal price;
    private Integer durationMinutes;
    private Boolean isActive;
}
