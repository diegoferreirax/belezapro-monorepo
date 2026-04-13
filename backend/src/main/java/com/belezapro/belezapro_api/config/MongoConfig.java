package com.belezapro.belezapro_api.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;

@Configuration
public class MongoConfig {

    private final MappingMongoConverter mappingMongoConverter;

    public MongoConfig(MappingMongoConverter mappingMongoConverter) {
        this.mappingMongoConverter = mappingMongoConverter;
    }

    @PostConstruct
    public void removeClassKey() {
        mappingMongoConverter.setTypeMapper(new DefaultMongoTypeMapper(null));
    }
}
