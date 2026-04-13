package com.belezapro.belezapro_api.features.users.services;

import com.belezapro.belezapro_api.features.users.dto.CreateUserDto;
import com.belezapro.belezapro_api.features.users.dto.UpdateUserDto;
import com.belezapro.belezapro_api.features.users.dto.UserDto;
import com.belezapro.belezapro_api.features.users.models.User;
import com.belezapro.belezapro_api.features.users.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.belezapro.belezapro_api.features.users.models.Role;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<UserDto> getAll(Pageable pageable, String name, String email, String roleStr) {
        User probe = new User();
        ExampleMatcher matcher = ExampleMatcher.matching()
                .withIgnoreNullValues()
                .withIgnorePaths("isBlocked")
                .withStringMatcher(ExampleMatcher.StringMatcher.CONTAINING)
                .withIgnoreCase();

        if (name != null && !name.trim().isEmpty()) {
            probe.setName(name);
        }
        if (email != null && !email.trim().isEmpty()) {
            probe.setEmail(email);
        }
        if (roleStr != null && !roleStr.trim().isEmpty() && !roleStr.equalsIgnoreCase("ALL")) {
            try {
                probe.setRole(Role.valueOf(roleStr));
            } catch (IllegalArgumentException e) {
                // Ignorar tipo the filtro invalido e nao bater criteria de enum
            }
        }

        Example<User> example = Example.of(probe, matcher);
        return userRepository.findAll(example, pageable).map(this::toDto);
    }

    public UserDto create(CreateUserDto dto) {
        if (userRepository.findByEmail(dto.email()).isPresent()) {
            throw new IllegalArgumentException("E-mail já está em uso.");
        }

        User user = User.builder()
                .name(dto.name())
                .email(dto.email())
                .password(passwordEncoder.encode(dto.password()))
                .role(dto.role())
                .isBlocked(false)
                .build();
        
        return toDto(userRepository.save(user));
    }

    public UserDto update(String id, UpdateUserDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        user.setName(dto.name());
        user.setEmail(dto.email());
        user.setRole(dto.role());

        return toDto(userRepository.save(user));
    }

    public void delete(String id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("Usuário não encontrado.");
        }
        userRepository.deleteById(id);
    }

    public UserDto toggleBlock(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        user.setBlocked(!user.isBlocked());
        return toDto(userRepository.save(user));
    }

    private UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isBlocked());
    }
}