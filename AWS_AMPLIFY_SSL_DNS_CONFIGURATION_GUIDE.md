# **AWS AMPLIFY - SSL & DNS CONFIGURATION GUIDE**

**Date**: March 13, 2026  
**Issue**: "Configure these records to point your subdomains to the Amplify domain"  
**Difficulty**: Beginner-Intermediate  
**Time**: 15-30 minutes

---

## **WHAT IS THIS SCREEN?**

You're at the DNS Configuration step in Amplify. This screen is asking you to:

**"Tell your domain registrar to point your domain to Amplify"**

In plain English:
```
You own: debatemanch.com (on GoDaddy, Namecheap, etc.)
Amplify hosts: Your website (on AWS)
So you need to: Point debatemanch.com → Amplify servers
```

---

## **DO YOU EVEN NEED TO DO THIS?**

### **Option A: You DON'T have a custom domain**

If you're using the automatic Amplify domain:
```
https://main.xxxxxxxxxxxxx.amplifyapp.com
```

**Then you DON'T need to do anything on this screen!**

✅ **Just click "Skip" or back out of this step**

Your app will work fine without a custom domain.

### **Option B: You DO have a custom domain**

If you own: `debatemanch.com`

**Then you need to:**
1. Keep this screen open
2. Go to your domain registrar
3. Add DNS records (see below)
4. Come back and finish

---

## **STEP-BY-STEP: IF YOU HAVE A CUSTOM DOMAIN**

### **Step 1: What Amplify Shows You**

On the SSL configuration screen, you'll see something like:

```
Domain: debatemanch.com
Subdomain: www

Configure these records in your domain registrar:

Name (Type):          Target Value:
_xxx.debatemanch.com  _yyyy.acm-validations.aws.
```

(The actual values will be different - copy them!)

**What this means:**
- Amplify is asking your domain registrar to validate you own the domain
- Then it will issue SSL certificate

### **Step 2: Copy the DNS Records**

**On the Amplify screen:**

1. Look for each DNS record shown
2. Copy the entire record information:
   - **Name field** (the left side)
   - **Type field** (usually CNAME or ANAME)
   - **Value field** (the right side)

**Example:**
```
CNAME Record:
Name: www
Target: d123456.cloudfront.net
```

Copy all of this.

### **Step 3: Find Your Domain Registrar**

Your domain is hosted by one of these:

```
Common Registrars:
- GoDaddy (godaddy.com)
- Namecheap (namecheap.com)
- Google Domains (domains.google.com)
- Bluehost
- Network Solutions
- Route 53 (if you're already on AWS)
```

**How to find yours:**

1. Check your email - search for "domain confirmation"
2. Check your credit card statements - who did you pay?
3. Go to `whois.icann.org` and search your domain
4. It will show the registrar

### **Step 4: Login to Registrar**

**Example: GoDaddy**

1. Go to: `https://godaddy.com`
2. Click **"Sign in"** (top right)
3. Enter your email and password
4. Click **"My Products"** or **"My Domains"**
5. Find `debatemanch.com`
6. Click on it

### **Step 5: Find DNS Settings**

**In GoDaddy:**

1. Next to your domain, click **"Manage"** button
2. Look for **"DNS"** or **"DNS Records"**
3. Click on it

**In Namecheap:**

1. Next to your domain, click **"Manage"**
2. Go to **"Advanced DNS"** tab
3. Look for DNS records section

**Other registrars:**
- Look for **"DNS"**, **"DNS Management"**, or **"Advanced"** tab

### **Step 6: Add DNS Records from Amplify**

**What you'll see:**

```
Host/Name:        Type:    Value/Target:
www               CNAME    [empty field]
@                 A        [empty field]
mail              MX       [empty field]
```

**What to do:**

1. For each record Amplify showed:
   - Find the matching "Name" field
   - Click in the "Value" or "Target" field
   - Paste the value from Amplify

**Example:**

Amplify showed:
```
Name: www
Type: CNAME
Value: d123456.cloudfront.net
```

So in GoDaddy:
```
Find row: "www"
Click value field: [d123456.cloudfront.net]
```

### **Step 7: Most Important Records**

Usually Amplify needs you to add:

#### **Record 1: Root Domain (Without www)**

```
Name:   @  (or leave blank)
Type:   A or ALIAS
Value:  [Amplify's IP or domain]
```

This makes `debatemanch.com` point to Amplify.

#### **Record 2: With www**

```
Name:   www
Type:   CNAME
Value:  [Amplify domain]
```

This makes `www.debatemanch.com` point to Amplify.

#### **Record 3: SSL Certificate Validation**

```
Name:   _xxx.debatemanch.com
Type:   CNAME
Value:  _yyy.acm-validations.aws.
```

