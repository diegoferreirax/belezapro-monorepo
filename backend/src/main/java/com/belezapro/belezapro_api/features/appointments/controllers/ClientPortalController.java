package com.belezapro.belezapro_api.features.appointments.controllers;

import com.belezapro.belezapro_api.features.appointments.models.Appointment;
import com.belezapro.belezapro_api.features.appointments.models.AppointmentStatus;
import com.belezapro.belezapro_api.features.appointments.models.ClientRescheduleRequest;
import com.belezapro.belezapro_api.features.appointments.services.AppointmentService;
import com.belezapro.belezapro_api.features.authentication.annotation.RequireRoles;
import com.belezapro.belezapro_api.features.companies.models.Company;
import com.belezapro.belezapro_api.features.companies.repositories.CompanyRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@RestController
@RequestMapping("/api/v1/client-portal/appointments")
@RequireRoles({"CLIENT"})
public class ClientPortalController {

    private final AppointmentService appointmentService;
    private final CompanyRepository companyRepository;
    private final com.belezapro.belezapro_api.features.users.repositories.UserRepository userRepository;

    public ClientPortalController(AppointmentService appointmentService, CompanyRepository companyRepository, com.belezapro.belezapro_api.features.users.repositories.UserRepository userRepository) {
        this.appointmentService = appointmentService;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    private String getClientId(HttpServletRequest request) {
        // Assume userId claim correctly represents the clientId for ROLE_CLIENT
        return (String) request.getAttribute("authenticatedUserId");
    }

    @GetMapping("/companies")
    public ResponseEntity<List<Company>> getCompaniesWithAppointments(HttpServletRequest request) {
        String clientId = getClientId(request);
        List<String> companyIds = appointmentService.getClientCompanyIds(clientId);

        if (companyIds == null || companyIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        Iterable<Company> companiesIter = companyRepository.findAllById(companyIds);
        List<Company> companies = StreamSupport.stream(companiesIter.spliterator(), false)
                .collect(Collectors.toList());

        return ResponseEntity.ok(companies);
    }

    @GetMapping
    public ResponseEntity<Page<Appointment>> getPaginatedList(
            HttpServletRequest request,
            @RequestParam(required = false) String companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String term,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) AppointmentStatus status
    ) {
        String clientId = getClientId(request);
        Page<Appointment> result = appointmentService.getPaginatedClientList(
                clientId, companyId, term, startDate, endDate, status, PageRequest.of(page, size)
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/me")
    public ResponseEntity<com.belezapro.belezapro_api.features.users.models.User> getMyProfile(HttpServletRequest request) {
        String clientId = getClientId(request);
        return userRepository.findById(clientId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> rescheduleAppointment(
            HttpServletRequest request,
            @PathVariable String id,
            @RequestBody ClientRescheduleRequest body
    ) {
        String clientId = getClientId(request);
        return ResponseEntity.ok(appointmentService.rescheduleByClient(clientId, id, body));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancelAppointment(HttpServletRequest request, @PathVariable String id) {
        String clientId = getClientId(request);
        return ResponseEntity.ok(appointmentService.cancelByClient(clientId, id));
    }
}
