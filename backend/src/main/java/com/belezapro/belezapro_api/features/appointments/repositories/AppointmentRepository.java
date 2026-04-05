package com.belezapro.belezapro_api.features.appointments.repositories;

import com.belezapro.belezapro_api.features.appointments.models.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String>, AppointmentRepositoryCustom {

    @Aggregation(pipeline = { "{ $match: { clientId: ?0 } }", "{ $group: { _id: '$companyId' } }" })
    List<String> findDistinctCompanyIdsByClientId(String clientId);

    List<Appointment> findAllByAdminIdAndDateBetween(String adminId, String startDate, String endDate);

    List<Appointment> findAllByAdminIdAndDate(String adminId, String date);

    @Query("{'adminId': ?0, 'date': ?1, 'status': { $in: ['PENDING', 'CONFIRMED'] }}")
    List<Appointment> findActiveByAdminIdAndDate(String adminId, String date);
    
    @Query("{'clientId': ?0, 'adminId': ?1, 'date': { $gte: ?2 }, 'status': { $in: ['PENDING', 'CONFIRMED'] }}")
    List<Appointment> findActiveFutureByClientAndAdmin(String clientId, String adminId, String date);

}
