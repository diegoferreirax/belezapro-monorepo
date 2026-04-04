package com.belezapro.belezapro_api.features.services.controllers;

import com.belezapro.belezapro_api.features.authentication.annotation.RequireRoles;
import com.belezapro.belezapro_api.features.services.models.ServiceItem;
import com.belezapro.belezapro_api.features.services.services.CatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController
@RequestMapping("/api/v1/services")
@RequireRoles({ "ROLE_ROOT", "ROLE_ADMIN" })
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    // Extrai the forma segura a identidade criptografada na sessao Request The Interceptor JWT
    private String getAdminId(HttpServletRequest request) {
        return (String) request.getAttribute("authenticatedUserId");
    }

    @GetMapping
    public ResponseEntity<List<ServiceItem>> getAll(HttpServletRequest request) {
        return ResponseEntity.ok(catalogService.getAll(getAdminId(request)));
    }

    @PostMapping
    public ResponseEntity<ServiceItem> create(HttpServletRequest request, @RequestBody ServiceItem item) {
        return ResponseEntity.ok(catalogService.create(getAdminId(request), item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceItem> update(HttpServletRequest request, @PathVariable String id, @RequestBody ServiceItem item) {
        return ResponseEntity.ok(catalogService.update(getAdminId(request), id, item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(HttpServletRequest request, @PathVariable String id) {
        catalogService.delete(getAdminId(request), id);
        return ResponseEntity.ok().build();
    }
}
