package com.belezapro.belezapro_api.features.authentication.controllers;

import com.belezapro.belezapro_api.features.authentication.dto.AuthRequest;
import com.belezapro.belezapro_api.features.authentication.dto.AuthResponse;
import com.belezapro.belezapro_api.features.authentication.services.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        try {
            String token = authService.authenticate(request.email(), request.password());
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/otp/request")
    public ResponseEntity<Void> requestOtp(@RequestBody AuthRequest request) {
        authService.requestOtp(request.email());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/otp/validate")
    public ResponseEntity<AuthResponse> validateOtp(@RequestBody AuthRequest request) {
        try {
            String token = authService.validateOtp(request.email(), request.password());
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
