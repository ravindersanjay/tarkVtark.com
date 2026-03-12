# **AWS ELASTIC BEANSTALK - BACKEND DEPLOYMENT GUIDE**

**Date**: March 12, 2026  
**Project**: TarkVtark Debate Arena  
**Status**: Ready for Beanstalk Deployment

---

## **PREREQUISITES**

Before starting:
- ✅ AWS Account created
- ✅ Backend code compiled successfully (`mvn clean compile`)
- ✅ Backend tested locally (`mvn spring-boot:run`)
- ✅ Backend `.env` file configured
- ✅ Database connection string ready (Neon)

---

## **STEP 1: PREPARE BACKEND**

### **1.1: Create Production JAR**

```bash
cd /mnt/d/temp/tarkVtark.com/backend
mvn clean package -DskipTests
```

**Expected output:**
```
[INFO] Building jar: target/debate-backend-1.0.0.jar
[INFO] BUILD SUCCESS
```

**File created:** `backend/target/debate-backend-1.0.0.jar` (~50MB)

### **1.2: Verify JAR**

```bash
ls -lh backend/target/debate-backend-1.0.0.jar
```

Should show the JAR file with size.

### **1.3: Test JAR Locally (Optional)**

```bash
cd backend
java -jar target/debate-backend-1.0.0.jar
```

Should start on port 8080. Stop with Ctrl+C.

---

## **STEP 2: CREATE ELASTIC BEANSTALK APPLICATION**

### **2.1: Open AWS Console**

1. Go to: `https://console.aws.amazon.com`
2. Search for: **Elastic Beanstalk**
3. Click on **AWS Elastic Beanstalk** service

### **2.2: Create Application**

1. Click **"Create application"** button
2. Fill in:
   - **Application name**: `debate-arena-backend`
   - **Environment name**: `production`
   - **Platform**: **Java**
   - **Platform branch**: **Corretto 17 running on 64bit Amazon Linux 2**
   - **Application code**: Choose **"Upload your code"**

### **2.3: Upload JAR File**

1. Click **"Choose File"**
2. Select: `backend/target/debate-backend-1.0.0.jar`
3. Click **"Open"**

Or use AWS CLI (if you prefer):
```bash
aws elasticbeanstalk create-application-version \
  --application-name debate-arena-backend \
  --version-label 1.0.0 \
  --source-bundle S3Bucket=my-bucket,S3Key=debate-backend-1.0.0.jar
```

---

## **STEP 3: CONFIGURE ENVIRONMENT**

### **3.1: Instance Configuration**

In the **Configuration** section:

1. **Instance type**: Select `t2.micro` (free tier)
2. **Instance subnets**: Use default
3. **Security groups**: Create new or use default
4. **Key pair**: Create or select existing (for SSH access)

### **3.2: Database Configuration**

