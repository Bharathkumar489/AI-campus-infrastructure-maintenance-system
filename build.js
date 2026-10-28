const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('  [Render Build] Starting Multi-Tier CampusCare AI Build');
console.log('================================================================');

// 1. Ensure backend dependencies are installed
const backendDir = path.resolve(__dirname, 'backend');
if (fs.existsSync(backendDir)) {
  const backendModules = path.join(backendDir, 'node_modules');
  if (!fs.existsSync(backendModules)) {
    console.log('[Render Build] Installing backend dependencies...');
    execSync('npm install --prefix backend --production=false', { stdio: 'inherit' });
  } else {
    console.log('[Render Build] Backend dependencies already present.');
  }
}

// 2. Ensure frontend dependencies are installed
const frontendDir = path.resolve(__dirname, 'frontend');
if (fs.existsSync(frontendDir)) {
  const frontendModules = path.join(frontendDir, 'node_modules');
  if (!fs.existsSync(frontendModules)) {
    console.log('[Render Build] Installing frontend dependencies...');
    execSync('npm install --prefix frontend --production=false', { stdio: 'inherit' });
  } else {
    console.log('[Render Build] Frontend dependencies already present.');
  }
}

// 3. Compile Frontend Vite Production Bundle
console.log('[Render Build] Compiling Vite production bundle in frontend/ ...');
execSync('npm run build --prefix frontend', { stdio: 'inherit' });

console.log('================================================================');
console.log('  [Render Build] BUILD FINISHED SUCCESSFULLY!');
console.log('================================================================');
