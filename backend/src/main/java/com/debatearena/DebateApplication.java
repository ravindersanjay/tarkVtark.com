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
        // Load optional .env, .env.dev, and .env.local to override configuration
        // Supported variables (see .env.dev or .env.prod for complete list):
        //
        // File Storage Providers (choose one):
        // - FILE_PROVIDER=local       (development - files in ./uploads)
        // - FILE_PROVIDER=supabase    (online - Supabase Storage)
        // - FILE_PROVIDER=s3          (production - AWS S3)
        // - FILE_PROVIDER=r2          (production - Cloudflare R2)
        //
        // For Supabase:
        // SUPABASE_URL=https://xxx.supabase.co
        // SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
        // SUPABASE_STORAGE_BUCKET=attachments
        try {
            // Load in order: base .env.dev → .env → .env.local
            // Each subsequent file can override the previous
            Dotenv dev = Dotenv.configure().filename(".env.dev").ignoreIfMissing().load();
            Dotenv base = Dotenv.configure().filename(".env").ignoreIfMissing().load();
            Dotenv local = Dotenv.configure().filename(".env.local").ignoreIfMissing().load();

            // Map common variables into system properties used by Spring configuration
            // Order: dev → base → local (later files override earlier ones)
            
            // File storage provider configuration
            mapIfPresent(dev, "FILE_PROVIDER", "file.provider");
            mapIfPresent(base, "FILE_PROVIDER", "file.provider");
            mapIfPresent(local, "STORAGE_MODE", "file.provider");
            mapIfPresent(base, "FILE_UPLOAD_DIR", "file.upload-dir");
            mapIfPresent(local, "LOCAL_UPLOAD_DIR", "file.upload-dir");
            mapIfPresent(base, "FILE_BASE_URL", "file.base-url");
            mapIfPresent(local, "BASE_FILE_URL", "file.base-url");
            
            // Server port mapping (so DTO can pick correct port when building URLs)
            mapIfPresent(base, "SERVER_PORT", "server.port");
            mapIfPresent(local, "SERVER_PORT", "server.port");

            // Supabase Storage configuration
            mapIfPresent(dev, "SUPABASE_URL", "supabase.url");
            mapIfPresent(base, "SUPABASE_URL", "supabase.url");
            mapIfPresent(local, "SUPABASE_URL", "supabase.url");
            mapIfPresent(dev, "SUPABASE_SERVICE_ROLE_KEY", "supabase.service-role-key");
            mapIfPresent(base, "SUPABASE_SERVICE_ROLE_KEY", "supabase.service-role-key");
            mapIfPresent(local, "SUPABASE_SERVICE_ROLE_KEY", "supabase.service-role-key");
            mapIfPresent(dev, "SUPABASE_STORAGE_BUCKET", "supabase.storage-bucket");
            mapIfPresent(base, "SUPABASE_STORAGE_BUCKET", "supabase.storage-bucket");
            mapIfPresent(local, "SUPABASE_STORAGE_BUCKET", "supabase.storage-bucket");

            // AWS S3 configuration
            mapIfPresent(dev, "AWS_ACCESS_KEY_ID", "aws.access-key-id");
            mapIfPresent(base, "AWS_ACCESS_KEY_ID", "aws.access-key-id");
            mapIfPresent(local, "AWS_ACCESS_KEY_ID", "aws.access-key-id");
            mapIfPresent(dev, "AWS_SECRET_ACCESS_KEY", "aws.secret-access-key");
            mapIfPresent(base, "AWS_SECRET_ACCESS_KEY", "aws.secret-access-key");
            mapIfPresent(local, "AWS_SECRET_ACCESS_KEY", "aws.secret-access-key");
            mapIfPresent(dev, "AWS_REGION", "aws.region");
            mapIfPresent(base, "AWS_REGION", "aws.region");
            mapIfPresent(local, "AWS_REGION", "aws.region");
            mapIfPresent(dev, "AWS_S3_BUCKET", "aws.s3.bucket");
            mapIfPresent(base, "AWS_S3_BUCKET", "aws.s3.bucket");
            mapIfPresent(local, "AWS_S3_BUCKET", "aws.s3.bucket");

            // Cloudflare R2 configuration
            mapIfPresent(dev, "R2_ACCESS_KEY_ID", "r2.access-key-id");
            mapIfPresent(base, "R2_ACCESS_KEY_ID", "r2.access-key-id");
            mapIfPresent(local, "R2_ACCESS_KEY_ID", "r2.access-key-id");
            mapIfPresent(dev, "R2_SECRET_ACCESS_KEY", "r2.secret-access-key");
            mapIfPresent(base, "R2_SECRET_ACCESS_KEY", "r2.secret-access-key");
            mapIfPresent(local, "R2_SECRET_ACCESS_KEY", "r2.secret-access-key");
            mapIfPresent(dev, "R2_BUCKET", "r2.bucket");
            mapIfPresent(base, "R2_BUCKET", "r2.bucket");
            mapIfPresent(local, "R2_BUCKET", "r2.bucket");
            mapIfPresent(dev, "R2_ENDPOINT", "r2.endpoint");
            mapIfPresent(base, "R2_ENDPOINT", "r2.endpoint");
            mapIfPresent(local, "R2_ENDPOINT", "r2.endpoint");
            mapIfPresent(dev, "R2_PUBLIC_BASE_URL", "r2.public-base-url");
            mapIfPresent(base, "R2_PUBLIC_BASE_URL", "r2.public-base-url");
            mapIfPresent(local, "R2_PUBLIC_BASE_URL", "r2.public-base-url");
            mapIfPresent(dev, "R2_REGION", "r2.region");
            mapIfPresent(base, "R2_REGION", "r2.region");
            mapIfPresent(local, "R2_REGION", "r2.region");

        } catch (Exception e) {
            System.err.println("⚠️ Could not load .env files: " + e.getMessage());
            System.err.println("Continuing with default configuration...");
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

