# Complete Render Deployment Guide

Step-by-step guide to deploy the Onam Festival website on Render platform.

---

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] GitHub account with the project repository
- [ ] MongoDB Atlas account (recommended) or MongoDB connection string
- [ ] Render account (sign up at https://render.com - free tier available)

---

## 🗄️ Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"** or **"Sign Up"**
3. Create your account (use Google/GitHub for faster signup)

### 1.2 Create a Cluster

1. After logging in, click **"Build a Database"**
2. Choose **FREE (M0)** tier
3. Select your **Cloud Provider** (AWS recommended)
4. Choose **Region** closest to you (e.g., Mumbai for India)
5. Click **"Create"** and wait 3-5 minutes for cluster creation

### 1.3 Configure Database Access

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. **Username:** `onamadmin` (or your choice)
5. **Password:** Click **"Autogenerate Secure Password"** and **SAVE IT** immediately
6. **Database User Privileges:** Select **"Atlas admin"** (for simplicity) or **"Read and write to any database"**
7. Click **"Add User"**

### 1.4 Configure Network Access

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. For Render deployment, click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - ⚠️ **Security Note:** For production, consider restricting to Render's IP ranges
4. Click **"Confirm"**

### 1.5 Get Connection String

1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** and version **"5.5 or later"**
5. Copy the connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<username>`** with your database username (e.g., `onamadmin`)
7. **Replace `<password>`** with your saved password
8. **Add database name** at the end: `?retryWrites=true&w=majority` → `/onam-festival?retryWrites=true&w=majority`
9. Final connection string example (your actual connection string):
   ```
   mongodb+srv://gauravkhandelwal205_db_user:gauravisgreat@onamtesting.spknezr.mongodb.net/onam-festival?retryWrites=true&w=majority
   ```
   ⚠️ **Important:** Make sure to add `/onam-festival?retryWrites=true&w=majority` at the end
10. **SAVE THIS CONNECTION STRING** - you'll need it in Step 3

---

## 🚀 Step 2: Prepare Your Repository

### 2.1 Verify Project Structure

Ensure your repository has this structure:
```
Onam/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── Procfile (or we'll create it)
└── frontend/
    ├── src/
    ├── package.json
    └── vite.config.js
```

### 2.2 Create Procfile (if not exists)

Create `backend/Procfile` with:
```
web: node server.js
```

### 2.3 Verify package.json Scripts

**Backend `package.json`** should have:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

**Frontend `package.json`** should have:
```json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite"
  }
}
```

### 2.4 Commit and Push to GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## 🔧 Step 3: Deploy Backend on Render

### 3.1 Create Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** button (top right)
3. Select **"Web Service"**

### 3.2 Connect Repository

1. If first time, click **"Connect account"** next to GitHub
2. Authorize Render to access your repositories
3. Search and select your repository
4. Click **"Connect"**

### 3.3 Configure Backend Service

Fill in the following details:

#### Basic Settings

| Field | Value |
|-------|-------|
| **Name** | `onam-backend` |
| **Region** | Choose closest to your users (e.g., `Mumbai (India)` or `Singapore`) |
| **Branch** | `main` (or your main branch name) |
| **Root Directory** | `backend` ← **IMPORTANT!** |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

#### Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `MONGODB_URI` | `mongodb+srv://gauravkhandelwal205_db_user:gauravisgreat@onamtesting.spknezr.mongodb.net/onam-festival?retryWrites=true&w=majority` | Your MongoDB connection string with database name and query params |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Render provides this automatically, but you can set it |
| `FRONTEND_URL` | `https://onam-frontend.onrender.com` | We'll update this after deploying frontend |
| `LOG_LEVEL` | `info` | Optional: Logging level |

**Important Notes:**
- Render automatically provides `PORT` environment variable
- You'll need to update `FRONTEND_URL` after deploying frontend (or leave blank for now)
- `MONGODB_URI` should NOT have spaces or quotes

#### Service Settings

| Setting | Value |
|---------|-------|
| **Instance Type** | `Free` (or upgrade for better performance) |
| **Auto-Deploy** | `Yes` (redeploys on every git push) |

### 3.4 Create Backend Service

1. Click **"Create Web Service"**
2. Render will start building your backend
3. Watch the build logs - it should show:
   ```
   === Building ===
   npm install
   === Starting ===
   npm start
   ```

### 3.5 Verify Backend Deployment

