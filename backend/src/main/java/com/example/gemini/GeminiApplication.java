package com.example.gemini;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.example.gemini", "com.company.aiinterview"})
@EnableJpaRepositories(basePackages = "com.company.aiinterview")
@EntityScan(basePackages = "com.company.aiinterview")
public class GeminiApplication {
    public static void main(String[] args) {
        SpringApplication.run(GeminiApplication.class, args);
    }
}
