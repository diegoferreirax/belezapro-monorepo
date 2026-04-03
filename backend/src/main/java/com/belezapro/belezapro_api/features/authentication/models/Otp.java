package com.belezapro.belezapro_api.features.authentication.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "otps")
public class Otp {
    @Id
    private String id;
    
    private String email;
    private String code;
    
    // Deleta o registro automaticamente quando o tempo base + os segundos (0) passam.
    @Indexed(name = "expire_at_index", expireAfterSeconds = 0)
    private Instant expireAt;
}
