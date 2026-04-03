package com.belezapro.belezapro_api.config;

import com.belezapro.belezapro_api.features.users.models.Role;
import com.belezapro.belezapro_api.features.users.models.User;
import com.belezapro.belezapro_api.features.users.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name("Administrador")
                    .email("admin@belezapro.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .isBlocked(false)
                    .build();

            userRepository.save(admin);
            System.out.println("Usuário Admin seedado! Email: admin@belezapro.com | Senha: admin123");
        }
    }
}
