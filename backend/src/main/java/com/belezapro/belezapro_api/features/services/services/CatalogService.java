package com.belezapro.belezapro_api.features.services.services;

import com.belezapro.belezapro_api.features.services.models.ServiceItem;
import com.belezapro.belezapro_api.features.services.repositories.ServiceItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CatalogService {
    
    private final ServiceItemRepository repository;

    public CatalogService(ServiceItemRepository repository) {
        this.repository = repository;
    }

    public List<ServiceItem> getAll(String adminId) {
        return repository.findAllByAdminId(adminId);
    }

    public ServiceItem create(String adminId, ServiceItem item) {
        item.setAdminId(adminId);
        return repository.save(item);
    }

    public ServiceItem update(String adminId, String id, ServiceItem item) {
        ServiceItem existing = repository.findByIdAndAdminId(id, adminId)
            .orElseThrow(() -> new IllegalArgumentException("Service not found or you don't have permission"));
        
        existing.setName(item.getName());
        existing.setPrice(item.getPrice());
        existing.setDurationMinutes(item.getDurationMinutes());
        existing.setIsActive(item.getIsActive());
        
        return repository.save(existing);
    }

    public void delete(String adminId, String id) {
        repository.deleteByIdAndAdminId(id, adminId);
    }
}
