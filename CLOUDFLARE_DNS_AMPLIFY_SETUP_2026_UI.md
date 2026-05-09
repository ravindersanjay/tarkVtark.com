# **CLOUDFLARE DNS CONFIGURATION FOR AWS AMPLIFY - 2026 UI GUIDE**

**Date**: March 13, 2026  
**Domain**: debatemanch.com (on Cloudflare)  
**Target**: AWS Amplify  
**Difficulty**: Beginner  
**Time**: 10-15 minutes

---

## **WHAT WE'RE DOING**

You own: `debatemanch.com` on Cloudflare  
You deployed: Your app on AWS Amplify  

**Goal:** Make `debatemanch.com` point to your Amplify app

---

## **STEP-BY-STEP: CLOUDFLARE DNS SETUP**

### **Step 1: Login to Cloudflare**

1. Go to: `https://dash.cloudflare.com/login`
2. Enter your **Cloudflare email**
3. Enter your **Cloudflare password**
4. Click **"Sign in"** button
5. If asked for 2FA (Two-Factor Authentication), complete it

**You'll see the Cloudflare Dashboard**

---

### **Step 2: Select Your Domain**

**On the Cloudflare Dashboard:**

1. Look at the left sidebar or main area
2. You should see a list of your domains
3. Find: **`debatemanch.com`**
4. Click on it

**You're now in the domain settings**

---

### **Step 3: Go to DNS Records**

**In Cloudflare dashboard:**

1. Look at the **left sidebar** (or tabs at top)
2. Click on **"DNS"** section
3. You should see: **"DNS Records"** or **"DNS Management"**

**What you'll see:**

```
DNS Records for debatemanch.com

Type | Name | Content | TTL | Proxy Status
────────────────────────────────────────────
A    | @    | 192...  | Auto| Proxied
CNAME| www  | example | Auto| Proxied
```

---

### **Step 4: Note Your Amplify Domain**

Before adding records, you need your Amplify domain.

**From your Amplify deployment:**

Get this URL:
```
https://main.xxxxxxxxxxxxx.amplifyapp.com
```

The part you need: `main.xxxxxxxxxxxxx.amplifyapp.com`

**Copy and keep it handy!**

---

### **Step 5: Add First Record - www Subdomain**

**In Cloudflare DNS Records:**

1. Click **"+ Add record"** button (top right of records table)

**Fill in the form:**

```
Type:     CNAME
Name:     www
Content:  main.xxxxxxxxxxxxx.amplifyapp.com
TTL:      Auto
Proxy:    ☐ Uncheck "Proxied" (leave as DNS only)
```

**Detailed steps:**

**Field 1: Type**
- Click dropdown showing "A"
- Select: **CNAME**

**Field 2: Name**
- Type: `www`
- This creates: `www.debatemanch.com`

**Field 3: Content (or Target)**
- Type: `main.xxxxxxxxxxxxx.amplifyapp.com`
- (Use YOUR actual Amplify domain)

**Field 4: TTL**
- Leave as: **Auto** (default)

**Field 5: Proxy Status**
- You'll see a toggle button
- Make sure it's: **"DNS only"** (not proxied for Amplify)
- Click to toggle if needed
- Should show: ⚪ DNS only (gray icon)

**Then click:** **"Save"** button

**Expected result:**
```
✅ Record added
www  CNAME  main.xxxxxxxxxxxxx.amplifyapp.com  DNS only
```

---

### **Step 6: Add Second Record - Root Domain (@ or blank)**

This makes `debatemanch.com` (without www) point to Amplify.

**Click:** **"+ Add record"** button again

**Fill in the form:**

```
Type:     CNAME
Name:     @ (or leave blank)
Content:  main.xxxxxxxxxxxxx.amplifyapp.com
TTL:      Auto
Proxy:    ☐ DNS only (not proxied)
```

**Detailed steps:**

**Field 1: Type**
- Click dropdown
- Select: **CNAME**

**Field 2: Name**
- Leave blank OR type: `@`
- This represents root domain: `debatemanch.com`

**Field 3: Content**
- Type: `main.xxxxxxxxxxxxx.amplifyapp.com`

**Field 4: TTL**
- Leave as: **Auto**

**Field 5: Proxy Status**
- Make sure: **"DNS only"** (toggle to gray)

**Then click:** **"Save"** button

**Expected result:**
```
✅ Record added
@   CNAME  main.xxxxxxxxxxxxx.amplifyapp.com  DNS only
```

---

### **Step 7: Add Third Record - SSL Certificate Validation**

Amplify needs to validate you own the domain for SSL.

⚠️ **IMPORTANT:** This record is different for each setup. **You must get this from Amplify.**

**How to find it:**

1. Go back to **AWS Amplify Console**
2. Look for the **Domain Management** or **SSL Certificate** section
3. Look for a record that looks like:

```
Name: _abc123.debatemanch.com
Type: CNAME
Value: _xyz789.acm-validations.aws.
```

