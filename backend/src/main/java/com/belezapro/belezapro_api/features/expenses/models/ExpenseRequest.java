package com.belezapro.belezapro_api.features.expenses.models;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ExpenseRequest {
    private String description;
    private BigDecimal amount;
    private String date;
    private ExpenseCategory category;
    private Boolean isPaid;
}
