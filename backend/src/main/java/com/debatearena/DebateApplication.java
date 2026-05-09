package com.debatearena;

import io.github.cdimascio.dotenv.Dotenv;
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
        // Load optional .env.local to override configuration for local development.
        // Supported variables (example .env.local):
        // STORAGE_MODE=local
        // LOCAL_UPLOAD_DIR=./uploads
        // BASE_FILE_URL=http://localhost:5173/uploads
        // AWS_ACCESS_KEY_ID=...
        // AWS_SECRET_ACCESS_KEY=...
        try {
            // Load base .env first, then .env.local to allow overrides per developer machine
            Dotenv base = Dotenv.configure().filename(".env").ignoreIfMissing().load();
            Dotenv local = Dotenv.configure().filename(".env.local").ignoreIfMissing().load();

            // Map common variables into system properties used by Spring configuration
            // Order: base then local (local overrides base)
            mapIfPresent(base, "FILE_PROVIDER", "file.provider");
            mapIfPresent(local, "STORAGE_MODE", "file.provider");
            mapIfPresent(base, "FILE_UPLOAD_DIR", "file.upload-dir");
            mapIfPresent(local, "LOCAL_UPLOAD_DIR", "file.upload-dir");
            mapIfPresent(base, "FILE_BASE_URL", "file.base-url");
            mapIfPresent(local, "BASE_FILE_URL", "file.base-url");
            // Server port mapping (so DTO can pick correct port when building URLs)
            mapIfPresent(base, "SERVER_PORT", "server.port");
            mapIfPresent(local, "SERVER_PORT", "server.port");

            // AWS keys and bucket/region
            mapIfPresent(base, "AWS_ACCESS_KEY_ID", "aws.access-key-id");
            mapIfPresent(local, "AWS_ACCESS_KEY_ID", "aws.access-key-id");
            mapIfPresent(base, "AWS_SECRET_ACCESS_KEY", "aws.secret-access-key");
            mapIfPresent(local, "AWS_SECRET_ACCESS_KEY", "aws.secret-access-key");
            mapIfPresent(base, "AWS_REGION", "aws.region");
            mapIfPresent(local, "AWS_REGION", "aws.region");
            mapIfPresent(base, "AWS_S3_BUCKET", "aws.s3.bucket");
            mapIfPresent(local, "AWS_S3_BUCKET", "aws.s3.bucket");

        } catch (Exception e) {
            System.err.println("Could not load .env files: " + e.getMessage());
        }

        SpringApplication.run(DebateApplication.class, args);
    }

    private static void mapIfPresent(Dotenv dotenv, String envKey, String sysPropKey) {
        if (dotenv == null) return;
        try {
            String v = dotenv.get(envKey);
            if (v != null && !v.isEmpty()) {
                System.setProperty(sysPropKey, v);
            }
        } catch (Exception ignored) {
        }
    }
}

