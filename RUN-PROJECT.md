# 🚀 How to Run NoteZ Project in Browser

## Quick Start

### Option 1: Use the Startup Script

**Double-click:** `start-both.bat`

This will start both servers automatically.

---

### Option 2: Manual Start

#### Step 1: Start Backend Server

**Open Terminal 1:**
```bash
cd notez-backend
npm start
```

**Wait for:**
```
✅ MongoDB connected: cluster01.cqqvxgw.mongodb.net
🚀 NoteZ API server running on port 3001
```

#### Step 2: Start Frontend Server

**Open Terminal 2:**
```bash
npm start
```

**Wait for:**
- Browser should open automatically at `http://localhost:3000`
- Or manually open: http://localhost:3000

---

## ✅ Verification

### Check Backend:
- **Health Check:** http://localhost:3001/health
- Should show: `"database": { "connected": true }`

### Check Frontend:
- **App URL:** http://localhost:3000
- Should show the NoteZ login/register page

---

## 🎯 What to Do Next

1. **Register a New Account:**
   - Go to: http://localhost:3000
   - Click "Register" or "Sign Up"
   - Fill in your details
   - Create account

2. **Login:**
   - Use your registered credentials
   - Access the dashboard

3. **Create a Group:**
   - Create your first study group
   - Add notes
   - Invite members

---

## ⚠️ Troubleshooting

### Backend Not Starting

**Check:**
- MongoDB Atlas connection is working
- `.env` file has correct credentials
- Port 3001 is not already in use

**Fix:**
```bash
# Check if port is in use
netstat -ano | findstr :3001

# Kill process if needed
taskkill /PID <PID> /F
```

### Frontend Not Starting

**Check:**
- Port 3000 is not already in use
- Backend is running first

**Fix:**
```bash
# Check if port is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F
```

### MongoDB Connection Failed

**Check backend window for:**
- `✅ MongoDB connected` = Success!
- `❌ Database connection failed` = Problem

**Fix:**
- Verify credentials in `.env`
- Check Atlas cluster is not paused
- Verify IP is whitelisted in Atlas

### Proxy Error (ECONNREFUSED)

**Problem:** Frontend can't connect to backend

**Fix:**
- Make sure backend is running on port 3001
- Check backend terminal for errors
- Restart backend server

---

## 📊 Server Status

### Backend (Port 3001)
- **Status:** Check terminal window
- **Health:** http://localhost:3001/health
- **API:** http://localhost:3001/api

### Frontend (Port 3000)
- **Status:** Check terminal window
- **App:** http://localhost:3000
- **Auto-reload:** Enabled

---

## 🎉 Success Indicators

✅ **Backend Running:**
```
✅ MongoDB connected: cluster01.cqqvxgw.mongodb.net
🚀 NoteZ API server running on port 3001
```

✅ **Frontend Running:**
```
Compiled successfully!
You can now view notez-frontend in the browser.
  Local:            http://localhost:3000
```

✅ **Browser:**
- Opens automatically to http://localhost:3000
- Shows login/register page
- No console errors

---

## 💡 Pro Tips

1. **Keep both terminals open** - one for backend, one for frontend
2. **Check server windows** for any error messages
3. **Use browser DevTools** (F12) to see frontend errors
4. **Test health endpoint** first to verify backend
5. **Clear browser cache** if you see old errors

---

## 🆘 Still Having Issues?

1. **Check both server windows** for error messages
2. **Verify MongoDB Atlas** connection in backend window
3. **Test health endpoint:** http://localhost:3001/health
4. **Check browser console** (F12) for frontend errors
5. **Restart both servers** if needed

---

**Happy coding! 🚀**

