@echo off
echo 🚀 Starting NoteZ Application...
echo.

REM Check if MongoDB is running
echo 📦 Checking MongoDB connection...
netstat -an | find "27017" >nul
if %errorlevel% == 0 (
    echo ✅ MongoDB is running
) else (
    echo ⚠️  MongoDB is not running on localhost:27017
    echo    The app will try to connect but may fail if MongoDB is not installed/running
    echo    Install MongoDB or use MongoDB Atlas (update MONGODB_URI in .env)
)
echo.

REM Check if .env file exists
if not exist "notez-backend\.env" (
    echo ⚠️  .env file not found in notez-backend directory
    echo    Creating .env file from template...
    
    (
        echo NODE_ENV=development
        echo PORT=3001
        echo HOST=localhost
        echo MONGODB_URI=mongodb://localhost:27017/notez
        echo JWT_SECRET=dev-secret-key-minimum-32-characters-long-for-development-only
        echo JWT_EXPIRES_IN=7d
        echo JWT_REFRESH_EXPIRES_IN=30d
        echo BCRYPT_ROUNDS=12
        echo RATE_LIMIT_WINDOW=900000
        echo RATE_LIMIT_MAX=100
        echo CORS_ORIGIN=http://localhost:3000
        echo MAX_FILE_SIZE=10485760
        echo UPLOAD_DIR=uploads
        echo BASE_URL=http://localhost:3001
        echo LOG_LEVEL=info
        echo LOG_FORMAT=combined
    ) > notez-backend\.env
    
    echo ✅ .env file created
    echo.
)

REM Start Backend Server
echo 🔧 Starting Backend Server (Port 3001)...
start "NoteZ Backend" cmd /k "cd notez-backend && npm start"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend Server
echo 🎨 Starting Frontend Server (Port 3000)...
start "NoteZ Frontend" cmd /k "npm start"

echo.
echo ✅ Servers are starting!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:3001
echo 💚 Health Check: http://localhost:3001/health
echo.
echo ⚠️  Note: Make sure MongoDB is running or update MONGODB_URI in notez-backend/.env
echo.
pause

