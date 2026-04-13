package com.belezapro.belezapro_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class BelezaproApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(BelezaproApiApplication.class, args);
	}

}
