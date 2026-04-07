package com.belezapro.belezapro_api.features.expenses.controllers;

import com.belezapro.belezapro_api.features.authentication.annotation.RequireRoles;
import com.belezapro.belezapro_api.features.expenses.models.Expense;
import com.belezapro.belezapro_api.features.expenses.models.ExpensePaidRequest;
import com.belezapro.belezapro_api.features.expenses.models.ExpenseRequest;
import com.belezapro.belezapro_api.features.expenses.services.ExpenseService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/expenses")
@RequireRoles({"ADMIN", "ROOT"})
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    private String getAdminId(HttpServletRequest request) {
        return (String) request.getAttribute("authenticatedUserId");
    }

    @GetMapping
    public ResponseEntity<List<Expense>> list(
            HttpServletRequest request,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        return ResponseEntity.ok(expenseService.list(getAdminId(request), month, year));
    }

    @PostMapping
    public ResponseEntity<Expense> create(HttpServletRequest request, @RequestBody ExpenseRequest body) {
        return ResponseEntity.ok(expenseService.create(getAdminId(request), body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> update(
            HttpServletRequest request,
            @PathVariable String id,
            @RequestBody ExpenseRequest body
    ) {
        return ResponseEntity.ok(expenseService.update(getAdminId(request), id, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(HttpServletRequest request, @PathVariable String id) {
        expenseService.delete(getAdminId(request), id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/paid")
    public ResponseEntity<Expense> setPaid(
            HttpServletRequest request,
            @PathVariable String id,
            @RequestBody ExpensePaidRequest body
    ) {
        return ResponseEntity.ok(expenseService.setPaid(getAdminId(request), id, body));
    }
}
