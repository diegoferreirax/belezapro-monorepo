package com.belezapro.belezapro_api.features.schedule.repositories;

import com.belezapro.belezapro_api.features.schedule.models.ScheduleConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleConfigRepository extends MongoRepository<ScheduleConfig, String> {
    List<ScheduleConfig> findAllByAdminIdOrderByDayOfWeekAsc(String adminId);
    Optional<ScheduleConfig> findByAdminIdAndDayOfWeek(String adminId, Integer dayOfWeek);
}
