package com.belezapro.belezapro_api.config;

import com.belezapro.belezapro_api.features.companies.models.Company;
import com.belezapro.belezapro_api.features.companies.repositories.CompanyRepository;
import com.belezapro.belezapro_api.features.users.models.Role;
import com.belezapro.belezapro_api.features.users.models.User;
import com.belezapro.belezapro_api.features.users.repositories.UserRepository;
import com.belezapro.belezapro_api.features.services.models.ServiceItem;
import com.belezapro.belezapro_api.features.services.repositories.ServiceItemRepository;
import com.belezapro.belezapro_api.features.schedule.models.ScheduleConfig;
import com.belezapro.belezapro_api.features.schedule.repositories.ScheduleConfigRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ServiceItemRepository serviceItemRepository;
    private final ScheduleConfigRepository scheduleConfigRepository;
    private final CompanyRepository companyRepository;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder,
                      ServiceItemRepository serviceItemRepository,
                      ScheduleConfigRepository scheduleConfigRepository,
                      CompanyRepository companyRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.serviceItemRepository = serviceItemRepository;
        this.scheduleConfigRepository = scheduleConfigRepository;
        this.companyRepository = companyRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            
            Company defaultCompany = null;
            if (companyRepository.count() == 0) {
                defaultCompany = Company.builder()
                        .name("Cortes S/A")
                        .document("12345678000199")
                        .phone("44999999999")
                        .isActive(true)
                        .build();
                defaultCompany = companyRepository.save(defaultCompany);
                System.out.println("Empresa CORTES S/A (Company) seedada!");
            } else {
                defaultCompany = companyRepository.findAll().get(0);
            }

            User root = User.builder()
                    .name("Dono do Sistema")
                    .email("root@belezapro.com")
                    .password(passwordEncoder.encode("root123"))
                    .companyId(defaultCompany.getId())
                    .role(Role.ROOT)
                    .isBlocked(false)
                    .build();

            userRepository.save(root);
            System.out.println("Usuário ROOT seedado! Email: root@belezapro.com | Senha: root123");

            User defaultAdmin = User.builder()
                    .name("Admin Default")
                    .email("admin@belezapro.com")
                    .password(passwordEncoder.encode("admin123"))
                    .companyId(defaultCompany.getId())
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

            User segundAdmin = User.builder()
                    .name("Admin Second")
                    .email("admin2@belezapro.com")
                    .password(passwordEncoder.encode("admin123"))
                    .companyId(defaultCompany.getId())
                    .role(Role.ADMIN)
                    .isBlocked(false)
                    .build();

            segundAdmin = userRepository.save(segundAdmin);
            System.out.println("Usuário ADMIN2 seedado! Email: admin2@belezapro.com | Senha: admin123");

            User primaryClient = User.builder()
                    .name("Primary Client")
                    .email("client@belezapro.com")
                    .role(Role.CLIENT)
                    .isBlocked(false)
                    .build();

            User segundClient = User.builder()
                    .name("Segund Client")
                    .email("client2@belezapro.com")
                    .role(Role.CLIENT)
                    .isBlocked(false)
                    .build();

            userRepository.saveAll(List.of(primaryClient, segundClient));
            System.out.println("Usuário CLIENT, CLIENT2 seedado! Email: client@belezapro.com | Senha: client123");
        }
    }
}
