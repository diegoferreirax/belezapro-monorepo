package com.belezapro.belezapro_api.features.users.dto;

import com.belezapro.belezapro_api.features.users.models.Role;

public record UserDto(String id, String name, String email, Role role, boolean isBlocked) {}
