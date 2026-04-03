package com.belezapro.belezapro_api.features.authentication.services;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.belezapro.belezapro_api.features.users.models.User;
import com.belezapro.belezapro_api.features.users.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
public class AuthService {

    private final String secret;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(@Value("${jwt.secret}") String secret, 
                       UserRepository userRepository, 
                       PasswordEncoder passwordEncoder) {
        this.secret = secret;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            if (user.isBlocked()) {
                throw new IllegalArgumentException("User is blocked");
            }

            if (passwordEncoder.matches(password, user.getPassword())) {
                Algorithm algorithm = Algorithm.HMAC256(secret);

                String role = "ROLE_" + user.getRole().name();

                return JWT.create()
                        .withSubject(user.getEmail())
                        .withClaim("userId", user.getId())
                        .withArrayClaim("roles", new String[]{role})
                        .withIssuedAt(new Date())
                        .withExpiresAt(new Date(System.currentTimeMillis() + 3600_000))
                        .sign(algorithm);
            }
        }
        throw new IllegalArgumentException("Invalid credentials");
    }
}
