# Deployment Guide - Onam Festival Website

This guide provides step-by-step instructions for deploying both the frontend and backend of the Onam Festival website to production.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Domain & DNS](#domain--dns)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before deploying, ensure you have:

- [ ] Node.js 16+ installed locally
- [ ] MongoDB account (Atlas recommended) or local MongoDB
- [ ] Git repository access
- [ ] Accounts on hosting platforms:
  - **Frontend:** Netlify (recommended) or Vercel
  - **Backend:** Heroku, Railway, Render, or DigitalOcean
- [ ] Domain name (optional but recommended)

---

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended for Production)

1. **Create Account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose "FREE" (M0) tier
   - Select cloud provider and region closest to your users
   - Give cluster a name (e.g., "OnamFestival")
   - Click "Create Cluster"

3. **Configure Security:**
   - Go to "Database Access" → "Add New Database User"
   - Authentication: Password
   - Username: `onamadmin` (or your choice)
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Configure Network Access:**
   - Go to "Network Access" → "Add IP Address"
   - For production, add `0.0.0.0/0` (allows all IPs)
   - **Warning:** For better security, use specific IPs when possible
   - Click "Confirm"

5. **Get Connection String:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `onam-festival`
   - Example: `mongodb+srv://onamadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/onam-festival?retryWrites=true&w=majority`

### Option 2: Local MongoDB (Development Only)

```bash
# Install MongoDB locally
# Windows: https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: Follow MongoDB installation guide

# Start MongoDB service
# Connection string: mongodb://localhost:27017/onam-festival
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory or set these in your hosting platform:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/onam-festival?retryWrites=true&w=majority

# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# Optional: Add any other configurations
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory or set these in your hosting platform:

```env
# API Base URL
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

**Note:** In Vite, environment variables must be prefixed with `VITE_` to be accessible in the browser.

---

## 🚀 Backend Deployment

### Option 1: Railway (Recommended - Easy & Free Tier)

1. **Sign Up:**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend/` folder as the root directory

3. **Configure Environment:**
   - Go to "Variables" tab
   - Add all environment variables from [Environment Configuration](#environment-configuration)
   - Railway will automatically detect Node.js and run `npm install`

4. **Deploy:**
   - Railway will auto-deploy on git push
   - Wait for deployment to complete
   - Copy the generated domain (e.g., `your-app.railway.app`)
   - Update `FRONTEND_URL` in backend env vars if needed

5. **Custom Domain (Optional):**
   - Go to "Settings" → "Domains"
   - Add your custom domain
   - Update DNS records as instructed

### Option 2: Render

1. **Sign Up:**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service:**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** `onam-backend`
     - **Root Directory:** `backend`
     - **Environment:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`

