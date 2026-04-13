package com.belezapro.belezapro_api.features.authentication.services;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.belezapro.belezapro_api.features.users.models.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtTokenService {

    private final String secret;

    public JwtTokenService(@Value("${jwt.secret}") String secret) {
        this.secret = secret;
    }

    public String generateToken(User user) {
        Algorithm algorithm = Algorithm.HMAC256(secret);
        String role = user.getRole().name();

        var builder = JWT.create()
                .withSubject(user.getEmail())
                .withClaim("userId", user.getId())
                .withClaim("name", user.getName())
                .withArrayClaim("roles", new String[]{role})
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + 3600_000));

        if (user.getCompanyId() != null && !user.getCompanyId().isBlank()) {
            builder.withClaim("companyId", user.getCompanyId());
        }
        if (user.getPhone() != null && !user.getPhone().isBlank()) {
            builder.withClaim("phone", user.getPhone());
        }

        return builder.sign(algorithm);
    }
}
