package com.belezapro.belezapro_api.features.users.services;

import com.belezapro.belezapro_api.features.users.dto.UserDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    public List<UserDto> getAll() {
        return List.of(
            new UserDto(1L, "João Silva", "joao.silva@example.com"),
            new UserDto(2L, "Maria Souza", "maria.souza@example.com"),
            new UserDto(3L, "Carlos Pereira", "carlos.pereira@example.com")
        );
    }
}