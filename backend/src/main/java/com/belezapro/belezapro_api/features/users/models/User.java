package com.belezapro.belezapro_api.features.users.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.belezapro.belezapro_api.common.models.Auditable;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User extends Auditable {
    
    @Id
    private String id;
    
    private String name;
    private String email;
    private String phone;
    private String companyId; // The company this user belongs to
    private String password;
    private Role role;
    
    @Builder.Default
    private boolean isBlocked = false;
}
