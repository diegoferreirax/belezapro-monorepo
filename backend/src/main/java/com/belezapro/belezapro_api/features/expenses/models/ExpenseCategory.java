package com.belezapro.belezapro_api.features.expenses.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ExpenseCategory {
    MATERIALS("Materiais"),
    RENT("Aluguel"),
    UTILITIES("Utilidades (Luz/Água)"),
    MARKETING("Marketing"),
    OTHER("Outros");

    private final String label;

    ExpenseCategory(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static ExpenseCategory fromLabel(String value) {
        if (value == null) return null;
        for (ExpenseCategory c : values()) {
            if (c.label.equals(value)) {
                return c;
            }
        }
        throw new IllegalArgumentException("Categoria inválida: " + value);
    }
}
