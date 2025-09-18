#!/usr/bin/env node

/**
 * NoteZ Setup Verification Script
 * This script verifies that the NoteZ application is properly configured and ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 NoteZ Setup Verification Starting...\n');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}: ${filePath}`, 'green');
    return true;
  } else {
    log(`❌ ${description}: ${filePath} (Missing)`, 'red');
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log(`✅ ${description}: ${dirPath}`, 'green');
    return true;
  } else {
    log(`❌ ${description}: ${dirPath} (Missing)`, 'red');
    return false;
  }
}

let totalChecks = 0;
let passedChecks = 0;

function check(condition, description) {
  totalChecks++;
  if (condition) {
    log(`✅ ${description}`, 'green');
    passedChecks++;
    return true;
  } else {
    log(`❌ ${description}`, 'red');
    return false;
  }
}

// 1. Check project structure
log('\n📁 Checking Project Structure...', 'blue');

const requiredFiles = [
  ['package.json', 'Frontend package.json'],
  ['notez-backend/package.json', 'Backend package.json'],
  ['src/App.js', 'Main App component'],
  ['src/contexts/AuthContext.js', 'Authentication context'],
  ['src/contexts/SocketContext.js', 'Socket context'],
  ['src/utils/api.js', 'API utility'],
  ['notez-backend/src/app.js', 'Backend main application'],
  ['notez-backend/src/config/index.js', 'Backend configuration'],
  ['notez-backend/src/config/database.js', 'Database configuration'],
  ['notez-backend/src/config/socket.js', 'Socket configuration'],
  ['vercel.json', 'Vercel deployment config'],
  ['notez-backend/Procfile', 'Backend deployment config']
];

requiredFiles.forEach(([file, description]) => {
  check(checkFile(file, description), `File exists: ${file}`);
});

const requiredDirectories = [
  ['src/components', 'Frontend components directory'],
  ['src/pages', 'Frontend pages directory'],
  ['notez-backend/src/controllers', 'Backend controllers directory'],
  ['notez-backend/src/models', 'Backend models directory'],
  ['notez-backend/src/routes', 'Backend routes directory'],
  ['notez-backend/src/middleware', 'Backend middleware directory']
];

requiredDirectories.forEach(([dir, description]) => {
  check(checkDirectory(dir, description), `Directory exists: ${dir}`);
});

// 2. Check package.json dependencies
log('\n📦 Checking Dependencies...', 'blue');

try {
  const frontendPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const backendPkg = JSON.parse(fs.readFileSync('notez-backend/package.json', 'utf8'));

  // Frontend dependencies
  const frontendDeps = ['react', 'react-dom', 'react-router-dom', 'socket.io-client', 'lucide-react', 'prop-types'];
  frontendDeps.forEach(dep => {
    check(
      frontendPkg.dependencies?.[dep] || frontendPkg.devDependencies?.[dep],
      `Frontend dependency: ${dep}`
    );
  });

  // Backend dependencies
  const backendDeps = ['express', 'mongoose', 'socket.io', 'jsonwebtoken', 'bcryptjs', 'cors', 'helmet'];
  backendDeps.forEach(dep => {
    check(
      backendPkg.dependencies?.[dep] || backendPkg.devDependencies?.[dep],
      `Backend dependency: ${dep}`
    );
  });
} catch (error) {
  log(`❌ Error reading package.json files: ${error.message}`, 'red');
}

// 3. Check environment configuration
log('\n⚙️ Checking Environment Configuration...', 'blue');

const envExists = fs.existsSync('notez-backend/.env');
const envExampleExists = fs.existsSync('notez-backend/env.example');

check(envExampleExists, 'Environment example file exists');

if (envExists) {
  log('✅ Environment file exists (notez-backend/.env)', 'green');
  
  try {
    const envContent = fs.readFileSync('notez-backend/.env', 'utf8');
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'CORS_ORIGIN'];
    
    requiredEnvVars.forEach(envVar => {
      check(
        envContent.includes(`${envVar}=`),
        `Environment variable configured: ${envVar}`
      );
    });
  } catch (error) {
    log(`❌ Error reading .env file: ${error.message}`, 'red');
  }
} else {
  log('⚠️ Environment file not found (notez-backend/.env)', 'yellow');
  log('  Create it from env.example and configure your settings', 'yellow');
}

// 4. Check key components
log('\n🔧 Checking Key Components...', 'blue');

try {
  // Check AuthContext
  const authContext = fs.readFileSync('src/contexts/AuthContext.js', 'utf8');
  check(authContext.includes('inMemoryToken'), 'AuthContext uses in-memory token storage');
  check(authContext.includes('export const getAuthToken'), 'AuthContext exports getAuthToken function');

  // Check API utility
  const apiUtil = fs.readFileSync('src/utils/api.js', 'utf8');
  check(apiUtil.includes('setAuthToken'), 'API utility has setAuthToken function');
  check(apiUtil.includes('Authorization'), 'API utility sets Authorization header');

  // Check App.js
  const appJs = fs.readFileSync('src/App.js', 'utf8');
  check(appJs.includes('ProtectedRoute'), 'App.js uses ProtectedRoute component');
  check(appJs.includes('AuthProvider'), 'App.js includes AuthProvider');
  check(appJs.includes('SocketProvider'), 'App.js includes SocketProvider');

  // Check backend app.js
  const backendApp = fs.readFileSync('notez-backend/src/app.js', 'utf8');
  check(backendApp.includes('helmet'), 'Backend uses security middleware');
  check(backendApp.includes('cors'), 'Backend uses CORS middleware');
  check(backendApp.includes('Socket'), 'Backend includes Socket.io');

} catch (error) {
  log(`❌ Error checking components: ${error.message}`, 'red');
}

// 5. Check documentation
log('\n📚 Checking Documentation...', 'blue');

const docFiles = [
  ['DEPLOYMENT.md', 'Deployment guide'],
  ['TESTING.md', 'Testing guide'],
  ['docs/API.md', 'API documentation']
];

docFiles.forEach(([file, description]) => {
  check(checkFile(file, description), `Documentation: ${description}`);
});

// 6. Summary
log('\n📊 Verification Summary', 'cyan');
log('─'.repeat(50), 'cyan');

const successRate = Math.round((passedChecks / totalChecks) * 100);

if (successRate === 100) {
  log(`🎉 Perfect! All ${totalChecks} checks passed (${successRate}%)`, 'green');
  log('\n✨ Your NoteZ application is ready for deployment!', 'green');
} else if (successRate >= 90) {
  log(`🎯 Excellent! ${passedChecks}/${totalChecks} checks passed (${successRate}%)`, 'green');
  log('\n✅ Your NoteZ application is almost ready for deployment!', 'green');
} else if (successRate >= 75) {
  log(`⚠️ Good! ${passedChecks}/${totalChecks} checks passed (${successRate}%)`, 'yellow');
  log('\n🔧 Address the failing checks before deployment.', 'yellow');
} else {
  log(`❌ ${passedChecks}/${totalChecks} checks passed (${successRate}%)`, 'red');
  log('\n🚨 Several issues need to be resolved before deployment.', 'red');
}

// 7. Next steps
if (successRate < 100) {
  log('\n🚀 Next Steps:', 'blue');
  log('1. Review the failed checks above', 'blue');
  log('2. Fix any missing files or configurations', 'blue');
  log('3. Run this script again to verify fixes', 'blue');
  log('4. Follow the deployment guide in DEPLOYMENT.md', 'blue');
} else {
  log('\n🚀 Ready for Deployment:', 'blue');
  log('1. Follow the deployment guide in DEPLOYMENT.md', 'blue');
  log('2. Set up your MongoDB Atlas database', 'blue');
  log('3. Configure environment variables for production', 'blue');
  log('4. Deploy backend to Railway/Render', 'blue');
  log('5. Deploy frontend to Vercel', 'blue');
  log('6. Test the complete application flow', 'blue');
}

log('\n📖 Documentation:', 'cyan');
log('• Deployment Guide: DEPLOYMENT.md', 'cyan');
log('• Testing Guide: TESTING.md', 'cyan');
log('• API Documentation: docs/API.md', 'cyan');

log('\nVerification complete! 🎯\n');

process.exit(successRate === 100 ? 0 : 1);
