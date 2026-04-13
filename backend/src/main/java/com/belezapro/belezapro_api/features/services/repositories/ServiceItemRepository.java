package com.belezapro.belezapro_api.features.services.repositories;

import com.belezapro.belezapro_api.features.services.models.ServiceItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceItemRepository extends MongoRepository<ServiceItem, String> {
    List<ServiceItem> findAllByAdminId(String adminId);
    Optional<ServiceItem> findByIdAndAdminId(String id, String adminId);
    void deleteByIdAndAdminId(String id, String adminId);
}