**In Cloudflare, add this record:**

1. Click **"+ Add record"** button

**Fill in:**

```
Type:     CNAME
Name:     _abc123 (or the full _abc123.debatemanch.com)
Content:  _xyz789.acm-validations.aws.
TTL:      Auto
Proxy:    ☐ DNS only
```

**Steps:**

**Field 1: Type**
- Select: **CNAME**

**Field 2: Name**
- Type: `_abc123`
- Or copy exact name from Amplify

**Field 3: Content**
- Copy exact value from Amplify
- Example: `_xyz789.acm-validations.aws.`

**Field 4: TTL**
- Leave: **Auto**

**Field 5: Proxy**
- Ensure: **DNS only**

**Click:** **"Save"**

---

### **Step 8: Verify All Records Added**

**In Cloudflare DNS Records table, you should now see:**

```
Type | Name                      | Content                              | Proxy
─────────────────────────────────────────────────────────────────────────────
CNAME| www                       | main.xxxxxxxxxxxxx.amplifyapp.com   | DNS only
CNAME| @                         | main.xxxxxxxxxxxxx.amplifyapp.com   | DNS only
CNAME| _abc123 (or full name)    | _xyz789.acm-validations.aws.       | DNS only
```

**All 3 records should be there ✅**

---

### **Step 9: Wait for DNS Propagation**

**After adding records:**

1. **Wait 5-15 minutes** for DNS to propagate globally
2. You'll see status change in Cloudflare
3. Amplify will validate the domain automatically

**In Cloudflare, you might see:**

```
Status: Pending
       ↓ (wait 5-10 min)
Status: Active
```

---

### **Step 10: Go Back to Amplify and Verify**

**In AWS Amplify Console:**

1. Go to your app domain management section
2. Look for a **"Verify"** or **"Check status"** button
3. Click it

**Amplify will check if DNS is configured correctly:**

```
Status: Validating...
       ↓ (wait 2-5 min)
Status: Active ✅
       ↓
SSL Certificate: Issued ✅
```

**Once verified:**
- Your custom domain is linked to Amplify
- SSL certificate is automatically issued
- Your app is accessible at: `https://www.debatemanch.com`

---

## **VISUAL CLOUDFLARE UI WALKTHROUGH**

### **Cloudflare Dashboard Location**

```
┌─ https://dash.cloudflare.com ────────────────────────────┐
│                                                            │
│  Cloudflare Logo       Search    Profile                  │
│  ├─ Home                                                   │
│  ├─ Websites                                               │
│  │  └─ debatemanch.com ← Click here                       │
│  ├─ DNS ← Click here for DNS Records                      │
│  ├─ SSL/TLS                                                │
│  ├─ Caching                                                │
│  └─ More...                                                │
│                                                            │
│  Main Area:                                                │
│  ┌─ DNS Records ────────────────────────────────────────┐ │
│  │ + Add record  (button)                                │ │
│  │                                                        │ │
│  │ Type  Name    Content                 TTL   Proxy    │ │
│  │ CNAME www     main.xxx.amplifyapp... Auto  DNS only  │ │
│  │ CNAME @       main.xxx.amplifyapp... Auto  DNS only  │ │
│  │ CNAME _abc123 _xyz789.acm-validat... Auto  DNS only  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## **WHAT EACH RECORD DOES**

### **Record 1: www Subdomain**
```
www.debatemanch.com → main.xxxxxxxxxxxxx.amplifyapp.com
                      ↓
                    Your Amplify app
```
Users accessing `www.debatemanch.com` see your app

### **Record 2: Root Domain**
```
debatemanch.com → main.xxxxxxxxxxxxx.amplifyapp.com
                  ↓
                Your Amplify app
```
Users accessing `debatemanch.com` (without www) see your app

### **Record 3: SSL Validation**
```
_abc123.debatemanch.com → _xyz789.acm-validations.aws.
                           ↓
                        AWS validates ownership
                           ↓
                        Issues SSL certificate
```
AWS validates you own the domain and issues SSL cert

---

## **PROXY STATUS EXPLAINED**

### **What is "Proxied" vs "DNS only"?**

**DNS only** (Recommended for Amplify):
```
Your browser → Cloudflare DNS lookup → Amplify servers
              (Just translates domain to IP)
```

**Proxied** (Cloudflare proxy):
```
Your browser → Cloudflare servers → Amplify servers
              (Cloudflare acts as middle layer)
              - Slower for Amplify
              - Can cause issues
