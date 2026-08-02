# **AWS S3 - FILE STORAGE DEPLOYMENT GUIDE**

**Date**: March 12, 2026  
**Project**: TarkVtark Debate Arena  
**Status**: Ready for S3 Configuration

---

## **PREREQUISITES**

- ✅ AWS Account created
- ✅ IAM user with S3 permissions
- ✅ Backend already has S3 SDK code (from earlier updates)

---

## **STEP 1: CREATE S3 BUCKET**

### **1.1: Open AWS S3 Console**

1. Go to: `https://console.aws.amazon.com/s3`
2. Click **"Create bucket"**

### **1.2: Bucket Settings**

**General Configuration:**

| Setting | Value |
|---------|-------|
| Bucket name | `debate-arena-uploads` |
| Region | `us-east-1` |
| Versioning | Disabled |
| Server-side encryption | Enabled (SSE-S3) |

### **1.3: Create Bucket**

Fill in:
- **Bucket name**: `debate-arena-uploads`
- **Region**: `us-east-1` (must match Beanstalk region)
- **Block Public Access settings**: Keep default (Block all) ✅

Click **"Create bucket"**

---

## **STEP 2: CONFIGURE BUCKET POLICY**

### **2.1: Add Bucket Policy**

1. Go to **"Permissions"** tab
2. Click **"Bucket policy"** (edit)
3. Paste this policy (replace YOUR-ACCOUNT-ID):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowBeanstalkAccess",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:role/aws-elasticbeanstalk-ec2-role"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::debate-arena-uploads/*"
        },
        {
            "Sid": "AllowListBucket",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:role/aws-elasticbeanstalk-ec2-role"
            },
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::debate-arena-uploads"
        }
    ]
}
```

### **2.2: Enable CORS**

1. Go to **"Permissions"** tab
2. Click **"CORS"** (edit)
3. Paste:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
```

Click **"Save"**

---

## **STEP 3: CREATE IAM USER & ACCESS KEYS**

### **3.1: Create S3-Only IAM User**

1. Go to **IAM** console
2. Click **"Users"** → **"Create user"**
3. Name: `debate-arena-s3-user`
4. Click **"Create user"**

### **3.2: Add S3 Permissions**

1. Click on user **"debate-arena-s3-user"**
2. Click **"Add permissions"** → **"Attach policies directly"**
3. Search: `AmazonS3FullAccess`
4. Check the box
5. Click **"Attach policies"**

Or create custom policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::debate-arena-uploads",
                "arn:aws:s3:::debate-arena-uploads/*"
            ]
        }
    ]
}
```

### **3.3: Generate Access Keys**

1. Click on user
2. Go to **"Security credentials"** tab
3. Click **"Create access key"**
4. Select **"Application running outside AWS"**
5. Click **"Create access key"**

**Copy and save:**
```
Access Key ID:      AKIAIOSFODNN7EXAMPLE
Secret Access Key:  wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

⚠️ **Save these securely!** You won't see the secret key again.

---

## **STEP 4: CONFIGURE BACKEND FOR S3**

### **4.1: Backend Already Has S3 Code**

The backend code has already been updated to support S3 (from earlier updates). The code uses environment variables to configure S3.

### **4.2: Verify Backend Code**

Check that `FileUploadController.java` has S3 configuration:

```bash
grep -n "FILE_PROVIDER\|AWS_S3\|S3FileStorageService" backend/src/main/java/com/debatearena/controller/FileUploadController.java
```

Should show references to S3 configuration.

### **4.3: Environment Variables for S3**

These need to be set in Beanstalk (from previous guide):

```
FILE_PROVIDER=s3
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=debate-arena-uploads
AWS_REGION=us-east-1
FILE_BASE_URL=https://debate-arena-uploads.s3.amazonaws.com
```

---

## **STEP 5: DEPLOY UPDATED BACKEND**

### **5.1: Rebuild Backend**

```bash
cd /mnt/d/temp/tarkVtark.com/backend
mvn clean package -DskipTests
```

### **5.2: Deploy to Beanstalk**

Option A: Via AWS Console
1. Go to Beanstalk
2. Click **"Upload and deploy"**
3. Select `debate-backend-1.0.0.jar`
4. Click **"Deploy"**

Option B: Via AWS CLI
```bash
aws elasticbeanstalk create-application-version \
  --application-name debate-arena-backend \
  --version-label 1.0.0-s3 \
  --source-bundle S3Bucket=your-bucket,S3Key=debate-backend-1.0.0.jar

aws elasticbeanstalk update-environment \
  --application-name debate-arena-backend \
  --environment-name production \
  --version-label 1.0.0-s3
```

---

## **STEP 6: SET ENVIRONMENT VARIABLES IN BEANSTALK**

### **6.1: Update Beanstalk Environment**

1. Go to Beanstalk console
2. Click **"Configuration"** → **"Software"** → **"Edit"**
3. Find **"Environment properties"**
4. Add these variables:

| Key | Value |
|-----|-------|
| `FILE_PROVIDER` | `s3` |
| `AWS_ACCESS_KEY_ID` | `AKIA...` (from Step 3) |
| `AWS_SECRET_ACCESS_KEY` | `wJal...` (from Step 3) |
| `AWS_S3_BUCKET` | `debate-arena-uploads` |
| `AWS_REGION` | `us-east-1` |
| `FILE_BASE_URL` | `https://debate-arena-uploads.s3.amazonaws.com` |

5. Click **"Apply"**

### **6.2: Verify Environment Variables**

Once deployed, SSH into instance and verify:

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@instance-ip

# Check environment
env | grep AWS
env | grep FILE
```

---

## **STEP 7: TEST S3 UPLOAD**

### **7.1: Test via Frontend**

1. Open deployed app: `https://your-amplify-url`
2. Create a new debate or question
3. Try to upload an attachment
4. Expected: File uploads successfully

### **7.2: Verify File in S3**

1. Go to S3 console
2. Click on `debate-arena-uploads` bucket
3. Check **"Objects"** tab
4. You should see uploaded file(s)

### **7.3: Test File Download**

1. Back on frontend, click the uploaded file
2. Expected: File downloads from S3 URL

---

## **STEP 8: CONFIGURE VERSIONING & LIFECYCLE (OPTIONAL)**

### **8.1: Enable Versioning**

1. S3 bucket → **"Properties"**
2. **"Versioning"** section → **"Edit"**
3. Select **"Enable"**
4. Click **"Save changes"**

Benefits:
- Can recover deleted files
- Maintains file history

### **8.2: Lifecycle Policy**

Clean up old files automatically:

1. **"Management"** tab
2. **"Lifecycle policies"** → **"Create lifecycle rule"**
3. **Rule name**: `delete-old-uploads`
4. **Scope**: Apply to entire bucket
5. **Expiration**: Delete after 90 days
6. Click **"Create rule"**

---

## **STEP 9: MONITOR S3**

### **9.1: Check Bucket Size**

1. S3 → `debate-arena-uploads` → **"Metrics"**
2. View:
   - Total size
   - Number of objects
   - Data transfer

### **9.2: Track Costs**

1. AWS Billing console
2. View estimated charges for S3
3. Should be minimal for your usage (<5GB)

---

## **TROUBLESHOOTING**

### **Upload Fails: "Access Denied"**

**Check:**
1. IAM user has S3 permissions
2. Access keys are correct in Beanstalk env vars
3. Bucket policy allows EC2 role access

```bash
# SSH to instance and test
aws s3 ls s3://debate-arena-uploads/ --region us-east-1
```

### **Upload Fails: "Bucket does not exist"**

**Check:**
1. Bucket name spelled correctly
2. Bucket in correct region
3. `AWS_S3_BUCKET` env var is set

### **File Cannot Be Downloaded**

**Check:**
1. File exists in S3 console
2. Bucket CORS policy is configured
3. `FILE_BASE_URL` points to correct S3 bucket

### **High AWS Bill from S3**

**Common causes:**
1. Unlimited versioning (disable or set lifecycle)
2. Large files (set `FILE_MAX_SIZE` limit)
3. Excessive transfers (check CloudFront caching)

---

## **SECURITY BEST PRACTICES**

### **1. Use Separate IAM User**

✅ Created `debate-arena-s3-user` with limited S3 access only

### **2. Encrypt Data**

✅ S3 Server-Side Encryption (SSE-S3) enabled by default

### **3. Block Public Access**

✅ Bucket policy prevents direct public access
- Only Beanstalk EC2 role can access

### **4. Rotate Access Keys**

Every 90 days:
```bash
# 1. Create new access keys
# 2. Update Beanstalk env vars with new keys
# 3. Deactivate old keys in IAM
# 4. Delete after 7 days
```

### **5. Enable Logging**

```json
{
    "Rules": [
        {
            "Action": [
                "LOG"
            ],
            "Effect": "Allow",
            "Resource": "arn:aws:s3:::debate-arena-uploads-logs/*",
            "Principal": {
                "Service": "logging.s3.amazonaws.com"
            }
        }
    ]
}
```

---

## **REFERENCE**

**S3 Bucket URLs:**

Direct file access:
```
https://debate-arena-uploads.s3.amazonaws.com/filename.jpg
```

Regional endpoint:
```
https://s3.us-east-1.amazonaws.com/debate-arena-uploads/filename.jpg
```

CloudFront (if enabled):
```
https://d123456.cloudfront.net/filename.jpg
```

---

## **NEXT STEPS**

1. ✅ Create S3 bucket
2. ✅ Configure bucket policy
3. ✅ Create IAM user with access keys
4. ✅ Update Beanstalk environment variables
5. ✅ Deploy backend
6. ✅ Test file upload/download
7. ⏳ Run verification tests

---

**S3 Configuration Complete!** 🚀


