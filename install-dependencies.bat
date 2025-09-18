@echo off
echo Installing NoteZ Dependencies...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.
echo npm version:
npm --version
echo.

REM Install dependencies
echo Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies
    echo Please check the error messages above
    echo.
    pause
    exit /b 1
)

echo.
echo SUCCESS: All dependencies installed successfully!
echo.
echo Next steps:
echo 1. Run: npm start
echo 2. Open http://localhost:3000 in your browser
echo.
pause

