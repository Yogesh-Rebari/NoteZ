# 🔧 Fix MongoDB Connection Issue

## Current Problem

The backend is trying to connect to MongoDB Atlas but failing with:
```
Database connection failed: querySrv ENOTFOUND _mongodb._tcp.cluster01.lmuuhcj.mongodb.net
```

## ✅ Solution Options

### Option 1: Fix MongoDB Atlas Connection (Recommended)

Your `.env` file has a MongoDB Atlas connection string, but it's not working. Fix it:

1. **Go to MongoDB Atlas:** https://cloud.mongodb.com
2. **Sign in** to your account
3. **Check your cluster:**
   - Go to "Database" → "Browse Collections"
   - Make sure your cluster is running (not paused)
4. **Get correct connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It should look like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/notez?retryWrites=true&w=majority`
5. **Update `.env` file:**
   - Open `notez-backend/.env`
   - Replace the `MONGODB_URI` line with your new connection string
   - Make sure to replace `<password>` with your actual password
6. **Restart backend:**
   - Stop backend (Ctrl+C in backend window)
   - Run `npm start` again

### Option 2: Use Local MongoDB

1. **Install MongoDB:**
   - Download: https://www.mongodb.com/try/download/community
   - Install MongoDB Community Edition
   
2. **Start MongoDB:**
   ```bash
   # Windows (if installed as service)
   net start MongoDB
   
   # Or run manually
   mongod
   ```

3. **Update `.env` file:**
   - Open `notez-backend/.env`
   - Change `MONGODB_URI` to:
     ```
     MONGODB_URI=mongodb://localhost:27017/notez
     ```

4. **Restart backend**

### Option 3: Create New MongoDB Atlas Cluster

If your current cluster doesn't exist:

1. **Go to:** https://cloud.mongodb.com
2. **Create new cluster:**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select region closest to you
   - Click "Create"
3. **Create database user:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (SAVE THESE!)
   - Click "Add User"
4. **Whitelist IP:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"
5. **Get connection string:**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
6. **Update `.env`:**
   ```
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/notez?retryWrites=true&w=majority
   ```
   Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with actual values
7. **Restart backend**

## ✅ Verification

After fixing MongoDB connection:

1. **Check backend terminal** - should show:
   ```
   ✅ Database connected successfully
   🚀 NoteZ API server running on port 3001
   ```

2. **Test health endpoint:**
   - Open: http://localhost:3001/health
   - Should show: `"database": { "connected": true }`

3. **Test registration/login:**
   - Go to: http://localhost:3000
   - Try registering a new account
   - Should work now!

## ⚠️ Important Notes

- **The backend will now start even if MongoDB is not connected** (for development)
- **But registration/login will fail** until MongoDB is connected
- **Fix MongoDB connection for full functionality**

## 🆘 Still Having Issues?

1. **Check MongoDB Atlas cluster status** - make sure it's not paused
2. **Verify credentials** - username and password are correct
3. **Check IP whitelist** - your IP is allowed (or "Allow from anywhere")
4. **Test connection string** - try connecting with MongoDB Compass
5. **Check network** - firewall not blocking MongoDB ports

