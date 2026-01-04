package com.debatearena;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * =====================================================================
 * Debate Arena Backend Application
 * =====================================================================
 *
 * Main entry point for the Spring Boot application.
 *
 * This application provides REST API endpoints for the TarkVtark debate
 * platform, managing topics, questions, replies, voting, and admin features.
 *
 * All data is stored in PostgreSQL database (Neon DB).
 * API specification: api-contract.yaml (OpenAPI 3.0)
 *
 * @author TarkVtark Team
 * @version 1.0.0
 */
@SpringBootApplication
public class DebateApplication {

    public static void main(String[] args) {
        SpringApplication.run(DebateApplication.class, args);
    }
}

