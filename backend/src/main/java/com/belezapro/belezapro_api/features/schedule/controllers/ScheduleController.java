package com.belezapro.belezapro_api.features.schedule.controllers;

import com.belezapro.belezapro_api.features.authentication.annotation.RequireRoles;
import com.belezapro.belezapro_api.features.schedule.models.ScheduleConfig;
import com.belezapro.belezapro_api.features.schedule.models.ScheduleOverride;
import com.belezapro.belezapro_api.features.schedule.services.ScheduleService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schedule")
@RequireRoles({"ROLE_ADMIN", "ROLE_ROOT"})
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    private String getAdminId(HttpServletRequest request) {
        return (String) request.getAttribute("authenticatedUserId");
    }

    // ─── Configs padrão (por dia da semana) ──────────────────────────────────

    @GetMapping("/config")
    public ResponseEntity<List<ScheduleConfig>> getDefaultConfigs(HttpServletRequest request) {
        return ResponseEntity.ok(scheduleService.getDefaultConfigs(getAdminId(request)));
    }

    @PutMapping("/config")
    public ResponseEntity<List<ScheduleConfig>> saveDefaultConfigs(
            HttpServletRequest request,
            @RequestBody List<ScheduleConfig> configs) {
        return ResponseEntity.ok(scheduleService.saveDefaultConfigs(getAdminId(request), configs));
    }

    // ─── Overrides (por data específica) ─────────────────────────────────────

    @GetMapping("/overrides")
    public ResponseEntity<List<ScheduleOverride>> getOverrides(HttpServletRequest request) {
        return ResponseEntity.ok(scheduleService.getOverrides(getAdminId(request)));
    }

    @PutMapping("/overrides")
    public ResponseEntity<List<ScheduleOverride>> saveOverrides(
            HttpServletRequest request,
            @RequestBody List<ScheduleOverride> overrides) {
        return ResponseEntity.ok(scheduleService.saveOverrides(getAdminId(request), overrides));
    }

    // ─── Config efetiva para uma data ────────────────────────────────────────

    @GetMapping("/date/{date}")
    public ResponseEntity<ScheduleConfig> getConfigForDate(
            HttpServletRequest request,
            @PathVariable String date) {
        return scheduleService.getConfigForDate(getAdminId(request), date)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
