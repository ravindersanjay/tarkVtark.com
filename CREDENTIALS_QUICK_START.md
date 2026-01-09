# 🚀 Quick Start - Secure Credentials

## First Time Setup (2 minutes)

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
cp .env.example .env
# VITE_API_URL is already set to http://localhost:8080/api/v1
npm install
npm run dev
```

## Default Admin Credentials

**Username:** `admin`  
**Password:** `Admin@2026`  
**Email:** `admin@tarkvtark.com`

⚠️ **Change these in production!**

## Environment Variables Cheat Sheet

### Backend (.env)
```bash
# Database (Required)
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/db?sslmode=require
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password

# Admin User (Auto-created on first run)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@2026
ADMIN_EMAIL=admin@tarkvtark.com
ADMIN_FULL_NAME=System Administrator

# Security
JWT_SECRET=YourSecretKey32CharactersMinimum
JWT_EXPIRATION_MS=86400000
BCRYPT_STRENGTH=12
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8080/api/v1
```

## Common Commands

### Start Backend
```bash
cd backend
mvn spring-boot:run
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Test Admin Login
```bash
curl -X POST http://localhost:8080/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2026"}'
```

### Kill Port 8080 (if backend won't start)
```bash
# Linux/WSL
lsof -ti:8080 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
```

## What Happens on First Run?

1. ✅ Backend loads .env file
2. ✅ Connects to database
3. ✅ Checks if admin user exists
4. ✅ If not, creates admin user with:
   - Username from ADMIN_USERNAME
   - Password from ADMIN_PASSWORD (BCrypt hashed)
   - Email from ADMIN_EMAIL
   - Full name from ADMIN_FULL_NAME
5. ✅ Application ready!

## Important Files

| File | Purpose | In Git? |
|------|---------|---------|
| `backend/.env` | Actual credentials | ❌ NO |
| `backend/.env.example` | Template | ✅ YES |
| `frontend/.env` | Actual config | ❌ NO |
| `frontend/.env.example` | Template | ✅ YES |
| `.gitignore` | Excludes .env files | ✅ YES |

## Security Rules

1. ✅ **NEVER commit .env files**
2. ✅ **Use strong passwords in production**
3. ✅ **Change default admin password**
4. ✅ **Use different credentials per environment**
5. ✅ **Enable SSL/TLS in production**

## Troubleshooting

### .env not loading?
- Check file is in `backend/.env` (not root)
- Restart application (env vars loaded at startup)
- Verify no typos in variable names

### Admin user not created?
- Check logs for "Checking for admin user"
- Verify ADMIN_USERNAME, ADMIN_PASSWORD in .env
- Ensure database connection successful

### Login fails?
- Verify credentials match .env file
- Check admin user exists in database
- Look for error logs

## Production Checklist

- [ ] Change ADMIN_PASSWORD
- [ ] Change JWT_SECRET (256-bit random)
- [ ] Use production database
- [ ] Set SPRING_PROFILES_ACTIVE=prod
- [ ] Remove .env file
- [ ] Use platform environment variables
- [ ] Enable HTTPS
- [ ] Configure firewall

## Documentation

- **Full Guide:** `CREDENTIALS_MANAGEMENT_GUIDE.md`
- **Implementation Details:** `CREDENTIALS_IMPLEMENTATION_COMPLETE.md`
- **Summary:** `CREDENTIALS_FINAL_SUMMARY.md`

## Support

- Check logs first
- Review documentation
- Email: admin@tarkvtark.com

---

**Updated:** January 9, 2026  
**Version:** 1.0.0

