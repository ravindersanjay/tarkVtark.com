package com.debatearena.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * =====================================================================
 * Dotenv Configuration
 * =====================================================================
 *
 * Loads environment variables from .env file located in project root.
 * This allows secure storage of database credentials and other sensitive
 * configuration outside of application.yml.
 *
 * The .env file should be in the project root directory (same level as pom.xml)
 * and should be added to .gitignore to prevent committing secrets.
 *
 * Environment variables loaded:
 * - SPRING_DATASOURCE_URL
 * - SPRING_DATASOURCE_USERNAME
 * - SPRING_DATASOURCE_PASSWORD
 * - SPRING_JPA_HIBERNATE_DDL_AUTO
 * - SERVER_PORT
 * - etc.
 *
 * @author TarkVtark Team
 */
public class DotenvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        try {
            // Try multiple locations for .env file (backend/.env is preferred)
            Dotenv dotenv = null;
            String loadedFrom = null;

            // Try backend directory first (best practice - isolated config)
            try {
                dotenv = Dotenv.configure()
                        .directory("./")
                        .ignoreIfMissing()
                        .load();
                if (dotenv != null && dotenv.get("SPRING_DATASOURCE_URL") != null) {
                    loadedFrom = "./backend/.env (current directory)";
                }
            } catch (Exception e1) {
                // Try parent directory (legacy location)
                try {
                    dotenv = Dotenv.configure()
                            .directory("../")
                            .ignoreIfMissing()
                            .load();
                    if (dotenv != null && dotenv.get("SPRING_DATASOURCE_URL") != null) {
                        loadedFrom = "../.env (parent directory - legacy)";
                    }
                } catch (Exception e2) {
                    // Try current working directory
                    try {
                        dotenv = Dotenv.configure()
                                .ignoreIfMissing()
                                .load();
                        if (dotenv != null && dotenv.get("SPRING_DATASOURCE_URL") != null) {
                            loadedFrom = ".env (working directory)";
                        }
                    } catch (Exception e3) {
                        // Will be handled below
                    }
                }
            }

            if (dotenv == null || dotenv.get("SPRING_DATASOURCE_URL") == null) {
                System.err.println("⚠️ WARNING: Could not load .env file from any location");
                System.err.println("   Tried: ./ (backend/.env), ../ (root/.env), and working directory");
                System.err.println("   Please create backend/.env file with database credentials");
                System.err.println("   Application will use system environment variables");
                return;
            }

            System.out.println("✅ Loaded .env from: " + loadedFrom);

            ConfigurableEnvironment environment = applicationContext.getEnvironment();
            Map<String, Object> dotenvMap = new HashMap<>();

            // Load all entries from .env file
            int loadedCount = 0;
            for (var entry : dotenv.entries()) {
                String key = entry.getKey();
                String value = entry.getValue();

                if (key != null && value != null && !value.isEmpty()) {
                    dotenvMap.put(key, value);
                    // Also set as system property for compatibility
                    System.setProperty(key, value);
                    loadedCount++;
                }
            }

            // Add to Spring environment with high priority
            environment.getPropertySources().addFirst(new MapPropertySource("dotenvProperties", dotenvMap));

            System.out.println("✅ Successfully loaded " + loadedCount + " environment variables");

            // Verify critical properties
            boolean hasDbUrl = dotenvMap.containsKey("SPRING_DATASOURCE_URL");
            boolean hasDbUser = dotenvMap.containsKey("SPRING_DATASOURCE_USERNAME");
            boolean hasDbPass = dotenvMap.containsKey("SPRING_DATASOURCE_PASSWORD");

            System.out.println("📊 Database URL: " + (hasDbUrl ? "✓ Configured" : "✗ Missing"));
            System.out.println("📊 Database Username: " + (hasDbUser ? "✓ Configured" : "✗ Missing"));
            System.out.println("📊 Database Password: " + (hasDbPass ? "✓ Configured" : "✗ Missing"));

            if (!hasDbUrl || !hasDbUser || !hasDbPass) {
                System.err.println("⚠️ WARNING: Missing required database configuration!");
                System.err.println("   Required in backend/.env: SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, SPRING_DATASOURCE_PASSWORD");
            } else {
                System.out.println("🎉 Database configuration complete!");
            }

        } catch (Exception e) {
            System.err.println("⚠️ Error loading .env file: " + e.getMessage());
            System.err.println("   Application will use system environment variables");
            e.printStackTrace();
        }
    }
}

