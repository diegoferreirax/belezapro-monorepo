package com.belezapro.belezapro_api.features.clients.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientDto {
    private String id;
    private String name;
    private String email;
    private String phone;

    @JsonProperty("isBlocked")
    private boolean isBlocked;

    private Instant linkedAt;
}
