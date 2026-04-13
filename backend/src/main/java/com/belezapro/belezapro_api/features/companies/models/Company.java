package com.belezapro.belezapro_api.features.companies.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.belezapro.belezapro_api.common.models.Auditable;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "companies")
public class Company extends Auditable {

    @Id
    private String id;
    
    private String name;
    private String document; // CNPJ / CPF
    private String phone;
    
    @Builder.Default
    private boolean isActive = true;
}
