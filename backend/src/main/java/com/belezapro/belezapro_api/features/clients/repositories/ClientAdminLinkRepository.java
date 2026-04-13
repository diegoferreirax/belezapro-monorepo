package com.belezapro.belezapro_api.features.clients.repositories;

import com.belezapro.belezapro_api.features.clients.models.ClientAdminLink;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientAdminLinkRepository extends MongoRepository<ClientAdminLink, String> {
    List<ClientAdminLink> findAllByAdminId(String adminId);
    Optional<ClientAdminLink> findByUserIdAndAdminId(String userId, String adminId);
    boolean existsByUserIdAndAdminId(String userId, String adminId);
}
