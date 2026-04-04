package com.belezapro.belezapro_api.features.clients.controllers;

import com.belezapro.belezapro_api.features.authentication.annotation.RequireRoles;
import com.belezapro.belezapro_api.features.clients.models.ClientDto;
import com.belezapro.belezapro_api.features.clients.models.CreateClientDto;
import com.belezapro.belezapro_api.features.clients.models.UpdateClientDto;
import com.belezapro.belezapro_api.features.clients.services.ClientService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clients")
@RequireRoles({"ROLE_ADMIN", "ROLE_ROOT"})
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    private String getAdminId(HttpServletRequest request) {
        return (String) request.getAttribute("authenticatedUserId");
    }

    @GetMapping
    public ResponseEntity<List<ClientDto>> getAll(HttpServletRequest request) {
        return ResponseEntity.ok(clientService.getClientsForAdmin(getAdminId(request)));
    }

    @PostMapping
    public ResponseEntity<ClientDto> create(HttpServletRequest request, @RequestBody CreateClientDto dto) {
        return ResponseEntity.ok(clientService.createClient(getAdminId(request), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientDto> update(HttpServletRequest request,
                                            @PathVariable String id,
                                            @RequestBody UpdateClientDto dto) {
        return ResponseEntity.ok(clientService.updateClient(id, getAdminId(request), dto));
    }

    @PatchMapping("/{id}/toggle-block")
    public ResponseEntity<ClientDto> toggleBlock(HttpServletRequest request, @PathVariable String id) {
        return ResponseEntity.ok(clientService.toggleBlock(id, getAdminId(request)));
    }
}
