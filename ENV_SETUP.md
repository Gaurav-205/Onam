# Environment Variables Setup Guide

This guide explains how to set up environment variables for both the backend and frontend of the Onam Festival website.

---

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

### Required Variables

```env
# MongoDB Connection
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/onam-festival

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/onam-festival?retryWrites=true&w=majority

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS configuration)
# Development:
FRONTEND_URL=http://localhost:5173

# Production:
# FRONTEND_URL=https://your-frontend-domain.com
```

### Optional Variables

```env
# Logging Configuration
# Options: error, warn, info, debug
# Default: info
LOG_LEVEL=info

# Payment Configuration (Optional - can also be set in config/app.js)
UPI_ID=8955142954-2@ybl
```

### Example `.env` File (Development)

```env
MONGODB_URI=mongodb://localhost:27017/onam-festival
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=info
```

### Example `.env` File (Production)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/onam-festival?retryWrites=true&w=majority
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
LOG_LEVEL=warn
UPI_ID=8955142954-2@ybl
```

---

## Frontend Environment Variables

Create a `.env` file in the `frontend/` directory with the following variables:

### Required Variables

```env
# API Base URL
# Development:
VITE_API_BASE_URL=http://localhost:3000/api

# Production:
# VITE_API_BASE_URL=https://your-backend-domain.com/api
```

### Optional Variables

```env
# Payment Configuration (Optional - can also be set in config/app.js)
VITE_UPI_ID=8955142954-2@ybl
```

**Important:** In Vite, environment variables must be prefixed with `VITE_` to be accessible in the browser code.

### Example `.env` File (Development)

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Example `.env` File (Production)

```env
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_UPI_ID=8955142954-2@ybl
```

---

## Setting Up Environment Files

### Option 1: Manual Creation

1. **Backend:**
   ```bash
   cd backend
   touch .env
   # Then edit .env with your values
   ```

2. **Frontend:**
   ```bash
   cd frontend
   touch .env
   # Then edit .env with your values
   ```

### Option 2: Copy from Template (if .env.example exists)

1. **Backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Then edit .env with your actual values
   ```

2. **Frontend:**
   ```bash
   cd frontend
   cp .env.example .env
   # Then edit .env with your actual values
   ```

---

## Security Best Practices

### ⚠️ Never Commit `.env` Files

Make sure `.env` files are in your `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.production
.env.development
```

### ✅ Do Commit `.env.example` Files

Create `.env.example` files with placeholder values (without sensitive data):

**Backend `.env.example`:**
```env
MONGODB_URI=mongodb://localhost:27017/onam-festival
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=info
```

**Frontend `.env.example`:**
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## Platform-Specific Setup

### Netlify (Frontend)

1. Go to your site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add variables:
   - `VITE_API_BASE_URL` = `https://your-backend-domain.com/api`
   - `VITE_UPI_ID` = `your-upi-id` (optional)

### Railway/Render/Heroku (Backend)

1. Go to your project dashboard
2. Navigate to **Environment** or **Variables** section
3. Add all variables from the backend `.env` example

---

## Verifying Environment Variables

### Backend

```javascript
// In server.js, you can log environment variables (in development only)
if (process.env.NODE_ENV === 'development') {
  console.log('Environment variables loaded:')
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✓' : 'Missing ✗')
  console.log('PORT:', process.env.PORT || '3000')
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set')
}
```

### Frontend

```javascript
// In browser console or component
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
```

**Note:** Only variables prefixed with `VITE_` are accessible in frontend code.

---

## Troubleshooting

### Backend: "Cannot find module" or MongoDB connection fails

- ✅ Check that `.env` file exists in `backend/` directory
- ✅ Verify `MONGODB_URI` is set correctly
- ✅ Ensure `.env` file is not in `.gitignore` (but don't commit it!)
- ✅ Restart the server after changing `.env` file

### Frontend: API calls fail or return 404

- ✅ Check that `.env` file exists in `frontend/` directory
- ✅ Verify `VITE_API_BASE_URL` is set correctly
- ✅ Ensure variable name starts with `VITE_`
- ✅ Rebuild the frontend after changing `.env` file:
  ```bash
  npm run build
  ```

### Environment variables not loading

- ✅ Check file name is exactly `.env` (not `.env.local` or `.env.txt`)
- ✅ Ensure no spaces around `=` sign in `.env` file
- ✅ Don't use quotes around values (unless the value itself contains spaces)
- ✅ Restart development server after changes

---

## Quick Setup Checklist

### Backend Setup
- [ ] Create `backend/.env` file
- [ ] Set `MONGODB_URI`
- [ ] Set `PORT` (optional, defaults to 3000)
- [ ] Set `FRONTEND_URL`
- [ ] Set `NODE_ENV`
- [ ] Verify MongoDB connection works

### Frontend Setup
- [ ] Create `frontend/.env` file
- [ ] Set `VITE_API_BASE_URL`
- [ ] Rebuild frontend (`npm run build`)
- [ ] Verify API calls work

---

**Last Updated:** 2025-01-27

