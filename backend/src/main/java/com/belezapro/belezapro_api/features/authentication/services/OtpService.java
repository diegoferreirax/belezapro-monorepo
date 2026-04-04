package com.belezapro.belezapro_api.features.authentication.services;

import com.belezapro.belezapro_api.features.authentication.models.Otp;
import com.belezapro.belezapro_api.features.authentication.repositories.OtpRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class OtpService {

    private final OtpRepository otpRepository;
    private final EmailNotificationService emailNotificationService;

    public OtpService(OtpRepository otpRepository, EmailNotificationService emailNotificationService) {
        this.otpRepository = otpRepository;
        this.emailNotificationService = emailNotificationService;
    }

    public void generateAndDispatch(String email) {
        String code = String.format("%06d", new SecureRandom().nextInt(999999));
        
        otpRepository.deleteByEmail(email);
        
        Otp otp = Otp.builder()
            .email(email)
            .code(code)
            .expireAt(Instant.now().plus(5, ChronoUnit.MINUTES))
            .build();
        otpRepository.save(otp);
        
        emailNotificationService.sendOtpEmail(email, code);
    }

    public void validateAndDelete(String email, String otpCode) {
        Optional<Otp> otpOpt = otpRepository.findByEmailAndCode(email, otpCode);
        if (otpOpt.isEmpty() || otpOpt.get().getExpireAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }
        
        otpRepository.deleteByEmail(email);
    }
}
