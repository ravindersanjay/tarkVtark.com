# **AWS S3 - DETAILED BEGINNER'S GUIDE (2026 UI)**

**Date**: March 13, 2026  
**Difficulty**: Beginner  
**Time**: 20-30 minutes

---

## **BEFORE YOU START**

✅ AWS account created and logged in  
✅ You have admin access to the account  
✅ You know your AWS Region (we'll use `us-east-1`)

---

## **PART 1: CREATE S3 BUCKET**

### **Step 1.1: Go to S3 Service**

1. Go to: `https://console.aws.amazon.com`
2. In the search bar at the top, type: `S3`
3. Click on **S3** (shown as "Simple Storage Service")
4. You'll see the S3 Dashboard

**What you should see:**
- A section that says "Buckets"
- A button that says **"Create bucket"** (orange/red button)

### **Step 1.2: Click Create Bucket**

1. Click the **"Create bucket"** button (top right of the page)
2. You'll see a form with fields to fill

### **Step 1.3: Fill Bucket Details**

**Field 1: Bucket name**
```
Enter exactly: debate-arena-uploads
```
⚠️ **IMPORTANT**: 
- Must be unique across ALL of AWS
- Only lowercase letters, numbers, and hyphens
- No spaces
- Must be 3-63 characters

**Field 2: AWS Region**
```
Select: us-east-1
```
**Why?** Same region as your backend (Elastic Beanstalk)

**Field 3: Block Public Access**
Leave all CHECKED ✓ (This is secure by default)

**Visual Guide:**
```
Bucket name:
┌─────────────────────────────────┐
│ debate-arena-uploads            │
└─────────────────────────────────┘

AWS Region:
┌─────────────────────────────────┐
│ us-east-1                       │ (dropdown)
└─────────────────────────────────┘

Block Public Access settings:
☑ Block all public access
☑ Block public access to ACLs
☑ Block public access to bucket policies
☑ Ignore public ACLs on this bucket
☑ Restrict public bucket policies
```

### **Step 1.4: Create the Bucket**

1. Scroll down to the bottom of the form
2. Click the **"Create bucket"** button
3. Wait 5-10 seconds
4. You should see a green checkmark: "Successfully created bucket 'debate-arena-uploads'"

**What happens next:**
- You'll be taken to your new bucket's page
- The bucket name will be shown at the top

---

## **PART 2: CONFIGURE BUCKET SETTINGS**

### **Step 2.1: Open Your Bucket**

1. You should already be on the bucket page after creation
2. If not, go to S3 service and click on `debate-arena-uploads`

**What you should see:**
- Bucket name at the top: `debate-arena-uploads`
- Tabs: "Objects" | "Properties" | "Permissions" | "Metrics" etc.

### **Step 2.2: Configure Encryption (Security)**

1. Click on the **"Properties"** tab
2. Scroll down to find: **"Default encryption"**
3. Click the **"Edit"** button next to it

**Configuration:**
```
Encryption type: 
☑ Server-side encryption (SSE-S3)

☐ Server-side encryption (SSE-KMS) - Don't check this
```

4. Click **"Save changes"** button
5. Wait for green success message

### **Step 2.3: Configure CORS (For Frontend Access)**

CORS allows your React frontend to access files from S3.

1. Go back to S3 Buckets list (click "Buckets" in navigation)
2. Click on your bucket: `debate-arena-uploads`
3. Click the **"Permissions"** tab
4. Scroll down to find: **"Cross-origin resource sharing (CORS)"**
5. Click **"Edit"** button

**Copy and paste this CORS Policy:**

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

6. Click **"Save changes"**
7. Wait for green success message

**What this does:**
- Allows your frontend to upload/download files
- The `*` means any origin (we'll restrict this later in production)

---

## **PART 3: CREATE IAM USER FOR S3 ACCESS**

IAM User = A special user account with S3 permissions only

### **Step 3.1: Go to IAM Service**

1. Search for: `IAM` at the top of AWS Console
2. Click on **"Identity and Access Management (IAM)"**
3. You'll see the IAM Dashboard

**Left sidebar menu:**
- Dashboard
- Users
- Groups
- Roles
- Policies
- (more options)

### **Step 3.2: Create New User**

1. Click on **"Users"** in the left sidebar
2. Click the **"Create user"** button (top right)
3. Fill in:

**User name:**
```
debate-arena-s3-user
```

**Console password (optional):**
- Leave unchecked (we don't need console access)

4. Click **"Next"** button

### **Step 3.3: Add Permissions to User**

**Page shows: "Set permissions"**

1. Select: **"Attach policies directly"** (default)
2. In the "Permissions policies" search box, type: `S3`
3. Find and CHECK: **"AmazonS3FullAccess"**
   - This policy allows all S3 actions

**What you should see:**
```
☑ AmazonS3FullAccess
  Allows: Full access to all S3 buckets and objects
```

4. Click **"Next"** button

### **Step 3.4: Review and Create**

1. Review page shows:
   - User name: `debate-arena-s3-user`
   - Permissions: `AmazonS3FullAccess`

2. Click **"Create user"** button
3. Wait for success message

### **Step 3.5: Generate Access Keys**

**Now you need to generate credentials that your backend will use.**

1. On the success page, click on the user name: `debate-arena-s3-user`
2. You're now on the user's details page
3. Click on the **"Security credentials"** tab
4. Scroll to: **"Access keys"** section
5. Click **"Create access key"** button

**Choose access key type:**
```
☑ Application running outside AWS
☐ Application running on an AWS compute service
☐ Command Line Interface (CLI)
```
(First option is already selected - that's correct)

6. Click **"Next"** button
7. Add optional description: `S3 access for debate-arena-backend`
8. Click **"Create access key"** button

**⚠️ IMPORTANT: SAVE THESE KEYS NOW!**

You'll see a page with:
```
Access Key ID:     AKIA... (looks like: AKIA1234567890ABCDEF)
Secret Access Key: wJal... (long string)
```

**You MUST save these immediately:**

Option 1: Click **"Download .csv file"** button (BEST)
- This downloads credentials file
- Save it somewhere safe

Option 2: Copy and paste
```
Access Key ID:      [COPY THIS]
Secret Access Key:  [COPY THIS]
```

**⚠️ After you leave this page, you CANNOT see the Secret Access Key again!**

9. Click **"I have saved my access key ID and secret access key"** checkbox
10. Click **"Done"** button

---

## **PART 4: UPDATE YOUR BACKEND .ENV FILE**

Now you have the credentials. Update your backend to use them.

### **Step 4.1: Edit Backend .env File**

**File location:**
```
backend/.env
```

**Find these lines and update them:**

```env
# Before:
FILE_PROVIDER=local
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=debate-arena-uploads
AWS_REGION=us-east-1
AWS_S3_BASE_URL=https://s3.amazonaws.com

# After (update with your credentials):
FILE_PROVIDER=s3
AWS_ACCESS_KEY_ID=AKIA1234567890ABCDEF
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=debate-arena-uploads
AWS_REGION=us-east-1
AWS_S3_BASE_URL=https://s3.amazonaws.com
```

**Replace:**
- `AKIA1234567890ABCDEF` with your actual Access Key ID
- `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` with your actual Secret Access Key

### **Step 4.2: Save the File**

1. Save the `.env` file
2. Do NOT commit to Git (it's already in .gitignore)

---

## **PART 5: TEST LOCALLY (OPTIONAL)**

### **Step 5.1: Restart Backend**

```bash
# Stop current backend (Ctrl+C)
# Then restart:
cd backend
mvn clean compile
mvn spring-boot:run
```

### **Step 5.2: Test File Upload**

1. Go to frontend: `http://localhost:5173`
2. Create a new debate/question
3. Try uploading a file
4. Check if it uploads successfully

### **Step 5.3: Verify File in S3**

1. Go to AWS S3 console
2. Click on bucket: `debate-arena-uploads`
3. Click on **"Objects"** tab
4. You should see your uploaded file!

---

## **VERIFICATION CHECKLIST**

- [ ] S3 bucket created: `debate-arena-uploads`
- [ ] Bucket in region: `us-east-1`
- [ ] Encryption enabled: SSE-S3
- [ ] CORS configured: ✓
- [ ] IAM user created: `debate-arena-s3-user`
- [ ] Access keys generated and saved
- [ ] Backend .env updated with credentials
- [ ] (Optional) Local file upload test passed
- [ ] Files appear in S3 bucket

---

## **TROUBLESHOOTING**

### **Problem: "Access Denied" when uploading**

**Check:**
1. Access Key ID is correct (copy from CSV file)
2. Secret Access Key is correct (copy from CSV file)
3. IAM user has `AmazonS3FullAccess` policy
4. `.env` file is reloaded (restart backend)

### **Problem: Bucket name not available**

**Solution:**
- Bucket names must be globally unique
- Try: `debate-arena-uploads-<random-numbers>`
- Example: `debate-arena-uploads-20260313`

### **Problem: File uploads but don't appear in S3**

**Check:**
1. Are you looking in the right bucket?
2. Are you looking in the right AWS region?
3. Wait 10 seconds - sometimes there's a delay
4. Refresh the page (F5)

### **Problem: Can't see files I uploaded before**

**Check:**
1. Are files in `Objects` tab?
2. Click **"Refresh"** button (top right)
3. Check if bucket has versioning enabled

---

## **NEXT STEPS**

✅ S3 bucket created  
✅ Credentials generated  
✅ Backend configured  

**Next:**
1. Deploy backend to Elastic Beanstalk
2. Deploy frontend to Amplify
3. Update Beanstalk environment variables with AWS credentials

---

## **HELPFUL LINKS**

- S3 Console: https://s3.console.aws.amazon.com/
- IAM Console: https://console.aws.amazon.com/iam/
- AWS S3 Documentation: https://docs.aws.amazon.com/s3/

---

**S3 Setup Complete!** ✅