3. **Add Environment Variables:**
   - Scroll to "Environment Variables"
   - Add all variables from [Environment Configuration](#environment-configuration)

4. **Deploy:**
   - Click "Create Web Service"
   - Render will deploy automatically
   - Copy the generated URL (e.g., `onam-backend.onrender.com`)

### Option 3: Heroku

1. **Install Heroku CLI:**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku

   # Windows: Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login:**
   ```bash
   heroku login
   ```

3. **Create App:**
   ```bash
   cd backend
   heroku create onam-backend
   ```

4. **Set Environment Variables:**
   ```bash
   heroku config:set MONGODB_URI="your-mongodb-uri"
   heroku config:set NODE_ENV="production"
   heroku config:set FRONTEND_URL="https://your-frontend-domain.com"
   ```

5. **Create Procfile:**
   Create `backend/Procfile`:
   ```
   web: node server.js
   ```

6. **Deploy:**
   ```bash
   git push heroku main
   ```

---

## 🎨 Frontend Deployment

### Option 1: Netlify (Recommended - Already Configured)

1. **Sign Up:**
   - Go to https://netlify.com
   - Sign up with GitHub

2. **Deploy:**
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository
   - Configure build settings:
     - **Base directory:** `frontend`
     - **Build command:** `npm run build`
     - **Publish directory:** `frontend/dist`

3. **Add Environment Variables:**
   - Go to "Site settings" → "Environment variables"
   - Add: `VITE_API_BASE_URL` = `https://your-backend-domain.com/api`

4. **Deploy:**
   - Netlify will auto-deploy on git push
   - Wait for deployment to complete
   - Your site will be available at `your-site.netlify.app`

5. **Custom Domain:**
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Follow DNS configuration instructions

### Option 2: Vercel

1. **Sign Up:**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project:**
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Root Directory:** `frontend`
     - **Framework Preset:** Vite
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`

3. **Add Environment Variables:**
   - Add `VITE_API_BASE_URL` = `https://your-backend-domain.com/api`

4. **Deploy:**
   - Click "Deploy"
   - Vercel will auto-deploy on git push

---

## 🌐 Domain & DNS

### Setting Up Custom Domain

1. **Purchase Domain:**
   - Buy domain from Namecheap, GoDaddy, or similar

2. **Configure DNS:**

   **For Netlify (Frontend):**
   - Netlify provides DNS nameservers
   - Update nameservers in your domain registrar
   - Or add CNAME record pointing to Netlify subdomain

   **For Backend (Railway/Render):**
   - Add CNAME record pointing to backend subdomain
   - Example: `api.yourdomain.com` → `your-app.railway.app`

3. **SSL Certificates:**
   - Netlify and most platforms auto-configure SSL
   - Ensure HTTPS is enabled

---

## ✅ Post-Deployment Checklist

### Backend Verification

- [ ] Health check endpoint works: `https://your-backend.com/health`
- [ ] API endpoints respond correctly
- [ ] CORS allows frontend domain
- [ ] MongoDB connection successful
- [ ] Environment variables are set correctly
- [ ] Logs show no errors

### Frontend Verification

- [ ] Website loads correctly
- [ ] API calls work (check browser console)
- [ ] Cart functionality works
- [ ] Checkout form submits successfully
- [ ] All images and videos load
- [ ] Mobile responsive design works

### Test End-to-End

- [ ] Create a test order from frontend
- [ ] Verify order appears in MongoDB
- [ ] Check order number format is correct
- [ ] Test both cash and UPI payment flows
- [ ] Verify email validation works
- [ ] Test form error handling

---

## 🔍 Troubleshooting

### Backend Issues

**Problem: MongoDB Connection Failed**
```
Solution:
- Verify MONGODB_URI is correct
- Check MongoDB Atlas network access (IP whitelist)
- Verify database user credentials
- Check MongoDB cluster is running
```

**Problem: CORS Errors**
```
Solution:
- Verify FRONTEND_URL in backend env matches frontend domain
- Check CORS configuration in server.js
- Ensure credentials are properly configured
```

**Problem: Port Already in Use**
```
Solution:
- Most platforms auto-assign ports
- Check platform documentation for port configuration
- Use process.env.PORT (should be set automatically)
```

### Frontend Issues

**Problem: API Calls Fail (404 or CORS)**
```
Solution:
- Verify VITE_API_BASE_URL is set correctly
- Check backend URL is accessible
- Ensure backend CORS allows frontend domain
- Check browser console for specific error messages
```

**Problem: Build Fails**
```
Solution:
- Check Node.js version (needs 16+)
- Verify all dependencies are installed
- Check for TypeScript/ESLint errors
- Review build logs for specific errors
```

**Problem: Environment Variables Not Working**
```
Solution:
- Ensure variables start with VITE_ prefix
- Rebuild after adding new env variables
- Check Netlify/Vercel env variable settings
- Clear build cache and redeploy
```

### Database Issues

**Problem: Orders Not Saving**
```
Solution:
- Check MongoDB connection
- Verify database name matches
- Check MongoDB logs
- Verify schema validation isn't failing
```

**Problem: Duplicate Order Numbers**
```
Solution:
- This should be rare, but check order generation logic
- Consider using atomic operations for order numbers
```

---

## 🔐 Security Checklist

Before going live, ensure:

- [ ] HTTPS is enabled on both frontend and backend
- [ ] Environment variables are not committed to git
- [ ] MongoDB has network access restrictions (if possible)
- [ ] CORS is configured to allow only your frontend domain
- [ ] Sensitive data is not exposed in error messages
- [ ] Database passwords are strong and unique
- [ ] API rate limiting is considered (currently not implemented)

---

## 📊 Monitoring & Maintenance

### Recommended Tools

1. **Error Tracking:**
   - Consider Sentry for error tracking
   - Monitor application logs

2. **Analytics:**
   - Google Analytics for frontend
   - Monitor API response times

3. **Uptime Monitoring:**
   - UptimeRobot or similar
   - Monitor health check endpoint

4. **Database Monitoring:**
   - MongoDB Atlas provides built-in monitoring
   - Set up alerts for connection issues

### Regular Maintenance

- Update dependencies regularly
- Monitor application logs
- Backup database regularly
- Review security patches
- Monitor API usage and performance

---

## 🚨 Rollback Procedure

If something goes wrong:

1. **Frontend Rollback:**
   - Netlify/Vercel provide instant rollback
   - Go to "Deploys" → Select previous deployment → "Publish"

2. **Backend Rollback:**
   - Redeploy previous version from git
   - Or use platform's rollback feature

3. **Database:**
   - MongoDB Atlas provides point-in-time backups
   - Restore if data corruption occurs

---

## 📝 Deployment Commands Reference

### Local Testing Before Deployment

**Backend:**
```bash
cd backend
npm install
npm run dev  # Development mode with nodemon
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # Development server on http://localhost:5173
npm run build  # Production build
npm run preview  # Preview production build
```

### Production Build

**Backend:**
```bash
cd backend
npm install --production
npm start  # Uses node server.js
```

**Frontend:**
```bash
cd frontend
npm install
npm run build  # Creates dist/ folder
# Deploy dist/ folder contents
```

---

## 🎯 Quick Deploy Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Backend deployed and health check works
- [ ] Backend environment variables set
- [ ] Frontend deployed and loads correctly
- [ ] Frontend environment variables set (API URL)
- [ ] CORS configured correctly
- [ ] Test order creation works
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] Monitoring set up

---

**Last Updated:** 2025-01-27  
**Deployment Version:** 1.0.0

For issues or questions, refer to the troubleshooting section or contact the development team.

