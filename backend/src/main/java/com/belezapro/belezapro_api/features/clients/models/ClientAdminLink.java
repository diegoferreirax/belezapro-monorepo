package com.belezapro.belezapro_api.features.clients.models;

import com.belezapro.belezapro_api.common.models.Auditable;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "client_admin_links")
@CompoundIndex(name = "client_admin_unique", def = "{'userId': 1, 'adminId': 1}", unique = true)
public class ClientAdminLink extends Auditable {

    @Id
    private String id;

    private String userId;
    private String adminId;

    @Builder.Default
    private boolean isBlocked = false;
}
