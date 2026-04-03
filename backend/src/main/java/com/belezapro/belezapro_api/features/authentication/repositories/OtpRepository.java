package com.belezapro.belezapro_api.features.authentication.repositories;

import com.belezapro.belezapro_api.features.authentication.models.Otp;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends MongoRepository<Otp, String> {
    Optional<Otp> findByEmailAndCode(String email, String code);
    void deleteByEmail(String email);
}
