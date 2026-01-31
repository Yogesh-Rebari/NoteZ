# How to Run NoteZ in Browser

## Quick Start

### Option 1: Using Startup Scripts (Recommended)

**Windows PowerShell:**
```powershell
.\start-dev.ps1
```

**Windows Command Prompt:**
```cmd
start-dev.bat
```

### Option 2: Manual Start

#### Step 1: Install Dependencies (if not already installed)

**Backend:**
```bash
cd notez-backend
npm install
```

**Frontend:**
```bash
npm install
```

#### Step 2: Configure Environment Variables

Create a `.env` file in the `notez-backend` directory:

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

**Note:** You can copy from `notez-backend/.env.example` if it exists.

#### Step 3: Start MongoDB (Required)

**Option A: Local MongoDB**
- Install MongoDB from https://www.mongodb.com/try/download/community
- Start MongoDB service:
  ```bash
  # Windows (if installed as service)
  net start MongoDB
  
  # Or run mongod manually
  mongod
  ```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string and update `MONGODB_URI` in `.env`:
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notez?retryWrites=true&w=majority
  ```

#### Step 4: Start Backend Server

Open a terminal and run:
```bash
cd notez-backend
npm start
```

You should see:
```
✅ Database connected successfully
🚀 NoteZ API server running on port 3001
```

#### Step 5: Start Frontend Server

Open another terminal and run:
```bash
npm start
```

The React app will automatically open in your browser at `http://localhost:3000`

## Access Points

- **Frontend Application:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Health Check:** http://localhost:3001/health
- **API Documentation:** http://localhost:3001/api (if available)

## Troubleshooting

### Backend won't start

1. **MongoDB Connection Error:**
   - Make sure MongoDB is running
   - Check `MONGODB_URI` in `.env` file
   - For MongoDB Atlas, ensure your IP is whitelisted

2. **Port Already in Use:**
   - Change `PORT` in `.env` file
   - Or stop the process using port 3001:
     ```bash
     # Windows
     netstat -ano | findstr :3001
     taskkill /PID <PID> /F
     ```

3. **Missing Environment Variables:**
   - Ensure `.env` file exists in `notez-backend` directory
   - Check that `JWT_SECRET` and `MONGODB_URI` are set

### Frontend won't start

1. **Port Already in Use:**
   - Change port by setting `PORT=3001` in environment
   - Or stop the process using port 3000

2. **Cannot Connect to Backend:**
   - Ensure backend is running on port 3001
   - Check `proxy` setting in `package.json` (should be `http://localhost:3001`)
   - Check CORS settings in backend

### Database Issues

1. **Connection Timeout:**
   - Check MongoDB is running: `mongosh` or `mongo`
   - Verify connection string is correct
   - For MongoDB Atlas, check network access settings

2. **Authentication Failed:**
   - Verify MongoDB credentials in connection string
   - Check database user permissions

## Development Tips

- Backend runs on port **3001**
- Frontend runs on port **3000**
- Frontend proxies API requests to backend automatically
- Hot reload is enabled for both servers
- Check browser console for frontend errors
- Check terminal for backend errors

## Next Steps

1. Register a new account
2. Create a group
3. Add notes to your group
4. Invite members to collaborate

Enjoy using NoteZ! 🎉

