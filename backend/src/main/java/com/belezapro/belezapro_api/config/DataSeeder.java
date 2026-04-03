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
            User root = User.builder()
                    .name("Dono do Sistema")
                    .email("root@belezapro.com")
                    .password(passwordEncoder.encode("root123"))
                    .role(Role.ROOT)
                    .isBlocked(false)
                    .build();

            userRepository.save(root);
            System.out.println("Usuário ROOT seedado! Email: root@belezapro.com | Senha: root123");

            // Seedando 35 usuários aleatórios para testes de paginação
            for (int i = 1; i <= 35; i++) {
                User mockUser = User.builder()
                        .name("Usuário Teste " + i)
                        .email("usuario" + i + "@teste.com")
                        .password(passwordEncoder.encode("senha123"))
                        .role(i % 5 == 0 ? Role.ADMIN : Role.CLIENT) // 1 a cada 5 será ADMIN
                        .isBlocked(i % 7 == 0) // 1 a cada 7 nascerá bloqueado para teste
                        .build();
                
                userRepository.save(mockUser);
            }
            System.out.println("✅ 35 usuários mockados gerados para testes de paginação e UI.");
        }
    }
}
