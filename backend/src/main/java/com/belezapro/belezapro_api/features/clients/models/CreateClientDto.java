package com.belezapro.belezapro_api.features.clients.models;

import lombok.Data;

@Data
public class CreateClientDto {
    private String name;
    private String email;
    private String phone;
}
