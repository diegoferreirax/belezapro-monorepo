package com.belezapro.belezapro_api.features.services.dto;

import java.math.BigDecimal;

public record CreateServiceRequest(
    String name,
    BigDecimal price,
    Integer durationMinutes,
    Boolean isActive
) {
}
