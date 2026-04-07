package com.belezapro.belezapro_api.features.expenses.services;

import com.belezapro.belezapro_api.features.expenses.models.Expense;
import com.belezapro.belezapro_api.features.expenses.models.ExpensePaidRequest;
import com.belezapro.belezapro_api.features.expenses.models.ExpenseRequest;
import com.belezapro.belezapro_api.features.expenses.repositories.ExpenseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public List<Expense> list(String adminId, Integer month, Integer year) {
        if (month != null && year != null) {
            if (month < 1 || month > 12) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mês inválido.");
            }
            String prefix = String.format("%04d-%02d-", year, month);
            return expenseRepository.findByAdminIdAndDateStartingWithOrderByDateDesc(adminId, prefix);
        }
        return expenseRepository.findByAdminIdOrderByDateDesc(adminId);
    }

    public Expense create(String adminId, ExpenseRequest req) {
        validateRequest(req);
        Expense expense = Expense.builder()
                .adminId(adminId)
                .description(req.getDescription().trim())
                .amount(req.getAmount())
                .date(req.getDate())
                .category(req.getCategory())
                .paid(req.getIsPaid() != null && req.getIsPaid())
                .build();
        return expenseRepository.save(expense);
    }

    public Expense update(String adminId, String id, ExpenseRequest req) {
        validateRequest(req);
        Expense existing = expenseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Despesa não encontrada."));
        if (!existing.getAdminId().equals(adminId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado.");
        }
        existing.setDescription(req.getDescription().trim());
        existing.setAmount(req.getAmount());
        existing.setDate(req.getDate());
        existing.setCategory(req.getCategory());
        if (req.getIsPaid() != null) {
            existing.setPaid(req.getIsPaid());
        }
        return expenseRepository.save(existing);
    }

    public void delete(String adminId, String id) {
        Expense existing = expenseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Despesa não encontrada."));
        if (!existing.getAdminId().equals(adminId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado.");
        }
        expenseRepository.deleteById(id);
    }

    public Expense setPaid(String adminId, String id, ExpensePaidRequest body) {
        Expense existing = expenseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Despesa não encontrada."));
        if (!existing.getAdminId().equals(adminId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado.");
        }
        existing.setPaid(body.isPaid());
        return expenseRepository.save(existing);
    }

    private void validateRequest(ExpenseRequest req) {
        if (req.getDescription() == null || req.getDescription().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Descrição é obrigatória.");
        }
        if (req.getAmount() == null || req.getAmount().signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valor deve ser maior que zero.");
        }
        if (req.getDate() == null || req.getDate().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data é obrigatória.");
        }
        if (req.getCategory() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria é obrigatória.");
        }
    }
}
