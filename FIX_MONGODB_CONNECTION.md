# Fix MongoDB Connection Error

## 🔴 Error You're Seeing

```
Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

**This means:** Render's servers are trying to connect to MongoDB Atlas, but they're being blocked because the IP addresses aren't allowed.

---

## ✅ Quick Fix (5 minutes)

### Step 1: Whitelist All IPs in MongoDB Atlas

1. **Go to MongoDB Atlas:**
   - Visit: https://cloud.mongodb.com
   - Log in with your account

2. **Navigate to Network Access:**
   - Click on your project/cluster (onamtesting)
   - Click **"Network Access"** in the left sidebar

3. **Add IP Address:**
   - Click the **"Add IP Address"** button (green button)
   - Click **"Allow Access from Anywhere"**
   - This adds `0.0.0.0/0` which allows ALL IP addresses
   - Click **"Confirm"**

4. **Wait 1-2 minutes:**
   - MongoDB Atlas needs time to update the whitelist

### Step 2: Check Your Connection String

Make sure your `MONGODB_URI` in Render environment variables is:

```
mongodb+srv://gauravkhandelwal205_db_user:gauravisgreat@onamtesting.spknezr.mongodb.net/onam-festival?retryWrites=true&w=majority
```

**Verify in Render:**
1. Go to your backend service dashboard
2. Click **"Environment"** tab
3. Check `MONGODB_URI` value matches exactly (with `/onam-festival` and query params)

### Step 3: Restart Your Backend Service

After whitelisting IPs:

1. Go to Render dashboard
2. Click on your backend service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
   - OR just wait - it should auto-retry and connect

### Step 4: Verify Connection

Check your Render logs - you should see:
```
✅ MongoDB Connected: ac-keyhg4q-shard-00-00.spknezr.mongodb.net
📦 Database: onam-festival
```

---

## 📸 Step-by-Step Screenshots Guide

### Step 1: Login to MongoDB Atlas
- Go to: https://cloud.mongodb.com
- Sign in with your credentials

### Step 2: Select Your Project
- You should see your cluster: **onamtesting**

### Step 3: Click "Network Access"
- Left sidebar menu
- Under "Security" section

### Step 4: Add IP Address
- Click green **"Add IP Address"** button
- Click **"Allow Access from Anywhere"** button
- Click **"Confirm"**

### Step 5: Wait
- Status will show "Adding..."
- Wait 1-2 minutes for it to complete
- You'll see a new entry with IP: `0.0.0.0/0`

---

## 🔍 Verify Your Connection String

Your complete connection string should be:

```
mongodb+srv://gauravkhandelwal205_db_user:gauravisgreat@onamtesting.spknezr.mongodb.net/onam-festival?retryWrites=true&w=majority
```

**Breakdown:**
- ✅ Username: `gauravkhandelwal205_db_user`
- ✅ Password: `gauravisgreat`
- ✅ Cluster: `onamtesting.spknezr.mongodb.net`
- ✅ Database: `/onam-festival` ← **Important!**
- ✅ Params: `?retryWrites=true&w=majority`

---

## 🐛 Still Not Working?

### Check 1: Is the cluster running?
- Go to MongoDB Atlas → Database
- Make sure cluster status shows **"Running"** (not "Paused")
- Free tier clusters pause after 1 hour of inactivity
- If paused, click **"Resume"** and wait 2-3 minutes

### Check 2: Database user permissions
- Go to MongoDB Atlas → Database Access
- Find user: `gauravkhandelwal205_db_user`
- Make sure they have permissions (should show "Atlas admin" or similar)

### Check 3: Connection string format
- No spaces before/after the string
- Password should NOT be URL-encoded (if it has special chars)
- Database name MUST be included: `/onam-festival`

### Check 4: Render logs
- Go to Render → Your backend service → Logs tab
- Look for the exact error message
- Share error if different from the one above

---

## ✅ Success Indicators

After fixing, you should see in Render logs:

```
[INFO] ✅ MongoDB Connected: ac-keyhg4q-shard-00-00.spknezr.mongodb.net
[INFO] 📦 Database: onam-festival
[INFO] 🚀 Server running on http://localhost:10000
```

And your health endpoint should work:
- Visit: `https://your-backend.onrender.com/health`
- Should return: `{"status":"OK","message":"Onam Festival API is running",...}`

---

## 🔒 Security Note

**Current Setup (Development/Free Tier):**
- ✅ Allowing all IPs (`0.0.0.0/0`) is fine for now
- This allows any IP to connect

**For Production (Later):**
- ❌ Restrict to specific IP ranges
- ✅ Use MongoDB Atlas private endpoints if available
- ✅ Consider VPN or private network

---

## 📝 Quick Checklist

- [ ] Logged into MongoDB Atlas
- [ ] Went to Network Access
- [ ] Added IP: `0.0.0.0/0` (Allow Access from Anywhere)
- [ ] Waited 1-2 minutes
- [ ] Verified connection string in Render
- [ ] Restarted backend service
- [ ] Checked logs for "✅ MongoDB Connected"
- [ ] Tested health endpoint

---

**The Fix:** Just whitelist `0.0.0.0/0` in MongoDB Atlas Network Access! That's it! 🎯

