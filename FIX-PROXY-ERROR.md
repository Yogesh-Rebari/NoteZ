# Fix: Proxy Error - ECONNREFUSED

## Problem
```
Proxy error: Could not proxy request /api/auth/register from localhost:3000 to http://localhost:3001/ (ECONNREFUSED).
```

This error means the **backend server is not running** on port 3001.

## Solution

### Step 1: Create .env File (if missing)

The backend needs a `.env` file in the `notez-backend` directory. Create it with this content:

**File: `notez-backend/.env`**
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

### Step 2: Start Backend Server

Open a **new terminal/command prompt** and run:

```bash
cd notez-backend
npm start
```

You should see output like:
```
✅ Database connected successfully
🚀 NoteZ API server running on port 3001
📱 Environment: development
🔗 API URL: http://localhost:3001/api
```

### Step 3: Verify Backend is Running

Open your browser and go to:
- **Health Check:** http://localhost:3001/health

You should see a JSON response with server status.

### Step 4: Test Registration/Login

Now go back to your frontend (http://localhost:3000) and try registering/logging in again.

## Common Issues

### Issue 1: MongoDB Not Running

**Error:** `Database connection failed: connect ECONNREFUSED`

**Solution:**
- **Option A:** Install and start MongoDB locally
  - Download: https://www.mongodb.com/try/download/community
  - Start MongoDB service
  
- **Option B:** Use MongoDB Atlas (Cloud - Free)
  1. Sign up at https://www.mongodb.com/cloud/atlas
  2. Create a free cluster
  3. Get connection string
  4. Update `MONGODB_URI` in `.env`:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notez?retryWrites=true&w=majority
     ```

### Issue 2: Port 3001 Already in Use

**Error:** `Port 3001 is already in use`

**Solution:**
```bash
# Windows - Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in .env file
PORT=3002
```

### Issue 3: Missing Dependencies

**Error:** `Cannot find module '...'`

**Solution:**
```bash
cd notez-backend
npm install
```

### Issue 4: Backend Starts But Frontend Still Can't Connect

**Check:**
1. Backend is running on port 3001 (check terminal output)
2. Frontend proxy is set correctly in `package.json`:
   ```json
   "proxy": "http://localhost:3001"
   ```
3. Restart frontend after starting backend:
   ```bash
   # Stop frontend (Ctrl+C)
   # Then restart
   npm start
   ```

## Quick Test

After starting backend, test the API directly:

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test registration endpoint
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123"}'
```

## Still Having Issues?

1. **Check backend terminal** for error messages
2. **Check browser console** (F12) for detailed error info
3. **Verify both servers are running:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001/health

4. **Check firewall** - ensure ports 3000 and 3001 are not blocked