```

**For Amplify:** Always use **DNS only** ✅

---

## **TROUBLESHOOTING**

### **Problem: "DNS record says 'CNAME error'"**

**Cause:** You tried to add CNAME to @ but Cloudflare only allows CNAME on subdomains

**Solution:**
1. For root domain (@), Cloudflare might require ANAME or ALIAS
2. In Cloudflare, it might auto-convert CNAME to ANAME
3. This is normal - just save it

### **Problem: "Amplify says 'DNS not configured'"**

**Check:**
1. Did you copy the Amplify domain correctly?
2. Are all 3 records added?
3. Is Proxy Status: "DNS only"?
4. Wait 10-15 minutes for DNS propagation

**Fix:**
1. Verify each record in Cloudflare
2. Double-check the content/target field
3. Wait longer and try again

### **Problem: "SSL Certificate stuck at 'Validating'"**

**Cause:** DNS validation record not found

**Check:**
1. Is the CNAME validation record correct?
2. Exact copy from Amplify?
3. Wait 5-10 minutes

**Fix:**
1. Go back to Amplify
2. Check if they show the exact validation record needed
3. Re-add it in Cloudflare if incorrect

### **Problem: "Site shows Cloudflare error page"**

**Check:**
1. Did you set Proxy to "DNS only"?
2. Are you using "Proxied" by accident?

**Fix:**
1. Go to Cloudflare DNS records
2. Click each record
3. Toggle Proxy to: **"DNS only"** (gray icon)
4. Save

### **Problem: "HTTPS shows error/certificate issue"**

**Cause:** SSL validation still processing

**Solution:**
1. Wait 30 minutes total from when you added records
2. Hard refresh browser: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. Try again in 30 minutes if still failing

---

## **STEP-BY-STEP SUMMARY**

```
✅ 1. Login to Cloudflare (dash.cloudflare.com)
✅ 2. Select domain: debatemanch.com
✅ 3. Go to DNS section
✅ 4. Add Record 1: CNAME www → main.xxxxxxxxxxxxx.amplifyapp.com
✅ 5. Add Record 2: CNAME @ → main.xxxxxxxxxxxxx.amplifyapp.com
✅ 6. Add Record 3: CNAME _abc123 → _xyz789.acm-validations.aws.
✅ 7. Ensure all records: DNS only (not proxied)
✅ 8. Wait 10-15 minutes
✅ 9. Go to Amplify and verify
✅ 10. SSL certificate issued automatically
✅ 11. Your app accessible at: https://www.debatemanch.com ✅
```

---

## **AFTER SETUP WORKS**

### **Test Your Domain**

1. Open: `https://www.debatemanch.com`
2. Should show: Your app (same as Amplify URL)
3. Should have: Green lock icon 🔒 (HTTPS/SSL working)
4. No errors or warnings

### **Test Without www**

1. Open: `https://debatemanch.com`
2. Should also work (redirects to www or shows app)

### **Check SSL Certificate**

1. Click lock icon 🔒 in browser
2. Should show: Valid certificate for debatemanch.com
3. Should show: AWS Certificate Manager issued it

---

## **CLOUDFLARE TIPS**

### **Tip 1: DNS Propagation Takes Time**

```
Added record → 5 min (appears in Cloudflare)
             → 5-10 min (global DNS servers update)
             → 5 min (Amplify validates)
─────────────────────────
Total: 15-25 minutes
```

Be patient!

### **Tip 2: Always Use "DNS only" for Amplify**

Cloudflare proxying adds latency for Amplify apps. Always set to "DNS only".

### **Tip 3: TTL = Time to Live**

```
TTL: Auto (Cloudflare decides)
TTL: 5 min (changes propagate quickly)
TTL: 1 hour (changes take longer)
```

Use "Auto" - Cloudflare will optimize.

### **Tip 4: Clear Browser Cache**

If changes don't appear immediately:

```
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

This does a hard refresh.

---

## **FINAL CHECKLIST**

- [ ] Logged into Cloudflare
- [ ] Selected domain: debatemanch.com
- [ ] Went to DNS section
- [ ] Added 3 CNAME records (www, @, validation)
- [ ] All records set to: "DNS only"
- [ ] Waited 10-15 minutes
- [ ] Went to Amplify and clicked verify
- [ ] Amplify shows: Status "Active" ✅
- [ ] SSL Certificate shows: "Issued" ✅
- [ ] Tested domain in browser
- [ ] Saw green lock 🔒 (HTTPS working)
- [ ] App displays correctly at: https://www.debatemanch.com

---

## **YOUR CUSTOM DOMAIN IS NOW LIVE!**

```
✅ debatemanch.com → Your Amplify app
✅ www.debatemanch.com → Your Amplify app
✅ HTTPS/SSL → Automatic and active
✅ Professional domain ready for production
```

**Users can now access your app at your custom domain!** 🎉

---

## **HELPFUL CLOUDFLARE LINKS**

- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **DNS Management**: https://dash.cloudflare.com/[account-id]/debatemanch.com/dns/records
- **Cloudflare Docs**: https://developers.cloudflare.com/dns/
- **CNAME Records**: https://developers.cloudflare.com/dns/manage-dns-records/reference/dns-record-types/

---

**Your custom domain is now configured with AWS Amplify!** ✅


