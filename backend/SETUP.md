# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Set Up MongoDB

### Option A: Local MongoDB
1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use connection: `mongodb://localhost:27017/onam-festival`

### Option B: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a free cluster
4. Get connection string from "Connect" button
5. Replace `<password>` with your database password

## Step 3: Configure Environment

Create `.env` file in `backend/` directory:

```env
MONGODB_URI=mongodb://localhost:27017/onam-festival
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/onam-festival?retryWrites=true&w=majority

PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## Step 4: Start Backend Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## Step 5: Configure Frontend

Create `.env` file in `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Step 6: Test Connection

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Submit an order from checkout page
4. Check backend console for order creation

## Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running
- Verify connection string in `.env`
- Check firewall settings

### CORS Error
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check if backend server is running

### Port Already in Use
- Change `PORT` in backend `.env`
- Update `VITE_API_BASE_URL` in frontend `.env`

