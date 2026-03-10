package com.belezapro.belezapro_api.features.authentication.services;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class AuthService {

    // TODO: Replace with real user store and password hashing
    private static final String USERNAME = "admin";
    private static final String PASSWORD = "password123";

    private final String secret;

    public AuthService(@Value("${jwt.secret}") String secret) {
        this.secret = secret;
    }

    public String authenticate(String username, String password) {
        if (USERNAME.equals(username) && PASSWORD.equals(password)) {
            Algorithm algorithm = Algorithm.HMAC256(secret);

            // TODO: In a real app, fetch user roles from DB
            String role = "ROLE_USER";
            if ("admin".equals(username)) {
                role = "ROLE_ADMIN";
            }

            return JWT.create()
                    .withSubject(username)
                    .withArrayClaim("roles", new String[]{role})
                    .withIssuedAt(new Date())
                    .withExpiresAt(new Date(System.currentTimeMillis() + 3600_000))
                    .sign(algorithm);
        }
        throw new IllegalArgumentException("Invalid credentials");
    }
}