1. Wait for deployment to complete (2-5 minutes)
2. Once deployed, you'll see: **"Your service is live at:"** with a URL like:
   ```
   https://onam-backend.onrender.com
   ```
3. Test the health endpoint:
   - Open: `https://onam-backend.onrender.com/health`
   - Should return: `{"status":"OK","message":"Onam Festival API is running",...}`
4. Copy your backend URL - you'll need it for frontend

### 3.6 Update FRONTEND_URL (If Frontend Already Deployed)

1. Go to your backend service dashboard
2. Click **"Environment"** tab
3. Edit `FRONTEND_URL` value
4. Add your frontend URL (e.g., `https://onam-frontend.onrender.com`)
5. Click **"Save Changes"**
6. Service will automatically redeploy

---

## 🎨 Step 4: Deploy Frontend on Render

### 4.1 Create Static Site

1. In Render dashboard, click **"New +"** button
2. Select **"Static Site"**

### 4.2 Connect Repository (Same Repository)

1. Select the same repository you used for backend
2. Click **"Connect"**

### 4.3 Configure Frontend Service

Fill in the following details:

#### Basic Settings

| Field | Value |
|-------|-------|
| **Name** | `onam-frontend` |
| **Branch** | `main` (or your main branch name) |
| **Root Directory** | `frontend` ← **IMPORTANT!** |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

#### Environment Variables

Click **"Add Environment Variable"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_API_BASE_URL` | `https://onam-backend.onrender.com/api` | Your backend URL + `/api` |

**Note:** Replace `onam-backend` with your actual backend service name if different.

### 4.4 Create Frontend Service

1. Click **"Create Static Site"**
2. Render will start building your frontend
3. Watch the build logs

### 4.5 Verify Frontend Deployment

1. Wait for deployment to complete (3-7 minutes)
2. Once deployed, you'll see: **"Your site is live at:"** with a URL like:
   ```
   https://onam-frontend.onrender.com
   ```
3. Open the URL in your browser
4. Test the website:
   - Check if homepage loads
   - Try adding items to cart
   - Test checkout flow
   - Check browser console for errors

### 4.6 Update Backend FRONTEND_URL

1. Go back to your backend service dashboard
2. Click **"Environment"** tab
3. Update `FRONTEND_URL` to match your frontend URL:
   ```
   https://onam-frontend.onrender.com
   ```
4. Click **"Save Changes"**
5. Backend will redeploy with correct CORS settings

---

## 🔒 Step 5: Configure Custom Domain (Optional)

### 5.1 Add Custom Domain to Frontend

1. Go to your frontend static site dashboard
2. Click **"Settings"** tab
3. Scroll to **"Custom Domains"** section
4. Click **"Add Custom Domain"**
5. Enter your domain (e.g., `onam.yourdomain.com`)
6. Follow DNS configuration instructions

### 5.2 Update Environment Variables

After adding custom domain:

1. **Frontend:** Update domain in Render settings (auto-detected)
2. **Backend:** Update `FRONTEND_URL` environment variable to your custom domain

---

## ✅ Step 6: Verification Checklist

### Backend Checks

- [ ] Backend health endpoint works: `https://your-backend.onrender.com/health`
- [ ] MongoDB connection successful (check logs)
- [ ] API endpoints respond correctly
- [ ] CORS allows frontend domain
- [ ] Environment variables are set correctly

### Frontend Checks

- [ ] Website loads correctly
- [ ] API calls work (check browser console)
- [ ] Cart functionality works
- [ ] Checkout form submits successfully
- [ ] All images and videos load
- [ ] Mobile responsive design works

### Integration Checks

- [ ] Create a test order from frontend
- [ ] Verify order appears in MongoDB Atlas
- [ ] Check order number format is correct
- [ ] Test both cash and UPI payment flows
- [ ] Verify form validation works

---

## 📝 Environment Variables Reference

### Backend Environment Variables

```env
MONGODB_URI=mongodb+srv://gauravkhandelwal205_db_user:gauravisgreat@onamtesting.spknezr.mongodb.net/onam-festival?retryWrites=true&w=majority
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://onam-frontend.onrender.com
LOG_LEVEL=info
```

### Frontend Environment Variables

