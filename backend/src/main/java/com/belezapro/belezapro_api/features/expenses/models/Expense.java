package com.belezapro.belezapro_api.features.expenses.models;

import com.belezapro.belezapro_api.common.models.Auditable;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "expenses")
@CompoundIndex(name = "adminId_date", def = "{'adminId': 1, 'date': -1}")
public class Expense extends Auditable {

    @Id
    private String id;

    @Indexed
    private String adminId;

    private String description;

    private BigDecimal amount;

    private String date;

    private ExpenseCategory category;

    @JsonProperty("isPaid")
    @Field("isPaid")
    private boolean paid;
}
