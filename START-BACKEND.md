# 🚨 Fix: Backend Not Running (ECONNREFUSED)

## The Problem
```
Proxy error: Could not proxy request /api/auth/login from localhost:3000 to http://localhost:3001/ (ECONNREFUSED).
```

This means: **Backend server is NOT running on port 3001**

---

## ✅ Quick Fix

### Step 1: Open a New Terminal

Open a **NEW** terminal/command prompt window.

### Step 2: Navigate to Backend Directory

```bash
cd notez-backend
```

### Step 3: Start Backend Server

```bash
npm start
```

### Step 4: Wait for Success Message

You should see:
```
✅ Database connected successfully
🚀 NoteZ API server running on port 3001
📱 Environment: development
🔗 API URL: http://localhost:3001/api
```

### Step 5: Test Backend

Open browser and go to: **http://localhost:3001/health**

You should see a JSON response with server status.

### Step 6: Try Login Again

Go back to **http://localhost:3000** and try logging in again.

---

## ⚠️ Common Issues

### Issue 1: "Database connection failed"

**Error:**
```
Database connection failed: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** MongoDB is not running. Choose one:

#### Option A: Use MongoDB Atlas (Cloud - FREE) ⭐ Recommended

1. **Sign up:** https://www.mongodb.com/cloud/atlas
2. **Create Free Cluster:**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select your region
   - Click "Create"
3. **Create Database User:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
   - Click "Add User"
4. **Whitelist Your IP:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"
5. **Get Connection String:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/notez?retryWrites=true&w=majority`
6. **Update .env File:**
   - Open `notez-backend/.env`
   - Replace `MONGODB_URI` line with:
     ```
     MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/notez?retryWrites=true&w=majority
     ```
   - Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your actual credentials
7. **Restart Backend:**
   - Stop backend (Ctrl+C)
   - Run `npm start` again

#### Option B: Install Local MongoDB

1. **Download:** https://www.mongodb.com/try/download/community
2. **Install MongoDB**
3. **Start MongoDB Service:**
   ```bash
   # Windows
   net start MongoDB
   
   # Or run manually
   mongod
   ```

---

### Issue 2: "Port 3001 already in use"

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**

```bash
# Windows - Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace <PID> with actual number)
taskkill /PID <PID> /F

# Or change port in .env file
PORT=3002
```

---

### Issue 3: "Cannot find module"

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**

```bash
cd notez-backend
npm install
```

---

### Issue 4: ".env file not found"

**Solution:**

Create `notez-backend/.env` file with this content:

```env
NODE_ENV=development
PORT=3001
HOST=localhost
MONGODB_URI=mongodb://localhost:27017/notez
JWT_SECRET=dev-secret-key-minimum-32-characters-long-for-development-only
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
BASE_URL=http://localhost:3001
LOG_LEVEL=info
LOG_FORMAT=combined
```

---

## ✅ Verification Checklist

After starting backend, verify:

- [ ] Backend terminal shows: "NoteZ API server running on port 3001"
- [ ] http://localhost:3001/health returns JSON response
- [ ] No "ECONNREFUSED" errors in backend terminal
- [ ] Frontend can now connect (try login/register)

---

## 🎯 Quick Test

Once backend is running, test it:

```bash
# Test health endpoint
curl http://localhost:3001/health

# Or open in browser
# http://localhost:3001/health
```

You should see:
```json
{
  "status": "success",
  "message": "NoteZ API is running",
  "timestamp": "...",
  "database": {
    "connected": true
  }
}
```

---

## 💡 Pro Tip

**Keep both terminals open:**
- **Terminal 1:** Backend server (port 3001)
- **Terminal 2:** Frontend server (port 3000)

Or use the `start-both.bat` script to start both automatically!

---

**Still having issues?** Check the backend terminal window for specific error messages.

