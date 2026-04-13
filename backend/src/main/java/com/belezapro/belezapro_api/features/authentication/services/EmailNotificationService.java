package com.belezapro.belezapro_api.features.authentication.services;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String email, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Código de Acesso - BelezaPro");
            message.setText("Seu código de acesso ao sistema BelezaPro é: " + code + "\n\nEste código é válido por 5 minutos.");
            mailSender.send(message);
            System.out.println("LOG SEC: Email Enviado. Código OTP para " + email + " é: " + code);
        } catch (Exception e) {
            System.out.println("LOG SEC (DEV MODO): Erro SMTP. Código OTP Local para " + email + " é: " + code);
        }
    }
}
