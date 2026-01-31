# NoteZ Development Startup Script
# This script starts both the backend and frontend servers

Write-Host "🚀 Starting NoteZ Application..." -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running (optional - will fail gracefully if not)
Write-Host "📦 Checking MongoDB connection..." -ForegroundColor Yellow
$mongoCheck = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($mongoCheck) {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB is not running on localhost:27017" -ForegroundColor Yellow
    Write-Host "   The app will try to connect but may fail if MongoDB is not installed/running" -ForegroundColor Yellow
    Write-Host "   Install MongoDB or use MongoDB Atlas (update MONGODB_URI in .env)" -ForegroundColor Yellow
}
Write-Host ""

# Check if .env file exists
if (-not (Test-Path "notez-backend\.env")) {
    Write-Host "⚠️  .env file not found in notez-backend directory" -ForegroundColor Yellow
    Write-Host "   Creating .env file from template..." -ForegroundColor Yellow
    
    $envContent = @"
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
"@
    
    $envContent | Out-File -FilePath "notez-backend\.env" -Encoding utf8
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host ""
}

# Start Backend Server
Write-Host "🔧 Starting Backend Server (Port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\notez-backend'; npm start" -WindowStyle Normal

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "🎨 Starting Frontend Server (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "🔧 Backend API: http://localhost:3001" -ForegroundColor Yellow
Write-Host "💚 Health Check: http://localhost:3001/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Note: Make sure MongoDB is running or update MONGODB_URI in notez-backend/.env" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window (servers will continue running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

