package com.belezapro.belezapro_api.features.schedule.repositories;

import com.belezapro.belezapro_api.features.schedule.models.ScheduleOverride;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleOverrideRepository extends MongoRepository<ScheduleOverride, String> {
    List<ScheduleOverride> findAllByAdminId(String adminId);
    Optional<ScheduleOverride> findByAdminIdAndDate(String adminId, String date);
}
