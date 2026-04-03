package com.belezapro.belezapro_api.features.users.dto;

import com.belezapro.belezapro_api.features.users.models.Role;

public record CreateUserDto(String name, String email, String password, Role role) {}
