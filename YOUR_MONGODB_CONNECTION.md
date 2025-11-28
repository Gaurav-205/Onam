# Your MongoDB Connection String

## ✅ Your MongoDB Atlas Connection Details

**Connection String (with database name):**
```
mongodb+srv://gauravkhandelwal205_db_user:gauravisgreat@onamtesting.spknezr.mongodb.net/onam-festival?retryWrites=true&w=majority
```

## 🔧 Where to Use This

### 1. Render Backend Environment Variables

When deploying backend on Render, add this as environment variable:

**Variable Name:** `MONGODB_URI`  
**Variable Value:** 
```
mongodb+srv://gauravkhandelwal205_db_user:gauravisgreat@onamtesting.spknezr.mongodb.net/onam-festival?retryWrites=true&w=majority
```

### 2. Local Development (.env file)

Create `backend/.env` file:
```env
MONGODB_URI=mongodb+srv://gauravkhandelwal205_db_user:gauravisgreat@onamtesting.spknezr.mongodb.net/onam-festival?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## ✅ Connection String Breakdown

- **Username:** `gauravkhandelwal205_db_user`
- **Password:** `gauravisgreat`
- **Cluster:** `onamtesting.spknezr.mongodb.net`
- **Database:** `onam-festival`
- **Parameters:** `retryWrites=true&w=majority`

## 🔒 Security Note

⚠️ **IMPORTANT:** 
- This file contains sensitive credentials
- **DO NOT** commit this file to Git
- Add `YOUR_MONGODB_CONNECTION.md` to `.gitignore` if you store credentials here
- Keep your MongoDB password secure

## 🧪 Test Connection

To test if the connection string works:

1. **Backend Server:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Check console for: `✅ MongoDB Connected`

2. **Direct MongoDB Test:**
   ```bash
   # Install MongoDB Compass or use mongosh
   # Connect using the connection string
   ```

## 📝 Quick Reference

**For Render Deployment:**
- Go to your backend service → Environment tab
- Add variable: `MONGODB_URI`
- Value: The full connection string above

**For Local Testing:**
- Add to `backend/.env` file
- Restart your development server

---

**Last Updated:** 2025-01-27

