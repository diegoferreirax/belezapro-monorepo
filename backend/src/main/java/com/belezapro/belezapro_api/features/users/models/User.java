package com.belezapro.belezapro_api.features.users.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.belezapro.belezapro_api.common.models.Auditable;

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
    private String password;
    private Role role;
    
    @Builder.Default
    private boolean isBlocked = false;
}