```env
VITE_API_BASE_URL=https://onam-backend.onrender.com/api
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: Build fails with "Module not found"**
```
Solution:
- Check Root Directory is set to "backend"
- Verify package.json exists in backend folder
- Check build logs for specific errors
```

**Problem: MongoDB connection fails**
```
Solution:
- Verify MONGODB_URI is correct (no spaces, correct password)
- Check MongoDB Atlas Network Access allows all IPs (0.0.0.0/0)
- Verify database user credentials
- Check MongoDB cluster is running
```

**Problem: Service goes to sleep (Free tier)**
```
Solution:
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30-50 seconds
- Upgrade to paid tier to avoid sleep
- Or use external service to ping your backend every 10 minutes
```

**Problem: CORS errors**
```
Solution:
- Verify FRONTEND_URL matches your frontend domain exactly
- Check backend server.js CORS configuration
- Ensure no trailing slashes in URLs
- Check browser console for exact CORS error
```

### Frontend Issues

**Problem: Build fails**
```
Solution:
- Check Root Directory is set to "frontend"
- Verify package.json exists
- Check Vite version compatibility
- Review build logs for errors
```

**Problem: API calls return 404**
```
Solution:
- Verify VITE_API_BASE_URL is set correctly
- Check URL ends with "/api"
- Ensure backend service is running
- Check browser Network tab for actual request URL
```

**Problem: Environment variables not working**
```
Solution:
- Ensure variables start with "VITE_" prefix
- Rebuild frontend after adding env vars
- Check that variables are in Render dashboard
- Clear browser cache
```

**Problem: Assets (images/videos) not loading**
```
Solution:
- Check file paths in public folder
- Verify images are committed to repository
- Check browser Network tab for 404 errors
- Ensure paths start with "/" not relative paths
```

---

## 💰 Render Free Tier Limitations

### Backend (Web Service)

- ⏱️ **Sleep Time:** Services sleep after 15 minutes of inactivity
- 🐌 **Cold Start:** First request after sleep takes 30-50 seconds
- 💾 **Memory:** 512 MB RAM
- 📦 **Bandwidth:** 100 GB/month
- ⏰ **Auto-Deploy:** Unlimited

### Frontend (Static Site)

- 🚀 **No Sleep:** Static sites don't sleep
- 📦 **Bandwidth:** 100 GB/month
- ⚡ **Fast CDN:** Global CDN included
- 🔒 **SSL:** Free SSL certificates

### Upgrade Options

To avoid sleep times and get better performance:
- **Starter Plan:** $7/month per service
- **Standard Plan:** $25/month per service
- Check https://render.com/pricing for details

---

## 🔄 Auto-Deploy Setup

Render automatically redeploys when you push to GitHub:

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. Render detects the push
4. Automatically starts new deployment
5. Builds and deploys latest code
6. Old version remains live until new deployment succeeds

### Manual Deploy

To manually trigger deployment:
1. Go to service dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📊 Monitoring Your Deployment

### View Logs

1. Go to service dashboard
2. Click **"Logs"** tab
3. View real-time logs
4. Filter by timestamp or search for errors

### View Metrics

1. Go to service dashboard
2. View metrics:
   - CPU usage
   - Memory usage
   - Response times
   - Request count

### Set Up Alerts

1. Go to service dashboard
2. Click **"Alerts"** tab
3. Configure email alerts for:
   - Deployment failures
   - Service downtime
   - High error rates

---

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use Render's environment variables
   - Rotate passwords regularly

2. **MongoDB Atlas**
   - Restrict network access when possible
   - Use strong passwords
   - Enable MongoDB Atlas monitoring

3. **CORS**
   - Only allow your frontend domain
   - Don't use wildcard (*) in production

4. **SSL/HTTPS**
   - Render provides free SSL automatically
   - Always use HTTPS in production

---

## 📞 Quick Reference URLs

After deployment, your URLs will look like:

- **Backend:** `https://onam-backend.onrender.com`
- **Backend Health:** `https://onam-backend.onrender.com/health`
- **Backend API:** `https://onam-backend.onrender.com/api`
- **Frontend:** `https://onam-frontend.onrender.com`

---

## ✅ Success Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Backend deployed and health check works
- [ ] Frontend deployed and loads correctly
- [ ] API calls from frontend to backend work
- [ ] Test order creation works
- [ ] Environment variables are set correctly
- [ ] Custom domain configured (optional)
- [ ] Monitoring and alerts set up

---

**Last Updated:** 2025-01-27  
**Platform:** Render.com  
**Status:** Ready for Deployment

For more help, refer to:
- Render Documentation: https://render.com/docs
- Render Support: support@render.com

