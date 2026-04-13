package com.belezapro.belezapro_api;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Requires MongoDB to be running. Integration tests should be configured with Testcontainers in the future.")
class BelezaproApiApplicationTests {

	@Test
	void contextLoads() {
	}

}
