package com.belezapro.belezapro_api.features.clients.services;

import com.belezapro.belezapro_api.features.appointments.services.AppointmentService;
import com.belezapro.belezapro_api.features.clients.models.*;
import com.belezapro.belezapro_api.features.clients.repositories.ClientAdminLinkRepository;
import com.belezapro.belezapro_api.features.users.models.Role;
import com.belezapro.belezapro_api.features.users.models.User;
import com.belezapro.belezapro_api.features.users.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ClientService {

    private final UserRepository userRepository;
    private final ClientAdminLinkRepository linkRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppointmentService appointmentService;

    public ClientService(UserRepository userRepository,
                         ClientAdminLinkRepository linkRepository,
                         PasswordEncoder passwordEncoder,
                         AppointmentService appointmentService) {
        this.userRepository = userRepository;
        this.linkRepository = linkRepository;
        this.passwordEncoder = passwordEncoder;
        this.appointmentService = appointmentService;
    }

    /**
     * Lista todos os clientes vinculados ao admin, fundindo dados do User com metadados do Link.
     */
    public List<ClientDto> getClientsForAdmin(String adminId) {
        return linkRepository.findAllByAdminId(adminId).stream()
            .map(link -> userRepository.findById(link.getUserId())
                .map(user -> toDto(user, link))
                .orElse(null))
            .filter(dto -> dto != null)
            .collect(Collectors.toList());
    }

    /**
     * Upsert por email na collection users (Role.CLIENT), depois cria o vínculo se não existir.
     * Se o email já existir como ADMIN ou ROOT, lança erro.
     */
    public ClientDto createClient(String adminId, CreateClientDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
            .map(existing -> {
                if (existing.getRole() != Role.CLIENT) {
                    throw new IllegalArgumentException(
                        "Este e-mail pertence a um usuário com perfil de " + existing.getRole() + ". Não é possível vinculá-lo como cliente.");
                }
                // Atualiza dados de perfil se o user já existia (ex: cliente que fez OTP login antes)
                existing.setName(dto.getName());
                existing.setPhone(dto.getPhone());
                return userRepository.save(existing);
            })
            .orElseGet(() -> userRepository.save(
                User.builder()
                    .name(dto.getName())
                    .email(dto.getEmail())
                    .phone(dto.getPhone())
                    .role(Role.CLIENT)
                    .isBlocked(false)
                    // Senha aleatória — cliente acessa via OTP, não por senha
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .build()
            ));

        if (!linkRepository.existsByUserIdAndAdminId(user.getId(), adminId)) {
            ClientAdminLink link = ClientAdminLink.builder()
                .userId(user.getId())
                .adminId(adminId)
                .build();
            ClientAdminLink savedLink = linkRepository.save(link);
            return toDto(user, savedLink);
        }

        // Link já existe — retorna estado atual
        ClientAdminLink existingLink = linkRepository
            .findByUserIdAndAdminId(user.getId(), adminId)
            .orElseThrow(() -> new IllegalStateException("Link deve existir neste ponto"));

        return toDto(user, existingLink);
    }

    /**
     * Atualiza nome e telefone do User. Email é imutável (chave de identidade).
     */
    public ClientDto updateClient(String userId, String adminId, UpdateClientDto dto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado: " + userId));

        ClientAdminLink link = linkRepository.findByUserIdAndAdminId(userId, adminId)
            .orElseThrow(() -> new IllegalArgumentException("Vínculo não encontrado para este admin"));

        user.setName(dto.getName());
        user.setPhone(dto.getPhone());
        userRepository.save(user);

        return toDto(user, link);
    }

    /**
     * Toggle isBlocked no ClientAdminLink — scoped ao admin logado.
     * Bloquear no Salão A não afeta o Salão B.
     */
    public ClientDto toggleBlock(String userId, String adminId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado: " + userId));

        ClientAdminLink link = linkRepository.findByUserIdAndAdminId(userId, adminId)
            .orElseThrow(() -> new IllegalArgumentException("Vínculo não encontrado para este admin"));

        link.setBlocked(!link.isBlocked());
        linkRepository.save(link);

        if (link.isBlocked()) {
            appointmentService.cancelFutureAppointments(userId, adminId);
        }

        return toDto(user, link);
    }

    /**
     * Garante que o vínculo entre cliente e admin existe.
     */
    public void ensureLink(String userId, String adminId) {
        if (!linkRepository.existsByUserIdAndAdminId(userId, adminId)) {
            ClientAdminLink link = ClientAdminLink.builder()
                .userId(userId)
                .adminId(adminId)
                .build();
            linkRepository.save(link);
        }
    }

    private ClientDto toDto(User user, ClientAdminLink link) {
        return ClientDto.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .isBlocked(link.isBlocked())
            .linkedAt(link.getCreatedAt())
            .build();
    }
}
