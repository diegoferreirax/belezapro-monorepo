package com.belezapro.belezapro_api.features.appointments.controllers;

import com.belezapro.belezapro_api.features.appointments.models.Appointment;
import com.belezapro.belezapro_api.features.appointments.models.AppointmentStatus;
import com.belezapro.belezapro_api.features.appointments.services.AppointmentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    private String getAdminId(HttpServletRequest request) {
        return (String) request.getAttribute("authenticatedUserId");
    }

    @GetMapping
    public ResponseEntity<Page<Appointment>> getPaginatedList(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String clientId,
            @RequestParam(required = false) String term,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) AppointmentStatus status
    ) {
        Page<Appointment> result = appointmentService.getPaginatedList(
                getAdminId(request), clientId, term, startDate, endDate, status, PageRequest.of(page, size)
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/range")
    public ResponseEntity<List<Appointment>> getRangeForCalendar(
            HttpServletRequest request,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        return ResponseEntity.ok(appointmentService.getRangeForCalendar(getAdminId(request), startDate, endDate));
    }

    @GetMapping("/active/date/{date}")
    public ResponseEntity<List<Appointment>> getActiveByDate(
            HttpServletRequest request,
            @PathVariable String date
    ) {
        return ResponseEntity.ok(appointmentService.getActiveByDate(getAdminId(request), date));
    }

    @PostMapping
    public ResponseEntity<Appointment> create(HttpServletRequest request, @RequestBody Appointment data) {
        return ResponseEntity.ok(appointmentService.create(getAdminId(request), data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> update(HttpServletRequest request, @PathVariable String id, @RequestBody Appointment data) {
        return ResponseEntity.ok(appointmentService.update(getAdminId(request), id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(HttpServletRequest request, @PathVariable String id) {
        appointmentService.delete(getAdminId(request), id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/cancel/date/{date}")
    public ResponseEntity<Void> cancelActiveAppointmentsByDate(HttpServletRequest request, @PathVariable String date) {
        appointmentService.cancelActiveAppointmentsByDate(getAdminId(request), date);
        return ResponseEntity.ok().build();
    }

}
