package com.belezapro.belezapro_api.config;

import com.belezapro.belezapro_api.features.users.models.Role;
import com.belezapro.belezapro_api.features.users.models.User;
import com.belezapro.belezapro_api.features.users.repositories.UserRepository;
import com.belezapro.belezapro_api.features.services.models.ServiceItem;
import com.belezapro.belezapro_api.features.services.repositories.ServiceItemRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ServiceItemRepository serviceItemRepository;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder, ServiceItemRepository serviceItemRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.serviceItemRepository = serviceItemRepository;
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

            // Seed tenant fixo
            User defaultAdmin = User.builder()
                    .name("Admin Default")
                    .email("admin@belezapro.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .isBlocked(false)
                    .build();

            defaultAdmin = userRepository.save(defaultAdmin);
            System.out.println("Usuário ADMIN seedado! Email: admin@belezapro.com | Senha: admin123");

            if (serviceItemRepository.count() == 0) {
                String adminId = defaultAdmin.getId();
                List<ServiceItem> initialServices = List.of(
                    ServiceItem.builder().name("Manicure simples").price(new BigDecimal("40.0")).durationMinutes(120).isActive(true).adminId(adminId).build(),
                    ServiceItem.builder().name("Pedicure simples").price(new BigDecimal("45.0")).durationMinutes(120).isActive(true).adminId(adminId).build(),
                    ServiceItem.builder().name("Pe e mão").price(new BigDecimal("80.0")).durationMinutes(210).isActive(true).adminId(adminId).build(),
                    ServiceItem.builder().name("Plástica dos Pés").price(new BigDecimal("85.0")).durationMinutes(150).isActive(true).adminId(adminId).build(),
                    ServiceItem.builder().name("Unha em gel mão").price(new BigDecimal("75.0")).durationMinutes(180).isActive(true).adminId(adminId).build(),
                    ServiceItem.builder().name("Unha gel pé").price(new BigDecimal("85.0")).durationMinutes(180).isActive(true).adminId(adminId).build(),
                    ServiceItem.builder().name("Remoção de Esmaltação").price(new BigDecimal("15.0")).durationMinutes(20).isActive(true).adminId(adminId).build(),
                    ServiceItem.builder().name("Limpeza de fungos ungueal").price(new BigDecimal("55.0")).durationMinutes(120).isActive(true).adminId(adminId).build(),
                    ServiceItem.builder().name("Decoração unhas").price(new BigDecimal("10.0")).durationMinutes(0).isActive(true).adminId(adminId).build(),
                    ServiceItem.builder().name("Esmaltação mão").price(new BigDecimal("80.0")).durationMinutes(120).isActive(true).adminId(adminId).build(),
                    ServiceItem.builder().name("Pé").price(new BigDecimal("45.0")).durationMinutes(120).isActive(true).adminId(adminId).build(),
                    ServiceItem.builder().name("Mão").price(new BigDecimal("35.0")).durationMinutes(180).isActive(true).adminId(adminId).build()
                );
                serviceItemRepository.saveAll(initialServices);
                System.out.println("Catálogo Base atrelado The ADMIN seedado com sucesso.");
            }

            // Seedando 35 usuários aleatórios para testes de paginação
            for (int i = 1; i <= 35; i++) {
                User mockUser = User.builder()
                        .name("Usuário Teste " + i)
                        .email("usuario" + i + "@teste.com")
                        .password(passwordEncoder.encode("senha123"))
                        .role(i % 5 == 0 ? Role.ADMIN : Role.CLIENT)
                        .isBlocked(i % 7 == 0)
                        .build();
                
                userRepository.save(mockUser);
            }
            System.out.println("✅ 35 usuários mockados gerados para testes de paginação e UI.");
        }
    }
}
