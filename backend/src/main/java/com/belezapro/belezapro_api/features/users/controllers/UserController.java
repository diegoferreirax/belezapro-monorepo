package com.belezapro.belezapro_api.features.users.controllers;

import com.belezapro.belezapro_api.features.authentication.annotation.RequireRoles;
import com.belezapro.belezapro_api.features.users.dto.UserDto;
import com.belezapro.belezapro_api.features.users.services.UserService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @RequireRoles({"ROLE_ROOT"})
    public Page<UserDto> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String role
    ) {
        return userService.getAll(PageRequest.of(page, size), name, email, role);
    }

    @PostMapping
    @RequireRoles({"ROLE_ROOT"})
    public UserDto create(@RequestBody com.belezapro.belezapro_api.features.users.dto.CreateUserDto dto) {
        return userService.create(dto);
    }

    @PutMapping("/{id}")
    @RequireRoles({"ROLE_ROOT"})
    public UserDto update(@PathVariable String id, @RequestBody com.belezapro.belezapro_api.features.users.dto.UpdateUserDto dto) {
        return userService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @RequireRoles({"ROLE_ROOT"})
    public void delete(@PathVariable String id) {
        userService.delete(id);
    }

    @PatchMapping("/{id}/toggle-block")
    @RequireRoles({"ROLE_ROOT"})
    public UserDto toggleBlock(@PathVariable String id) {
        return userService.toggleBlock(id);
    }
}