-- =====================================================================
-- ADMIN USER INITIALIZATION SCRIPT
-- =====================================================================
-- This script creates the initial admin user with secure password.
--
-- Default Credentials:
-- Username: admin
-- Password: Admin@2026
--
-- Password Hash: BCrypt with strength 12
-- Hash: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLAIr1HW
--
-- IMPORTANT: Change the default password after first login!
--
-- Run this script after database-schema.sql
-- =====================================================================

-- Insert default admin user (only if not exists)
INSERT INTO admin_users (
    id,
    username,
    email,
    password_hash,
    full_name,
    is_active,
    created_at
)
VALUES (
    gen_random_uuid(),
    'admin',
    'admin@tarkvtark.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLAIr1HW',
    'System Administrator',
    true,
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;

-- Verify admin user created
SELECT
    id,
    username,
    email,
    full_name,
    is_active,
    created_at
FROM admin_users
WHERE username = 'admin';

-- =====================================================================
-- PASSWORD INFORMATION
-- =====================================================================
-- The password hash was generated using BCrypt with strength 12:
--
-- Plain text password: Admin@2026
-- BCrypt hash: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLAIr1HW
--
-- To generate a new password hash (Java):
-- BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
-- String hash = encoder.encode("your-password");
--
-- SECURITY NOTE:
-- Always use strong passwords in production!
-- Recommended: Minimum 12 characters with mix of:
-- - Uppercase letters
-- - Lowercase letters
-- - Numbers
-- - Special characters
-- =====================================================================

