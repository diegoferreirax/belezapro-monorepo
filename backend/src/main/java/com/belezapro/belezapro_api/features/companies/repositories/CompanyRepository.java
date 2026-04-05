package com.belezapro.belezapro_api.features.companies.repositories;

import com.belezapro.belezapro_api.features.companies.models.Company;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRepository extends MongoRepository<Company, String> {
}
