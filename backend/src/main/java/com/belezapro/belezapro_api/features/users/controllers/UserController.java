package com.belezapro.belezapro_api.features.users.controllers;

import com.belezapro.belezapro_api.features.users.dto.UserDto;
import com.belezapro.belezapro_api.features.users.services.UserService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserDto> getAll() {
        return userService.getAll();
    }
}