Leave as is (we're using external Neon database, not RDS).

### **3.3: Load Balancer**

- **Type**: **Application Load Balancer**
- **Sticky sessions**: Disable (stateless API)
- **Instance port**: `8080`
- **Instance protocol**: `HTTP`

---

## **STEP 4: ENVIRONMENT VARIABLES**

### **4.1: Add Environment Variables**

In the **Environment properties** section, add all variables from your `.env` file:

| Key | Value | Source |
|-----|-------|--------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://...` | From Neon |
| `SPRING_DATASOURCE_USERNAME` | your_db_user | From Neon |
| `SPRING_DATASOURCE_PASSWORD` | your_db_password | From Neon |
| `SERVER_PORT` | `8080` | Fixed |
| `FILE_BASE_URL` | `https://your-beanstalk-url` | Beanstalk domain |
| `JWT_SECRET` | Your secret key | From `.env` |
| `JWT_EXPIRATION_MS` | `86400000` | Fixed |
| `BCRYPT_STRENGTH` | `12` | Fixed |
| `ADMIN_USERNAME` | `admin` | From `.env` |
| `ADMIN_PASSWORD` | `Admin@2026` | From `.env.example` |
| `ADMIN_EMAIL` | Your email | From `.env` |
| `ADMIN_FULL_NAME` | System Administrator | Fixed |
| `FILE_UPLOAD_DIR` | `/tmp/uploads` | For temp storage |
| `FILE_MAX_SIZE` | `10485760` | Fixed (10MB) |
| `FILE_PROVIDER` | `s3` | For AWS S3 |
| `AWS_ACCESS_KEY_ID` | Your AWS key | From IAM |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret | From IAM |
| `AWS_S3_BUCKET` | `debate-arena-uploads` | S3 bucket name |
| `AWS_REGION` | `us-east-1` | AWS region |
| `GOOGLE_CLIENT_ID` | Your Google Client ID | From Google Console |

### **4.2: Add Variables via AWS Console**

1. In Beanstalk environment page, click **"Configuration"**
2. Find **"Software"** section
3. Click **"Edit"**
4. Scroll to **"Environment properties"**
5. Add each key-value pair
6. Click **"Apply"**

Or use AWS CLI:
```bash
aws elasticbeanstalk update-environment \
  --application-name debate-arena-backend \
  --environment-name production \
  --option-settings \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=SPRING_DATASOURCE_URL,Value=jdbc:postgresql://... \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=AWS_S3_BUCKET,Value=debate-arena-uploads
```

---

## **STEP 5: CONFIGURE SECURITY**

### **5.1: Security Groups**

1. Create security group or use default
2. Inbound rules:
   - **Type**: HTTP, **Port**: 80, **Source**: 0.0.0.0/0 ✅
   - **Type**: HTTPS, **Port**: 443, **Source**: 0.0.0.0/0 ✅
   - **Type**: SSH, **Port**: 22, **Source**: Your IP (optional)

3. Outbound rules: Allow all (default)

### **5.2: Load Balancer Security**

1. HTTPS: Enable SSL/TLS certificate
   - Use AWS Certificate Manager (free)
   - Or import existing certificate

2. Redirect HTTP → HTTPS:
   - In Beanstalk config: **Listeners** section
   - Add redirect rule

---

## **STEP 6: DEPLOY APPLICATION**

### **6.1: Create Environment**

1. Review all settings
2. Click **"Create environment"**
3. Beanstalk will:
   - Provision EC2 instance
   - Configure load balancer
   - Deploy Spring Boot app
   - Set up health checks

**Expected time:** 5-10 minutes

### **6.2: Monitor Deployment**

In the environment dashboard, watch:

```
Status progression:
Creating → Ready → Processing → Updating → Ready (Live)
```

### **6.3: Deployment Logs**

To view deployment logs:
1. Click **"Logs"** in left menu
2. Click **"Request logs"**
3. Download and view

---

## **STEP 7: HEALTH CHECKS & MONITORING**

### **7.1: Configure Health Check**

1. Go to **"Configuration"** → **"Load balancer"**
2. Health check path: `/api/v1/health`
3. Healthy threshold: `3` requests
4. Unhealthy threshold: `5` requests
5. Timeout: `5` seconds
6. Interval: `30` seconds

### **7.2: Auto-Scaling Configuration**

1. Go to **"Configuration"** → **"Auto Scaling"**
2. Set:
   - **Min instances**: `1` (for free tier, keep at 1)
   - **Max instances**: `2` (scales up if needed)
   - **CPU threshold**: `70%` (scale up if CPU > 70%)

### **7.3: Monitor Logs**

In **"Monitoring"** tab:
- ✅ CPU utilization
- ✅ Network in/out
- ✅ Instance health
- ✅ Application logs

---

## **STEP 8: DATABASE CONNECTION TEST**

### **8.1: SSH into Instance (Optional)**

```bash
# Get instance ID from Beanstalk console
ssh -i your-key-pair.pem ec2-user@instance-ip

# Test database connection
nc -zv your-db-host 5432
```

### **8.2: Check Application Logs**

```bash
# On instance
tail -f /var/log/eb-activity.log
tail -f /opt/elasticbeanstalk/tasks/bundlelogs/tomcat/current.log
```

Or via AWS console: **"Logs"** → **"Request logs"** → **"Download"**

---

## **STEP 9: VERIFY BACKEND**

### **9.1: Test Health Endpoint**

```bash
curl https://your-beanstalk-url.elasticbeanstalk.com/api/v1/health
```

Expected response:
```json
{
  "status": "UP",
  "timestamp": "2026-03-12T20:00:00Z"
}
```

### **9.2: Test Topics Endpoint**

```bash
curl https://your-beanstalk-url.elasticbeanstalk.com/api/v1/topics
```

Should return list of topics (if database has data).

### **9.3: Test Admin Login**

```bash
curl -X POST \
  https://your-beanstalk-url.elasticbeanstalk.com/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2026"}'
```

Expected: JWT token in response.

---

## **STEP 10: CUSTOM DOMAIN (OPTIONAL)**

### **10.1: Configure Route 53**

1. Go to AWS **Route 53**
2. Create/select hosted zone for `debatemanch.com`
3. Create **A record**:
   - **Name**: `api.debatemanch.com`
   - **Type**: **A (IPv4 address)**
   - **Alias**: **Yes**
   - **Alias target**: Your Beanstalk load balancer
4. Click **"Create records"**

### **10.2: Add SSL Certificate**

1. Go to **Certificate Manager**
2. Request certificate for `api.debatemanch.com`
3. Verify domain ownership (via email or DNS)
4. In Beanstalk: Attach certificate to load balancer

---

## **TROUBLESHOOTING**

### **Environment Creation Fails**

**Error:** "Insufficient capacity"
- **Solution**: Try different instance type or region

**Error:** "Invalid security group"
- **Solution**: Ensure security group allows inbound on port 8080

### **App Deployed But 503 Service Unavailable**

**Check:**
1. Health checks: Are instances healthy?
2. Logs: Any exceptions in Spring Boot startup?
3. Environment variables: All set correctly?

```bash
# SSH to instance and check
tail -f /opt/elasticbeanstalk/tasks/bundlelogs/var/log/eb-engine.log
```

### **Database Connection Fails**

**Error:** "Cannot get a connection"
- **Solution**: Check `SPRING_DATASOURCE_URL` is correct
- Verify Neon database allows inbound from Beanstalk

```bash
# Check DNS resolution
nslookup your-db-host
```

### **Admin Login Fails**

**Check:**
1. `ADMIN_USERNAME` and `ADMIN_PASSWORD` match `.env`
2. Database has admin user (check logs)
3. JWT_SECRET is set

---

## **MONITORING & MAINTENANCE**

### **View Real-Time Logs**

```bash
# In Beanstalk console
Logs → Request logs → Download
```

### **View Application Metrics**

1. **Monitoring** tab shows:
   - CPU usage
   - Memory usage
   - HTTP requests per minute
   - Error rates

### **Update Application**

To deploy new version:

```bash
# 1. Build new JAR
mvn clean package

# 2. Upload new version
aws elasticbeanstalk create-application-version \
  --application-name debate-arena-backend \
  --version-label 1.0.1 \
  --source-bundle S3Bucket=my-bucket,S3Key=debate-backend-1.0.1.jar

# 3. Update environment
aws elasticbeanstalk update-environment \
  --application-name debate-arena-backend \
  --environment-name production \
  --version-label 1.0.1
```

---

## **NEXT STEPS**

1. ✅ Deploy backend to Elastic Beanstalk
2. ✅ Verify backend is running
3. ⏳ Update Amplify API_URL to Beanstalk domain
4. ⏳ Configure S3 for file storage
5. ⏳ Run verification tests

---

**Elastic Beanstalk Deployment Complete!** 🚀


