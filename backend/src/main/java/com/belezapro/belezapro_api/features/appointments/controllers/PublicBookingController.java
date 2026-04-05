package com.belezapro.belezapro_api.features.appointments.controllers;

import com.belezapro.belezapro_api.features.appointments.models.Appointment;
import com.belezapro.belezapro_api.features.appointments.services.AppointmentService;
import com.belezapro.belezapro_api.features.companies.models.Company;
import com.belezapro.belezapro_api.features.companies.repositories.CompanyRepository;
import com.belezapro.belezapro_api.features.schedule.models.ScheduleConfig;
import com.belezapro.belezapro_api.features.schedule.models.ScheduleOverride;
import com.belezapro.belezapro_api.features.schedule.services.ScheduleService;
import com.belezapro.belezapro_api.features.services.models.ServiceItem;
import com.belezapro.belezapro_api.features.services.services.CatalogService;
import com.belezapro.belezapro_api.features.users.models.Role;
import com.belezapro.belezapro_api.features.users.models.User;
import com.belezapro.belezapro_api.features.users.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public")
public class PublicBookingController {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final CatalogService catalogService;
    private final ScheduleService scheduleService;
    private final AppointmentService appointmentService;

    public PublicBookingController(CompanyRepository companyRepository,
                                   UserRepository userRepository,
                                   CatalogService catalogService,
                                   ScheduleService scheduleService,
                                   AppointmentService appointmentService) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.catalogService = catalogService;
        this.scheduleService = scheduleService;
        this.appointmentService = appointmentService;
    }

    @GetMapping("/companies")
    public ResponseEntity<List<Company>> getCompanies() {
        return ResponseEntity.ok(companyRepository.findAll());
    }

    @GetMapping("/companies/{companyId}")
    public ResponseEntity<Company> getCompany(@PathVariable String companyId) {
        return companyRepository.findById(companyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/companies/{companyId}/professionals")
    public ResponseEntity<List<User>> getProfessionals(@PathVariable String companyId) {
        List<User> professionals = userRepository.findAll().stream()
                .filter(u -> companyId.equals(u.getCompanyId()) && u.getRole() == Role.ADMIN)
                .toList();
        
        professionals.forEach(p -> p.setPassword(null));
        return ResponseEntity.ok(professionals);
    }

    @GetMapping("/professionals/{professionalId}/services")
    public ResponseEntity<List<ServiceItem>> getProfessionalServices(@PathVariable String professionalId) {
        return ResponseEntity.ok(catalogService.getAll(professionalId));
    }

    @GetMapping("/professionals/{professionalId}/schedule")
    public ResponseEntity<List<ScheduleConfig>> getProfessionalSchedule(@PathVariable String professionalId) {
        return ResponseEntity.ok(scheduleService.getDefaultConfigs(professionalId));
    }

    @GetMapping("/professionals/{professionalId}/schedule/overrides")
    public ResponseEntity<List<ScheduleOverride>> getProfessionalOverrides(@PathVariable String professionalId) {
        return ResponseEntity.ok(scheduleService.getOverrides(professionalId));
    }

    @PostMapping("/professionals/{professionalId}/appointments")
    public ResponseEntity<Appointment> createAppointment(@PathVariable String professionalId, @RequestBody com.belezapro.belezapro_api.features.appointments.models.PublicAppointmentRequest req) {
        
        // Find or create Client
        String email = req.getClient().getEmail();
        User clientUser = userRepository.findAll().stream()
            .filter(u -> email.equals(u.getEmail()) && u.getRole() == Role.CLIENT)
            .findFirst()
            .orElse(null);

        if (clientUser == null) {
            clientUser = User.builder()
                .name(req.getClient().getName())
                .email(req.getClient().getEmail())
                .phone(req.getClient().getPhone())
                .role(Role.CLIENT)
                .build();
            clientUser = userRepository.save(clientUser);
        } else {
            boolean needsUpdate = false;
            
            // Allow overriding name if they typed a new one, unless the old one was null
            if (req.getClient().getName() != null && !req.getClient().getName().isBlank() && !req.getClient().getName().equals(clientUser.getName())) {
                clientUser.setName(req.getClient().getName());
                needsUpdate = true;
            }
            
            // Overriding phone
            if (req.getClient().getPhone() != null && !req.getClient().getPhone().isBlank() && !req.getClient().getPhone().equals(clientUser.getPhone())) {
                clientUser.setPhone(req.getClient().getPhone());
                needsUpdate = true;
            }

            if (needsUpdate) {
                clientUser = userRepository.save(clientUser);
            }
        }

        Appointment appointment = Appointment.builder()
            .clientId(clientUser.getId())
            .clientName(clientUser.getName())
            .serviceIds(req.getSelectedServices())
            .date(req.getDate())
            .startTime(req.getTime())
            .build();

        // Encontra o professional p/ pegar a company
        userRepository.findById(professionalId).ifPresent(prof -> {
            appointment.setCompanyId(prof.getCompanyId());
        });

        return ResponseEntity.ok(appointmentService.create(professionalId, appointment));
    }
    @GetMapping("/professionals/{professionalId}/appointments/busy")
    public ResponseEntity<List<com.belezapro.belezapro_api.features.appointments.models.PublicBusySlot>> getBusySlots(@PathVariable String professionalId, @RequestParam String date) {
        List<Appointment> actives = appointmentService.getActiveByDate(professionalId, date);
        List<com.belezapro.belezapro_api.features.appointments.models.PublicBusySlot> slots = actives.stream()
            .map(a -> com.belezapro.belezapro_api.features.appointments.models.PublicBusySlot.builder()
                .date(a.getDate())
                .startTime(a.getStartTime())
                .totalDurationMinutes(a.getTotalDurationMinutes())
                .status(a.getStatus())
                .build())
            .toList();
        return ResponseEntity.ok(slots);
    }
}
