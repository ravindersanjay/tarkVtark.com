# **AWS AMPLIFY - FIND DOMAIN VALIDATION RECORD**

**How to find the DNS validation record Cloudflare needs**

---

## **WHERE TO FIND IT IN AMPLIFY**

### **Step 1: Go to Amplify Console**

1. Open: `https://console.aws.amazon.com/amplify/`
2. Click on your app name
3. Look for left sidebar

---

### **Step 2: Click Domain Management**

**In left sidebar:**

```
Hosting environment
├─ Frontend environments
├─ Build settings
├─ Hosting features
└─ Domain management ← CLICK HERE
```

Or at the top, look for tabs/sections:
```
Overview | Frontend | CI/CD | Domain management
                                              ↑ Click this
```

---

### **Step 3: See Your Domain Setup**

**After clicking Domain management, you'll see:**

```
Domains
┌──────────────────────────────────────┐
│ debatemanch.com                      │
│ Status: Pending verification         │
│ (shows your domain with status)      │
└──────────────────────────────────────┘
```

Click on `debatemanch.com` to see details.

---

### **Step 4: See the DNS Records Needed**

**A panel will show:**

```
Configure domain for debatemanch.com

The following records are required to configure this domain:

┌─────────────────────────────────────────────────────────────┐
│ Record Type | Name              | Value                     │
├─────────────────────────────────────────────────────────────┤
│ CNAME       | www.debatemanch.  | d123abc.cloudfront.net   │
│             | com               |                           │
├─────────────────────────────────────────────────────────────┤
│ CNAME       | debatemanch.com   | d123abc.cloudfront.net   │
│             | (or @)            |                           │
├─────────────────────────────────────────────────────────────┤
│ CNAME       | _abc123.          | _def456.acm-validations. │
│             | debatemanch.com   | aws.                     │
└─────────────────────────────────────────────────────────────┘

SSL Certificate Status: Pending validation
```

---

### **Step 5: Find the Validation Record**

**Look for the record with:**
- `_abc123` or underscore (_) at the beginning
- Name contains: `debatemanch.com`
- Value contains: `acm-validations.aws`

**Example:**
```
Name:  _abc123.debatemanch.com
Value: _def456.acm-validations.aws.
```

This is the SSL validation record ✅

---

## **COPY THESE 3 RECORDS**

**From the Amplify screen, copy:**

### **Record 1:**
```
Type: CNAME
Name: www.debatemanch.com (or just "www")
Value: d123abc.cloudfront.net
```

### **Record 2:**
```
Type: CNAME
Name: debatemanch.com (or "@")
Value: d123abc.cloudfront.net
```

### **Record 3 (Validation):**
```
Type: CNAME
Name: _abc123.debatemanch.com
Value: _def456.acm-validations.aws.
```

---

## **PASTE INTO CLOUDFLARE**

**In Cloudflare DNS Records:**

For each record above:
1. Click "+ Add record"
2. Fill in Type, Name, Content from above
3. Set Proxy: "DNS only"
4. Click Save

**Repeat for all 3 records**

---

## **NOTE ABOUT VALUES**

⚠️ **YOUR VALUES WILL BE DIFFERENT!**

```
Don't copy my examples:
- d123abc.cloudfront.net ← Example (not real)
- _abc123 ← Example (not real)
- _def456 ← Example (not real)

Copy YOUR actual values from Amplify!
```

---

## **VISUAL: WHERE TO LOOK IN AMPLIFY**

```
┌─ AWS Amplify Console ────────────────────────────────────┐
│                                                            │
│  [Your App Name] > Domain management                      │
│                                                            │
│  Domains                                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ debatemanch.com                                      │ │
│  │ Status: Pending verification                        │ │
│  │                                                      │ │
│  │ [Click to expand]                                   │ │
│  │                                                      │ │
│  │ Configure domain records:                           │ │
│  │ ┌─────────────────────────────────────────────────┐ │ │
│  │ │ Type  | Name              | Value              │ │ │
│  │ ├─────────────────────────────────────────────────┤ │ │
│  │ │ CNAME | www...            | d123abc.cloud...   │ │ │
│  │ │ CNAME | debatemanch.com   | d123abc.cloud...   │ │ │
│  │ │ CNAME | _abc123.debate... | _def456.acm-...    │ │ │ ← THIS ONE
│  │ │       |                   | validations.aws.   │ │ │
│  │ └─────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## **IF YOU CAN'T FIND IT**

### **Problem: Domain Management section missing**

**Check:**
1. Are you in the right app?
2. Look at the bottom of left sidebar
3. Scroll down in left sidebar
4. Look for "Domain" or "App settings"

### **Problem: DNS records not showing**

**Check:**
1. Click on your domain name to expand it
2. Look for button: "Show DNS records" or similar
3. Scroll down in the panel

### **Problem: SSL Certificate section missing**

**Check:**
1. Go to "Domain management"
2. Scroll down for "SSL Certificate" section
3. It should say "Pending validation" initially

---

## **QUICK CHECKLIST**

- [ ] Logged into Amplify
- [ ] Went to your app
- [ ] Clicked "Domain management"
- [ ] Found debatemanch.com
- [ ] Expanded to see DNS records
- [ ] Copied Record 1 (www CNAME)
- [ ] Copied Record 2 (root domain CNAME)
- [ ] Copied Record 3 (validation CNAME with underscore)
- [ ] Found the "_abc123..." validation record
- [ ] Ready to add to Cloudflare

---

## **WHAT'S NEXT**

1. Copy all 3 records from Amplify
2. Go to Cloudflare DNS
3. Add each record
4. Set Proxy to "DNS only"
5. Save each one
6. Wait 10-15 minutes
7. Come back to Amplify
8. Click "Verify"
9. SSL certificate issued ✅

---

## **REMEMBER**

**The validation record:**
- Starts with underscore: `_abc123`
- Contains: `acm-validations.aws`
- This proves you own the domain
- AWS issues SSL certificate after

---

**Got the values? Go add them to Cloudflare!** ✅


