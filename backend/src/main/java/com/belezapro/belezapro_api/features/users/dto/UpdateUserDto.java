package com.belezapro.belezapro_api.features.users.dto;

import com.belezapro.belezapro_api.features.users.models.Role;

public record UpdateUserDto(String name, String email, Role role) {}
