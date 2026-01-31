# 🚀 Quick Start Guide - Run NoteZ in Browser

## Easiest Way: Use the Startup Script

**Double-click:** `start-both.bat`

This will:
- ✅ Create `.env` file if needed
- ✅ Start backend server (port 3001)
- ✅ Start frontend server (port 3000)
- ✅ Open browser automatically

---

## Manual Start (If Script Doesn't Work)

### Step 1: Start Backend Server

Open **Terminal 1** and run:
```bash
cd notez-backend
npm start
```

Wait for: `🚀 NoteZ API server running on port 3001`

### Step 2: Start Frontend Server

Open **Terminal 2** and run:
```bash
npm start
```

Wait for: Browser to open at `http://localhost:3000`

---

## Access Points

- **🌐 Frontend App:** http://localhost:3000
- **🔧 Backend API:** http://localhost:3001
- **💚 Health Check:** http://localhost:3001/health

---

## ⚠️ Important: MongoDB Required

The backend needs MongoDB to work. Choose one:

### Option A: MongoDB Atlas (Cloud - Free) ⭐ Recommended

1. Sign up: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `notez-backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notez?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB

1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   ```

---

## Troubleshooting

### ❌ "Proxy error: ECONNREFUSED"
**Problem:** Backend not running  
**Fix:** Start backend server (see Step 1 above)

### ❌ "Database connection failed"
**Problem:** MongoDB not running  
**Fix:** 
- Start local MongoDB, OR
- Use MongoDB Atlas (update `.env` file)

### ❌ "Port already in use"
**Problem:** Port 3000 or 3001 is taken  
**Fix:** 
```bash
# Find process using port
netstat -ano | findstr :3001

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### ❌ "Cannot find module"
**Problem:** Dependencies not installed  
**Fix:**
```bash
# Backend
cd notez-backend
npm install

# Frontend
npm install
```

---

## ✅ Success Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] MongoDB connected (check backend terminal)
- [ ] Browser opened automatically
- [ ] Can access http://localhost:3000
- [ ] Can register/login

---

## 🎉 You're Ready!

Once both servers are running:
1. Open http://localhost:3000
2. Register a new account
3. Create a group
4. Start sharing notes!

---

**Need Help?** Check the server terminal windows for error messages.

