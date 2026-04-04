package com.belezapro.belezapro_api.features.appointments.repositories;

import com.belezapro.belezapro_api.features.appointments.models.Appointment;
import com.belezapro.belezapro_api.features.appointments.models.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class AppointmentRepositoryCustomImpl implements AppointmentRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    public AppointmentRepositoryCustomImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Page<Appointment> findAppointmentsDynamic(String adminId, String clientId, String term, String startDate, String endDate, AppointmentStatus status, Pageable pageable) {
        Criteria criteria = Criteria.where("adminId").is(adminId);

        if (clientId != null && !clientId.isBlank()) {
            criteria.and("clientId").is(clientId);
        }

        if (term != null && !term.isBlank()) {
            Criteria termCriteria = new Criteria().orOperator(
                Criteria.where("clientName").regex(term, "i"),
                Criteria.where("parsedServiceNames").regex(term, "i")
            );
            criteria.andOperator(termCriteria);
        }

        if (startDate != null && endDate != null) {
            criteria.and("date").gte(startDate).lte(endDate);
        } else if (startDate != null) {
            criteria.and("date").gte(startDate);
        } else if (endDate != null) {
            criteria.and("date").lte(endDate);
        }

        if (status != null) {
            criteria.and("status").is(status);
        }

        Query query = new Query(criteria);
        long total = mongoTemplate.count(query, Appointment.class);

        query.with(pageable);
        List<Appointment> list = mongoTemplate.find(query, Appointment.class);

        return new PageImpl<>(list, pageable, total);
    }
}
