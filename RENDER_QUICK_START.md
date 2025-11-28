# Render Deployment - Quick Start Checklist

Quick reference guide with exact values to fill in Render dashboard.

---

## 🎯 Backend Deployment Form

### Step 1: Connect Repository
- [ ] Sign up at https://render.com
- [ ] Click **"New +"** → **"Web Service"**
- [ ] Connect your GitHub account
- [ ] Select your repository

### Step 2: Fill Backend Configuration

| Field | Exact Value to Enter |
|-------|---------------------|
| **Name** | `onam-backend` |
| **Region** | `Mumbai (India)` or `Singapore` (closest to you) |
| **Branch** | `main` |
| **Root Directory** | `backend` ⚠️ **IMPORTANT** |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

| Variable Name | Variable Value | Where to Get It |
|--------------|----------------|-----------------|
| `MONGODB_URI` | `mongodb+srv://gauravkhandelwal205_db_user:gauravisgreat@onamtesting.spknezr.mongodb.net/onam-festival?retryWrites=true&w=majority` | Your MongoDB Atlas connection string |
| `NODE_ENV` | `production` | - |
| `PORT` | (Leave empty - Render provides automatically) | - |
| `FRONTEND_URL` | `https://onam-frontend.onrender.com` | Update after frontend deployment |
| `LOG_LEVEL` | `info` | Optional |

### Step 4: Deploy
- [ ] Click **"Create Web Service"**
- [ ] Wait 2-5 minutes for deployment
- [ ] Copy your backend URL (e.g., `https://onam-backend.onrender.com`)
- [ ] Test: Open `https://onam-backend.onrender.com/health` in browser

---

## 🎨 Frontend Deployment Form

### Step 1: Connect Repository
- [ ] Click **"New +"** → **"Static Site"**
- [ ] Select the same repository

### Step 2: Fill Frontend Configuration

| Field | Exact Value to Enter |
|-------|---------------------|
| **Name** | `onam-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` ⚠️ **IMPORTANT** |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### Step 3: Add Environment Variables

| Variable Name | Variable Value |
|--------------|----------------|
| `VITE_API_BASE_URL` | `https://onam-backend.onrender.com/api` ⚠️ Replace with your actual backend URL |

### Step 4: Deploy
- [ ] Click **"Create Static Site"**
- [ ] Wait 3-7 minutes for deployment
- [ ] Copy your frontend URL (e.g., `https://onam-frontend.onrender.com`)

### Step 5: Update Backend CORS
- [ ] Go back to backend service
- [ ] Click **"Environment"** tab
- [ ] Update `FRONTEND_URL` to your frontend URL
- [ ] Click **"Save Changes"**

---

## 📝 MongoDB Atlas Setup (Before Backend Deployment)

### Quick Steps:

1. **Sign Up:** https://www.mongodb.com/cloud/atlas → **"Try Free"**

2. **Create Cluster:**
   - Click **"Build a Database"**
   - Choose **FREE (M0)** tier
   - Select region → Click **"Create"**

3. **Create Database User:**
   - Go to **"Database Access"** → **"Add New Database User"**
   - Username: `onamadmin`
   - Password: Click **"Autogenerate Secure Password"** → **SAVE IT**
   - Privileges: **"Atlas admin"**
   - Click **"Add User"**

4. **Allow Network Access:**
   - Go to **"Network Access"** → **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - Click **"Confirm"**

5. **Get Connection String:**
   - Go to **"Database"** → Click **"Connect"**
   - Choose **"Connect your application"**
   - Select **"Node.js"** → Version **"5.5 or later"**
   - Copy connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` with: `onamadmin`
   - Replace `<password>` with: your saved password
   - Add database name: Change `?retryWrites...` to `/onam-festival?retryWrites...`
   - Final format (example with your credentials):
     ```
     mongodb+srv://gauravkhandelwal205_db_user:gauravisgreat@onamtesting.spknezr.mongodb.net/onam-festival?retryWrites=true&w=majority
     ```
   - ⚠️ **Copy this exact string** - paste it as `MONGODB_URI` value in Render

---

## ✅ Complete Deployment Checklist

### Pre-Deployment
- [ ] GitHub repository is ready
- [ ] MongoDB Atlas cluster created
- [ ] MongoDB connection string ready
- [ ] Procfile exists in `backend/` folder

### Backend Deployment
- [ ] Web Service created on Render
- [ ] Root Directory set to `backend`
- [ ] Environment variables added:
  - [ ] `MONGODB_URI`
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL` (update after frontend deploy)
- [ ] Deployment successful
- [ ] Health endpoint works: `/health`

### Frontend Deployment
- [ ] Static Site created on Render
- [ ] Root Directory set to `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`
- [ ] Environment variable added: `VITE_API_BASE_URL`
- [ ] Deployment successful
- [ ] Website loads correctly

### Post-Deployment
- [ ] Updated `FRONTEND_URL` in backend
- [ ] Tested API calls from frontend
- [ ] Created test order
- [ ] Verified order in MongoDB Atlas

---

## 🔧 Exact Configuration Values Summary

### Backend Web Service
```
Name: onam-backend
Region: Mumbai (India) or Singapore
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance: Free
```

### Backend Environment Variables
```
MONGODB_URI = mongodb+srv://gauravkhandelwal205_db_user:gauravisgreat@onamtesting.spknezr.mongodb.net/onam-festival?retryWrites=true&w=majority
NODE_ENV = production
FRONTEND_URL = https://onam-frontend.onrender.com
LOG_LEVEL = info
```

### Frontend Static Site
```
Name: onam-frontend
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

### Frontend Environment Variables
```
VITE_API_BASE_URL = https://onam-backend.onrender.com/api
```

---

## 🚨 Common Mistakes to Avoid

❌ **WRONG:**
- Root Directory: empty or `./backend`
- Build Command: `npm run build` (backend doesn't need build)
- MONGODB_URI: missing database name
- FRONTEND_URL: wrong URL format

✅ **CORRECT:**
- Root Directory: `backend` (no slash, no dot)
- Build Command: `npm install`
- MONGODB_URI: includes `/onam-festival` before `?`
- FRONTEND_URL: full URL with `https://`

---

## 📞 Your URLs After Deployment

Once deployed, you'll have:

- **Backend:** `https://onam-backend.onrender.com`
- **Backend Health:** `https://onam-backend.onrender.com/health`
- **Backend API:** `https://onam-backend.onrender.com/api`
- **Frontend:** `https://onam-frontend.onrender.com`

Replace `onam-backend` and `onam-frontend` with your actual service names.

---

**Quick Tip:** Keep this checklist open while deploying. Check off each item as you complete it!

For detailed instructions, see: `RENDER_DEPLOYMENT.md`

