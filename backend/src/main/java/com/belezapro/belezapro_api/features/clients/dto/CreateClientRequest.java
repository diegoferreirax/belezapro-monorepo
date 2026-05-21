package com.belezapro.belezapro_api.features.clients.dto;

import lombok.Data;

@Data
public class CreateClientRequest {
    private String name;
    private String email;
    private String phone;
}
