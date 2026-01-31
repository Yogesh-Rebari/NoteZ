@echo off
title NoteZ - Starting Both Servers
color 0A
echo.
echo ========================================
echo    NoteZ - Starting Both Servers
echo ========================================
echo.

REM Check if .env exists
if not exist "notez-backend\.env" (
    echo Creating .env file...
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
    echo .env file created!
    echo.
)

echo Starting Backend Server (Port 3001)...
start "NoteZ Backend" cmd /k "cd /d %~dp0notez-backend && echo Backend Server Starting... && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Port 3000)...
start "NoteZ Frontend" cmd /k "cd /d %~dp0 && echo Frontend Server Starting... && npm start"

echo.
echo ========================================
echo    Servers are starting!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo Health:   http://localhost:3001/health
echo.
echo Browser should open automatically in a few seconds...
echo.
echo IMPORTANT: Make sure MongoDB is running!
echo - Local MongoDB on port 27017, OR
echo - Update MONGODB_URI in notez-backend/.env for MongoDB Atlas
echo.
pause