This validates you own the domain (for SSL certificate).

### **Step 8: Save Changes**

In your registrar:

1. After adding each record
2. Click **"Save"** button
3. Wait for message: "Changes saved"

**⚠️ WARNING**: DNS changes take 15 minutes to 24 hours to propagate!

### **Step 9: Back to Amplify**

1. Go back to Amplify screen
2. You might see a button: **"Verify"** or **"Check status"**
3. Click it

**Amplify will check** if DNS records are correctly pointing.

### **Step 10: Wait for Verification**

```
Status: Validating DNS records...
       ↓ (wait 5 minutes)
Status: Verified! ✅
       ↓
SSL Certificate issued ✅
```

---

## **WHAT IF YOU DON'T HAVE A CUSTOM DOMAIN?**

If you're using the auto-generated Amplify domain:

```
https://main.xxxxxxxxxxxxx.amplifyapp.com
```

**You can:**

✅ **Option 1: Skip this step**
- Click "Skip" button
- Your app will still work fine
- SSL is automatic (already enabled)

✅ **Option 2: Just close this dialog**
- Click X or back button
- Come back later if you buy a domain

---

## **TROUBLESHOOTING**

### **Problem: "Where is the Skip button?"**

**Solution:**
- Look at top of screen
- Or look for "X" button to close
- Or scroll down for "Skip" or "I'll configure this later"

### **Problem: "I can't find my registrar"**

**Check:**
1. Look at domain confirmation email
2. Check credit card statement
3. Go to `whois.icann.org` and search domain
4. It will show registrar name

### **Problem: "SSL shows as Validating but never completes"**

**Wait:**
- DNS changes can take up to 24 hours
- Check back tomorrow
- In the meantime, your Amplify domain works: `https://main.xxx.amplifyapp.com`

### **Problem: "DNS records I added are not appearing"**

**Wait:**
- Registrar changes take 15-60 minutes to show
- Amplify validation takes another 5-15 minutes
- Be patient!

### **Problem: "Amplify says 'Verification failed'"**

**Check:**
1. Did you copy the value correctly?
2. Is there extra spaces before/after?
3. Did you select the correct "Type" (CNAME vs A vs ALIAS)?
4. Try deleting and re-adding the record

---

## **IF YOU WANT TO SKIP THIS COMPLETELY**

**Your options:**

### **Option 1: Use Amplify's automatic domain**
```
Your site will be:
https://main.xxxxxxxxxxxxx.amplifyapp.com

Works perfectly fine!
This is what most developers use for testing.
```

### **Option 2: Use AWS Route 53 (Advanced)**
```
If you want your domain but not registrar hassle:
1. Transfer domain to AWS Route 53
2. Amplify can auto-configure DNS
3. Automatic SSL certificate
```

### **Option 3: Skip for now**
```
Setup your custom domain later.
For now, use Amplify's domain.
Your app will work fine!
```

---

## **QUICK DECISION TREE**

```
Do you have a custom domain (debatemanch.com)?

  NO → Click "Skip" or close this dialog
       Your app works with: https://main.xxx.amplifyapp.com
       ✅ Done!

  YES → Follow Steps 1-10 above
        Configure DNS at your registrar
        Wait for verification
        ✅ Your custom domain works!
```

---

## **WHAT YOUR FINAL RESULT WILL BE**

### **Without Custom Domain**
```
Your app accessible at:
https://main.xxxxxxxxxxxxx.amplifyapp.com

✅ Free domain (provided by Amplify)
✅ Automatic HTTPS/SSL
✅ Works everywhere
✅ Perfect for development/testing
```

### **With Custom Domain**
```
Your app accessible at:
https://www.debatemanch.com
https://debatemanch.com

✅ Professional domain
✅ Automatic HTTPS/SSL
✅ Points to Amplify
✅ Perfect for production
```

---

## **SUMMARY**

**If you DON'T have a custom domain:**
→ Click "Skip" - DONE! Your app works.

**If you DO have a custom domain:**
→ Follow steps 1-10 to add DNS records
→ Wait for verification
→ Your custom domain will work!

**Either way:** Your app is LIVE and accessible! ✅

---

## **HELPFUL LINKS**

**Common Registrars:**
- GoDaddy DNS Help: https://www.godaddy.com/help
- Namecheap DNS Help: https://www.namecheap.com/support/
- Google Domains Help: https://support.google.com/domains/
- AWS Route 53: https://console.aws.amazon.com/route53/

**Amplify Docs:**
- Amplify Domain Setup: https://docs.aws.amazon.com/amplify/latest/userguide/custom-domain.html

---

**You've got this! Either skip and move on, or configure your domain.** ✅


