package com.debatearena.config;

import com.debatearena.model.AdminUser;
import com.debatearena.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * =====================================================================
 * Admin User Initializer
 * =====================================================================
 *
 * Automatically creates the initial admin user on application startup
 * if one doesn't already exist. Credentials are read from environment
 * variables (backend/.env file).
 *
 * Environment Variables Required:
 * - ADMIN_USERNAME (default: admin)
 * - ADMIN_PASSWORD (default: Admin@2026)
 * - ADMIN_EMAIL (default: admin@tarkvtark.com)
 * - ADMIN_FULL_NAME (default: System Administrator)
 *
 * Security Notes:
 * - Password is hashed using BCrypt (strength 12)
 * - Change default credentials after first deployment
 * - Never commit .env file to version control
 *
 * @author TarkVtark Team
 */
@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final AdminUserRepository adminUserRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.password:Admin@2026}")
    private String adminPassword;

    @Value("${admin.email:admin@tarkvtark.com}")
    private String adminEmail;

    @Value("${admin.fullName:System Administrator}")
    private String adminFullName;

    @Override
    public void run(String... args) {
        initializeAdminUser();
    }

    /**
     * Create initial admin user if one doesn't exist
     */
    private void initializeAdminUser() {
        logger.info("🔍 Checking for admin user...");

        // Check if any admin user exists
        if (adminUserRepository.findByUsername(adminUsername).isPresent()) {
            logger.info("✅ Admin user already exists: {}", adminUsername);
            return;
        }

        logger.info("👤 Creating initial admin user from environment variables...");

        try {
            // Create new admin user
            AdminUser adminUser = new AdminUser();
            adminUser.setUsername(adminUsername);
            adminUser.setEmail(adminEmail);
            adminUser.setPasswordHash(passwordEncoder.encode(adminPassword));
            adminUser.setFullName(adminFullName);
            adminUser.setIsActive(true);
            adminUser.setCreatedAt(LocalDateTime.now());

            // Save to database
            adminUserRepository.save(adminUser);

            logger.info("✅ Admin user created successfully:");
            logger.info("   Username: {}", adminUsername);
            logger.info("   Email: {}", adminEmail);
            logger.info("   Full Name: {}", adminFullName);
            logger.warn("⚠️  IMPORTANT: Change the default password after first login!");

        } catch (Exception e) {
            logger.error("❌ Failed to create admin user: {}", e.getMessage());
            logger.error("   Make sure the database is accessible and admin_users table exists");
        }
    }
}

