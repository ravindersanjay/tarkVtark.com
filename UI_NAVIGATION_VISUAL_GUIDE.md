# **UI NAVIGATION - VISUAL REFERENCE GUIDE**

**Updated**: March 12, 2026  
**For**: Cloudflare R2 Setup Guide

---

## **CLOUDFLARE DASHBOARD NAVIGATION**

### **Step 1: Login Page**
```
URL: https://dash.cloudflare.com
     ↓
     [Login Form]
     Email: [your email]
     Password: [your password]
     ↓
     [Login Button - usually blue]
```

### **Step 2: Main Dashboard**
```
https://dash.cloudflare.com
     ↓
┌─────────────────────────────────────┐
│ Left Sidebar:                       │
│ ├─ Home                             │
│ ├─ Websites                         │
│ ├─ Workers                          │
│ ├─ ... (other options)              │
│ ├─ Storage ← SCROLL DOWN TO FIND    │
│ │  ├─ R2 ← CLICK HERE              │
│ │  └─ Durable Objects              │
│ └─ Settings                         │
│                                     │
│ Top Right:                          │
│ [Search Bar] [Bell Icon] [Profile] │
└─────────────────────────────────────┘
```

### **Step 3: R2 Section**
```
After clicking R2:
     ↓
┌─────────────────────────────────────┐
│ R2 Dashboard:                       │
│                                     │
│ [Create bucket] ← RED/ORANGE BUTTON │
│                                     │
│ Buckets List:                       │
│ - tarkvtark-uploads (when created)  │
│                                     │
│ Left Sidebar showing:               │
│ - Overview                          │
│ - Settings                          │
│ - API Tokens ← CLICK FOR CREDENTIALS│
└─────────────────────────────────────┘
```

### **Step 4: API Tokens Page**
```
After clicking "API Tokens":
     ↓
┌─────────────────────────────────────┐
│ API Tokens Section:                 │
│                                     │
│ [Create API Token] ← RED BUTTON     │
│                                     │
│ Tokens List:                        │
│ - tarkVtark-token (when created)    │
│                                     │
│ After creation shows:               │
│ ┌─────────────────────────────────┐ │
│ │ Access Key ID: xxxxxxxxxxxxxxxx │ │
│ │ Secret Key: xxxxxxxxxxxxxxxxxx  │ │
│ │ Endpoint: https://xxxxx...com   │ │
│ └─────────────────────────────────┘ │
│ ← COPY THESE 3 VALUES!              │
└─────────────────────────────────────┘
```

---

## **RENDER DASHBOARD NAVIGATION**

### **Step 1: Login Page**
```
URL: https://dashboard.render.com
     ↓
     [Login Form or GitHub/Google login]
     ↓
     [Login Button]
```

### **Step 2: Main Dashboard**
```
https://dashboard.render.com
     ↓
┌─────────────────────────────────────┐
│ Your Services:                      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ debate-arena-backend            │ │
│ │ Status: Live                    │ │
│ │ [Click to open] ←─ CLICK HERE   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Other services...                   │
└─────────────────────────────────────┘
```

### **Step 3: Service Page**
```
After clicking on debate-arena-backend:
     ↓
┌─────────────────────────────────────┐
│ Service: debate-arena-backend       │
│                                     │
│ Tabs at top:                        │
│ [Overview] [Deploys] [Environment] │
│           ← CLICK THIS              │
│ [Logs] [Metrics] [Settings]         │
│                                     │
│ Left Sidebar:                       │
│ - Redeploy                          │
│ - Environment                       │
│ - Custom Domain                     │
│ - Events                            │
└─────────────────────────────────────┘
```

### **Step 4: Environment Tab**
```
After clicking "Environment" tab:
     ↓
┌─────────────────────────────────────┐
│ Environment Variables:              │
│                                     │
│ [Add Environment Variable] BUTTON   │
│                                     │
│ Current Variables:                  │
│ ┌─────────────────────────────────┐ │
│ │ Name      │ Value    │ [Edit]   │ │
│ ├───────────┼──────────┼──────────┤ │
│ │ EXISTING  │ xxxxxxxx │ [X]      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ After adding variables:             │
│ ┌─────────────────────────────────┐ │
│ │ FILE_PROVIDER │ r2              │ │
│ │ R2_ACCESS...  │ xxxxxxxxxxxxxxx │ │
│ │ R2_SECRET...  │ xxxxxxxxxxxxxxx │ │
│ │ R2_BUCKET     │ tarkvtark-...   │ │
│ │ R2_ENDPOINT   │ https://xxxx.com│ │
│ │ R2_REGION     │ us-east-1       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Save/Deploy] BUTTON (bottom/top)   │
└─────────────────────────────────────┘
```

### **Step 5: After Deploy**
```
After clicking [Deploy]:
     ↓
You'll see:
- Status: "Deploying..." (yellow)
     ↓ (wait 2-3 minutes)
- Status: "Live" (green)
     ↓
- Check "Logs" tab for any errors
```

---

## **WHAT EACH BUTTON LOOKS LIKE**

### **Cloudflare Buttons**
```
┌──────────────────────┐
│ Create bucket        │ ← Red/Orange background
│ (or Create API Token)│   White text
└──────────────────────┘
```

### **Render Buttons**
```
┌──────────────────────┐
│ Add Environment Var. │ ← Usually blue or colored
│ (or Deploy)          │   White text
└──────────────────────┘
```

---

## **COLOR INDICATORS**

### **Cloudflare**
- **Red/Orange buttons** = Important action (Create, Save)
- **Blue icons** = Navigation
- **Dark sidebar** = Left navigation menu

### **Render**
- **Blue buttons** = Primary action (Deploy, Save)
- **Green status** = Live/Active
- **Yellow status** = Deploying/In Progress
- **Red status** = Error/Failed

---

## **SEARCH ALTERNATIVE**

### **If you can't find something:**

**Cloudflare:**
```
Look for search icon in top area
Click search
Type what you're looking for (e.g., "R2", "API")
Click result
```

**Render:**
```
Usually not needed as UI is simpler
Just look for tabs at the top
Click the right one
```

---

## **DIRECT URL SHORTCUTS**

### **Cloudflare R2**
- R2 Homepage: `https://dash.cloudflare.com/?to=/:account/r2`
- API Tokens: `https://dash.cloudflare.com/?to=/:account/r2/api-tokens`

### **Render**
- Dashboard: `https://dashboard.render.com`
- Services: Usually auto-loads on dashboard

---

**Use this guide as reference when navigating the dashboards!**


