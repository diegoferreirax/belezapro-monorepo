package com.belezapro.belezapro_api.features.authentication.services;

import com.belezapro.belezapro_api.features.users.models.User;
import com.belezapro.belezapro_api.features.users.models.Role;
import com.belezapro.belezapro_api.features.users.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final OtpService otpService;

    public AuthService(UserRepository userRepository, 
                       PasswordEncoder passwordEncoder,
                       JwtTokenService jwtTokenService,
                       OtpService otpService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.otpService = otpService;
    }

    public String authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            if (user.isBlocked()) {
                throw new IllegalArgumentException("User is blocked");
            }

            if (passwordEncoder.matches(password, user.getPassword())) {
                return jwtTokenService.generateToken(user);
            }
        }
        throw new IllegalArgumentException("Invalid credentials");
    }

    public void requestOtp(String email) {
        otpService.generateAndDispatch(email);
    }

    public String validateOtp(String email, String otpCode) {
        otpService.validateAndDelete(email, otpCode);
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            if (user.isBlocked()) {
                throw new IllegalArgumentException("User is blocked");
            }
        } else {
            user = User.builder()
                .email(email)
                .name("Cliente Sem Nome")
                .role(Role.CLIENT)
                .isBlocked(false)
                .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                .build();
            userRepository.save(user);
        }

        return jwtTokenService.generateToken(user);
    }
}
