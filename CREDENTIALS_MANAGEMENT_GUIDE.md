# Secure Credential Management Guide

## Overview

This guide explains how credentials are managed securely in the TarkVtark Debate Arena application.

## Architecture

### Database Credentials (Backend)

✅ **Secure Approach (Current)**
- Database credentials stored in `backend/.env`
- Application.yml references environment variables
- .env file excluded from git via .gitignore
- Production uses actual environment variables

❌ **Insecure Approach (Avoided)**
- Hardcoded credentials in application.yml
- Credentials committed to version control
- Same credentials across all environments

### Admin User Credentials

✅ **Secure Approach (Current)**
- Initial admin credentials in `backend/.env`
- Admin user auto-created on startup if doesn't exist
- Password hashed with BCrypt (strength 12)
- Environment-specific credentials

❌ **Insecure Approach (Avoided)**
- Hardcoded in SQL scripts
- Same credentials everywhere
- Plain text passwords

## File Structure

```
tarkVtark.com/
├── backend/
│   ├── .env                  # Actual credentials (NOT in git)
│   ├── .env.example          # Template (safe to commit)
│   └── src/main/resources/
│       └── application.yml   # Uses ${ENV_VAR} placeholders
├── frontend/
│   ├── .env                  # Actual config (NOT in git)
│   └── .env.example          # Template (safe to commit)
└── .gitignore                # Excludes all .env files
```

## Backend Environment Variables

### Required Variables

```bash
# Database Connection
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/db?sslmode=require
SPRING_DATASOURCE_USERNAME=username
SPRING_DATASOURCE_PASSWORD=password

# Admin User (Auto-created on startup)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@2026
ADMIN_EMAIL=admin@tarkvtark.com
ADMIN_FULL_NAME=System Administrator

# Security
JWT_SECRET=your-secret-key-minimum-32-characters
JWT_EXPIRATION_MS=86400000
BCRYPT_STRENGTH=12
```

### Setup Instructions

1. **Copy the example file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit .env with your credentials:**
   ```bash
   # Use your actual database credentials
   nano .env
   ```

3. **Verify .env is ignored by git:**
   ```bash
   git status
   # .env should NOT appear in changes
   ```

## Admin User Creation

### Automatic Initialization

The `AdminUserInitializer` component runs on application startup:

1. Checks if admin user exists (by username)
2. If not exists, creates user with:
   - Username from `ADMIN_USERNAME`
   - Password from `ADMIN_PASSWORD` (BCrypt hashed)
   - Email from `ADMIN_EMAIL`
   - Full name from `ADMIN_FULL_NAME`

### Logs to Check

```
🔍 Checking for admin user...
👤 Creating initial admin user from environment variables...
✅ Admin user created successfully:
   Username: admin
   Email: admin@tarkvtark.com
   Full Name: System Administrator
⚠️  IMPORTANT: Change the default password after first login!
```

## Security Best Practices

### Development Environment

```bash
# backend/.env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@2026  # Simple password OK for local dev
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/debate_db
```

### Production Environment

```bash
# Use environment variables set in hosting platform
# DO NOT use .env file in production

export ADMIN_USERNAME=superadmin
export ADMIN_PASSWORD='Complex!P@ssw0rd#2026$Secure'
export SPRING_DATASOURCE_URL='jdbc:postgresql://prod-host:5432/prod_db?sslmode=require'
export JWT_SECRET='ProductionSecretKey256BitsMinimumRandomlyGenerated'
```

## Frontend Environment Variables

### Setup

```bash
cd frontend
cp .env.example .env
```

### Configuration

```bash
# frontend/.env
VITE_API_URL=http://localhost:8080/api/v1
```

### Usage in Code

```javascript
// Vite exposes as import.meta.env.VITE_*
const API_URL = import.meta.env.VITE_API_URL;
```

## Common Issues & Solutions

### Issue 1: Database Connection Failed

**Error:**
```
Driver org.postgresql.Driver claims to not accept jdbcUrl, ${SPRING_DATASOURCE_URL}
```

**Solution:**
- .env file not loaded properly
- Check .env is in `backend/` directory
- Verify environment variable names match exactly
- Restart the application

### Issue 2: Admin User Not Created

**Error:**
```
Failed to create admin user: admin_users table doesn't exist
```

**Solution:**
1. Run database schema creation first:
   ```bash
   psql "$SPRING_DATASOURCE_URL" -f database-schema.sql
   ```
2. Restart the application
3. Check logs for admin creation

### Issue 3: .env Changes Not Picked Up

**Solution:**
- Restart the Spring Boot application
- Environment variables are loaded at startup
- Changes require full restart (not hot reload)

## Deployment Checklist

### Before Going to Production

- [ ] Change `ADMIN_PASSWORD` to strong password
- [ ] Change `JWT_SECRET` to random 256-bit key
- [ ] Use production database credentials
- [ ] Remove .env file (use platform environment variables)
- [ ] Verify .env not in version control
- [ ] Enable SSL/TLS for database connection
- [ ] Set `SPRING_PROFILES_ACTIVE=prod`

### Platform-Specific Setup

#### Heroku
```bash
heroku config:set ADMIN_PASSWORD='SecurePassword123!'
heroku config:set SPRING_DATASOURCE_URL='jdbc:postgresql://...'
```

#### AWS Elastic Beanstalk
Configure in `.ebextensions/environment.config`

#### Docker
```dockerfile
ENV ADMIN_PASSWORD=SecurePassword123!
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://...
```

## API Contract Compliance

All implementations follow `api-contract.yaml`:

### POST /admin/login

**Request:**
```json
{
  "username": "admin",
  "password": "Admin@2026"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "user": {
    "username": "admin",
    "email": "admin@tarkvtark.com",
    "fullName": "System Administrator"
  }
}
```

**Response (Error):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid credentials"
}
```

## Testing

### Test Admin Login

```bash
# Test with default credentials
curl -X POST http://localhost:8080/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@2026"
  }'
```

### Verify Token

```bash
curl -X POST http://localhost:8080/api/v1/admin/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Maintenance

### Changing Admin Password

1. **Via Database:**
   ```sql
   -- Generate BCrypt hash for new password
   -- Use online tool or Spring Security BCrypt encoder
   
   UPDATE admin_users 
   SET password_hash = '$2a$12$NEW_BCRYPT_HASH'
   WHERE username = 'admin';
   ```

2. **Via Environment Variables:**
   ```bash
   # Update .env
   ADMIN_PASSWORD=NewPassword123!
   
   # Delete existing admin user
   DELETE FROM admin_users WHERE username = 'admin';
   
   # Restart application (will recreate with new password)
   ```

### Adding Additional Admin Users

Manually insert into database:

```sql
INSERT INTO admin_users (
  id, username, email, password_hash, full_name, is_active, created_at
) VALUES (
  gen_random_uuid(),
  'newadmin',
  'newadmin@example.com',
  '$2a$12$BCRYPT_HASH_OF_PASSWORD',
  'New Admin Name',
  true,
  CURRENT_TIMESTAMP
);
```

## Conclusion

✅ **Current Implementation:**
- Database credentials in environment variables
- Admin credentials auto-created from .env
- No sensitive data in version control
- API contract compliant
- Production-ready

✅ **Security Checklist:**
- [x] Credentials not hardcoded
- [x] .env excluded from git
- [x] Passwords BCrypt hashed
- [x] JWT tokens for authentication
- [x] Environment-specific configuration

## Support

For issues or questions:
- Check application logs
- Review this documentation
- Contact: admin@tarkvtark.com

