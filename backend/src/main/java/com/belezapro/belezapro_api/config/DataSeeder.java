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
            
            Company mariasSalon = null;
            Company cortesSA = null;

            if (companyRepository.count() == 0) {

                mariasSalon = Company.builder()
                        .name("Salão da Maria")
                        .document("12345678000199")
                        .phone("44999999999")
                        .isActive(true)
                        .build();
                mariasSalon = companyRepository.save(mariasSalon);
                System.out.println("Salão da maria (Company) seedada!");

                User mariaAdmin = User.builder()
                        .name("Maria")
                        .email("maria@belezapro.com")
                        .password(passwordEncoder.encode("admin123"))
                        .companyId(mariasSalon.getId())
                        .role(Role.ADMIN)
                        .isBlocked(false)
                        .build();

                mariaAdmin = userRepository.save(mariaAdmin);
                System.out.println("Usuário maria seedado! Email: maria@belezapro.com | Senha: admin123");

                cortesSA = Company.builder()
                        .name("Cortes S/A")
                        .document("12345678000299")
                        .phone("44999999888")
                        .isActive(true)
                        .build();
                cortesSA = companyRepository.save(cortesSA);
                System.out.println("Cortes S/A (Company) seedada!");

                User joaoAdmin = User.builder()
                        .name("João")
                        .email("joao@belezapro.com")
                        .password(passwordEncoder.encode("admin123"))
                        .companyId(cortesSA.getId())
                        .role(Role.ADMIN)
                        .isBlocked(false)
                        .build();

                joaoAdmin = userRepository.save(joaoAdmin);
                System.out.println("Usuário Joao seedado! Email: joao@belezapro.com | Senha: admin123");

                if (serviceItemRepository.count() == 0) {
                    String mariaId = mariaAdmin.getId();
                    String joaoId = joaoAdmin.getId();

                    List<ServiceItem> initialServices = List.of(
                            ServiceItem.builder().name("Manicure simples").price(new BigDecimal("40.0")).durationMinutes(120).isActive(true).adminId(mariaId).build(),
                            ServiceItem.builder().name("Pedicure simples").price(new BigDecimal("45.0")).durationMinutes(120).isActive(true).adminId(mariaId).build(),
                            ServiceItem.builder().name("Pe e mão").price(new BigDecimal("80.0")).durationMinutes(210).isActive(true).adminId(mariaId).build(),
                            ServiceItem.builder().name("Plástica dos Pés").price(new BigDecimal("85.0")).durationMinutes(150).isActive(true).adminId(mariaId).build(),
                            ServiceItem.builder().name("Unha em gel mão").price(new BigDecimal("75.0")).durationMinutes(180).isActive(true).adminId(mariaId).build(),
                            ServiceItem.builder().name("Unha gel pé").price(new BigDecimal("85.0")).durationMinutes(180).isActive(true).adminId(mariaId).build(),
                            ServiceItem.builder().name("Remoção de Esmaltação").price(new BigDecimal("15.0")).durationMinutes(20).isActive(true).adminId(mariaId).build(),
                            ServiceItem.builder().name("Limpeza de fungos ungueal").price(new BigDecimal("55.0")).durationMinutes(120).isActive(true).adminId(mariaId).build(),
                            ServiceItem.builder().name("Decoração unhas").price(new BigDecimal("10.0")).durationMinutes(0).isActive(true).adminId(mariaId).build(),
                            ServiceItem.builder().name("Esmaltação mão").price(new BigDecimal("80.0")).durationMinutes(120).isActive(true).adminId(mariaId).build(),
                            ServiceItem.builder().name("Pé").price(new BigDecimal("45.0")).durationMinutes(120).isActive(true).adminId(mariaId).build(),
                            ServiceItem.builder().name("Mão").price(new BigDecimal("35.0")).durationMinutes(180).isActive(true).adminId(mariaId).build(),

                            ServiceItem.builder().name("Corte Máquina").price(new BigDecimal("35.0")).durationMinutes(30).isActive(true).adminId(joaoId).build(),
                            ServiceItem.builder().name("Corte Tesoura").price(new BigDecimal("45.0")).durationMinutes(60).isActive(true).adminId(joaoId).build(),
                            ServiceItem.builder().name("Corte Degradê").price(new BigDecimal("55.0")).durationMinutes(60).isActive(true).adminId(joaoId).build(),
                            ServiceItem.builder().name("Barba Simples").price(new BigDecimal("30.0")).durationMinutes(30).isActive(true).adminId(joaoId).build(),
                            ServiceItem.builder().name("Barboterapia").price(new BigDecimal("50.0")).durationMinutes(30).isActive(true).adminId(joaoId).build(),
                            ServiceItem.builder().name("Platinado / Luzes").price(new BigDecimal("120.0")).durationMinutes(120).isActive(true).adminId(joaoId).build(),
                            ServiceItem.builder().name("Sobrancelha").price(new BigDecimal("15.0")).durationMinutes(30).isActive(true).adminId(joaoId).build(),
                            ServiceItem.builder().name("Hidratação Capilar").price(new BigDecimal("40.0")).durationMinutes(30).isActive(true).adminId(joaoId).build(),
                            ServiceItem.builder().name("Pigmentação de Barba").price(new BigDecimal("45.0")).durationMinutes(240).isActive(true).adminId(joaoId).build()
                    );

                    serviceItemRepository.saveAll(initialServices);
                    System.out.println("Catálogo Base atrelado The ADMIN seedado com sucesso.");
                }
            }

            User root = User.builder()
                    .name("Dono do Sistema")
                    .email("root@belezapro.com")
                    .password(passwordEncoder.encode("root123"))
                    .companyId(mariasSalon.getId())
                    .role(Role.ROOT)
                    .isBlocked(false)
                    .build();

            userRepository.save(root);
            System.out.println("Usuário ROOT seedado! Email: root@belezapro.com | Senha: root123");

//            User primaryClient = User.builder()
//                    .name("Primary Client")
//                    .email("client@belezapro.com")
//                    .role(Role.CLIENT)
//                    .isBlocked(false)
//                    .build();
//
//            User segundClient = User.builder()
//                    .name("Segund Client")
//                    .email("client2@belezapro.com")
//                    .role(Role.CLIENT)
//                    .isBlocked(false)
//                    .build();
//
//            userRepository.saveAll(List.of(primaryClient, segundClient));
//            System.out.println("Usuário CLIENT, CLIENT2 seedado! Email: client@belezapro.com | Senha: client123");
        }
    }
}
