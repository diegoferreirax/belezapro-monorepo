package com.belezapro.belezapro_api.features.authentication.services;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.belezapro.belezapro_api.features.users.models.User;
import com.belezapro.belezapro_api.features.users.models.Role;
import com.belezapro.belezapro_api.features.users.repositories.UserRepository;
import com.belezapro.belezapro_api.features.authentication.models.Otp;
import com.belezapro.belezapro_api.features.authentication.repositories.OtpRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;

@Service
public class AuthService {

    private final String secret;
    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    public AuthService(@Value("${jwt.secret}") String secret, 
                       UserRepository userRepository, 
                       OtpRepository otpRepository,
                       PasswordEncoder passwordEncoder,
                       JavaMailSender mailSender) {
        this.secret = secret;
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    public String authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            if (user.isBlocked()) {
                throw new IllegalArgumentException("User is blocked");
            }

            if (passwordEncoder.matches(password, user.getPassword())) {
                return generateToken(user);
            }
        }
        throw new IllegalArgumentException("Invalid credentials");
    }

    public void requestOtp(String email) {
        String code = String.format("%06d", new SecureRandom().nextInt(999999));
        
        otpRepository.deleteByEmail(email);
        
        Otp otp = Otp.builder()
            .email(email)
            .code(code)
            .expireAt(Instant.now().plus(5, ChronoUnit.MINUTES))
            .build();
        otpRepository.save(otp);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Código de Acesso - BelezaPro");
            message.setText("Seu código de acesso ao sistema BelezaPro é: " + code + "\n\nEste código é válido por 5 minutos.");
            mailSender.send(message);
            System.out.println("LOG SEC: Email Enviado. Código OTP para " + email + " é: " + code);
        } catch (Exception e) {
            // Em dev, ignoramos erro de falta de SMTP Server
            System.out.println("LOG SEC (DEV MODO): Erro SMTP. Código OTP Local para " + email + " é: " + code);
        }
    }

    public String validateOtp(String email, String otpCode) {
        Optional<Otp> otpOpt = otpRepository.findByEmailAndCode(email, otpCode);
        if (otpOpt.isEmpty() || otpOpt.get().getExpireAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }
        
        otpRepository.deleteByEmail(email);
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            if (user.isBlocked()) {
                throw new IllegalArgumentException("User is blocked");
            }
        } else {
            // Auto-Cadastro Transparente de novo Cliente
            user = User.builder()
                .email(email)
                .name("Cliente Sem Nome")
                .role(Role.CLIENT)
                .isBlocked(false)
                .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                .build();
            userRepository.save(user);
        }

        return generateToken(user);
    }
    
    private String generateToken(User user) {
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
