# Deployment Guide

This document outlines the deployment configuration for the Onam Festival website.

## 🌐 Production URLs

- **Frontend (Netlify):** https://onammitadt.netlify.app
- **Backend API (Render):** https://onam-vaot.onrender.com

## 📋 Deployment Checklist

### Backend (Render) Configuration

#### Environment Variables Required:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/onam-festival?retryWrites=true&w=majority
PORT=10000
FRONTEND_URL=https://onammitadt.netlify.app
NODE_ENV=production
UPI_ID=your-upi-id@ybl
LOG_LEVEL=info
```

#### Steps:

1. ✅ Connect MongoDB Atlas database
   - Create cluster on MongoDB Atlas
   - Get connection string
   - Set `MONGODB_URI` in Render environment variables

2. ✅ Set CORS origin
   - Add `FRONTEND_URL=https://onammitadt.netlify.app` to environment variables
   - Multiple origins can be comma-separated: `https://onammitadt.netlify.app,http://localhost:5173`

3. ✅ Configure UPI ID
   - Set `UPI_ID` environment variable (required for payment processing)
   - This will be served via `/api/config` endpoint

4. ✅ Verify Procfile
   - Ensure `Procfile` contains: `web: node server.js`
   - Render will use this to start the server

5. ✅ Test endpoints:
   - Health check: `https://onam-vaot.onrender.com/health`
   - Config: `https://onam-vaot.onrender.com/api/config`
   - Orders: `https://onam-vaot.onrender.com/api/orders`

### Frontend (Netlify) Configuration

#### Environment Variables Required:

```env
VITE_API_BASE_URL=https://onam-vaot.onrender.com/api
```

#### Steps:

1. ✅ Set API URL
   - In Netlify dashboard, go to Site settings → Environment variables
   - Add `VITE_API_BASE_URL=https://onam-vaot.onrender.com/api`
   - **Note:** Variable must start with `VITE_` to be accessible in Vite builds

2. ✅ Build Settings
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18.x or higher

3. ✅ Verify netlify.toml
   - Ensure `netlify.toml` has correct redirects for SPA routing
   - All routes should redirect to `/index.html` with status 200

4. ✅ Test deployment
   - Visit https://onammitadt.netlify.app
   - Check browser console for API connection errors
   - Test order creation flow

## 🔍 Verification Steps

### Backend Health Check

```bash
curl https://onam-vaot.onrender.com/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Onam Festival API is running",
  "timestamp": "2025-01-XX..."
}
```

### Config Endpoint Check

```bash
curl https://onam-vaot.onrender.com/api/config
```

Expected response:
```json
{
  "success": true,
  "config": {
    "payment": {
      "upiId": "your-upi-id@ybl",
      "methods": ["cash", "upi"]
    }
  }
}
```

### CORS Test

Test from browser console on Netlify site:
```javascript
fetch('https://onam-vaot.onrender.com/api/config')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Should return config without CORS errors.

## 🐛 Troubleshooting

### CORS Errors

**Problem:** Frontend can't access backend API

**Solutions:**
1. Verify `FRONTEND_URL` in Render includes exact Netlify URL (with https://)
2. Check browser console for exact CORS error message
3. Ensure backend is running and accessible
4. Verify no trailing slashes in URLs

### API Connection Failed

**Problem:** Frontend shows "API request failed"

**Solutions:**
1. Check `VITE_API_BASE_URL` is set correctly in Netlify
2. Verify backend is running (check Render logs)
3. Test backend health endpoint directly
4. Check browser network tab for actual request URL

### UPI ID Not Loading

**Problem:** Checkout page shows "Loading..." for UPI ID

**Solutions:**
1. Verify `UPI_ID` is set in Render environment variables
2. Check `/api/config` endpoint returns UPI ID
3. Check browser console for API errors
4. Verify CORS allows the request

### Order Creation Fails

**Problem:** Orders not being created

**Solutions:**
1. Check MongoDB connection in Render logs
2. Verify all required environment variables are set
3. Check rate limiting (max 10 orders per 15 minutes per IP)
4. Review validation errors in response

## 📝 Notes

- **Rate Limiting:** Backend has rate limiting (100 requests/15min general, 10 orders/15min)
- **MongoDB:** Use MongoDB Atlas for production (free tier available)
- **Environment Variables:** All sensitive data should be in environment variables, never in code
- **Build Time:** Netlify builds with environment variables available at build time
- **Runtime:** Render environment variables available at runtime

## 🔐 Security Checklist

- ✅ No hardcoded secrets in code
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ Input sanitization active
- ✅ Request size limits set
- ✅ Environment variables secured
- ✅ MongoDB connection string secured
- ✅ UPI ID in environment variables only

