#!/usr/bin/env node

/**
 * Redis Setup Script for Windows
 * 
 * This script helps set up Redis on Windows systems.
 * It provides multiple installation options and setup instructions.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

console.log('🪟 Setting up Redis for Windows - Duchess Pastries Checkout System\n');

// Check if Redis is already installed
function checkRedisInstallation() {
  try {
    execSync('redis-cli --version', { stdio: 'pipe' });
    console.log('✅ Redis CLI is already installed');
    return true;
  } catch (error) {
    console.log('❌ Redis CLI not found');
    return false;
  }
}

// Check if Redis server is running
function checkRedisServer() {
  try {
    execSync('redis-cli ping', { stdio: 'pipe' });
    console.log('✅ Redis server is running');
    return true;
  } catch (error) {
    console.log('❌ Redis server is not running');
    return false;
  }
}

// Check if Chocolatey is installed
function checkChocolatey() {
  try {
    execSync('choco --version', { stdio: 'pipe' });
    console.log('✅ Chocolatey is installed');
    return true;
  } catch (error) {
    console.log('❌ Chocolatey not found');
    return false;
  }
}

// Check if Docker is installed
function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'pipe' });
    console.log('✅ Docker is installed');
    return true;
  } catch (error) {
    console.log('❌ Docker not found');
    return false;
  }
}

// Install Redis using Chocolatey
function installRedisWithChocolatey() {
  try {
    console.log('📦 Installing Redis using Chocolatey...');
    execSync('choco install redis-64 -y', { stdio: 'inherit' });
    console.log('✅ Redis installed successfully via Chocolatey');
    return true;
  } catch (error) {
    console.error('❌ Failed to install Redis via Chocolatey:', error.message);
    return false;
  }
}

// Install Redis using Docker
function installRedisWithDocker() {
  try {
    console.log('🐳 Installing Redis using Docker...');
    execSync('docker run -d -p 6379:6379 --name redis redis:latest', { stdio: 'inherit' });
    console.log('✅ Redis container started successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to start Redis container:', error.message);
    return false;
  }
}

// Download Redis for Windows
function downloadRedisForWindows() {
  return new Promise((resolve, reject) => {
    console.log('📥 Downloading Redis for Windows...');
    
    const downloadUrl = 'https://github.com/microsoftarchive/redis/releases/download/win-3.0.504/Redis-x64-3.0.504.zip';
    const filePath = path.join(process.cwd(), 'redis-windows.zip');
    
    const file = fs.createWriteStream(filePath);
    
    https.get(downloadUrl, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('✅ Redis for Windows downloaded');
        console.log(`📁 File saved to: ${filePath}`);
        console.log('\n📋 Manual Installation Steps:');
        console.log('1. Extract the downloaded zip file');
        console.log('2. Copy the extracted files to C:\\Redis\\');
        console.log('3. Add C:\\Redis\\ to your PATH environment variable');
        console.log('4. Run: redis-server.exe');
        resolve(true);
      });
    }).on('error', (err) => {
      console.error('❌ Download failed:', err.message);
      reject(err);
    });
  });
}

// Create Redis service script
function createRedisServiceScript() {
  const scriptContent = `@echo off
echo Starting Redis Server...
cd /d C:\\Redis
redis-server.exe
pause
`;

  const scriptPath = path.join(process.cwd(), 'start-redis.bat');
  fs.writeFileSync(scriptPath, scriptContent);
  console.log(`✅ Created Redis startup script: ${scriptPath}`);
}

// Create environment file
function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    const envContent = `# Redis Configuration for Windows
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Enable Redis features
REDIS_ENABLE_CHECKOUT_SESSIONS=true
REDIS_ENABLE_DELIVERY_CACHE=true
REDIS_ENABLE_COUPON_CACHE=true
REDIS_ENABLE_USER_SESSIONS=true
REDIS_ENABLE_STATISTICS=true
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file with Redis configuration');
  } else {
    console.log('ℹ️  .env.local file already exists');
  }
}

// Main setup function
async function setupRedisWindows() {
  console.log('🔍 Checking current Redis installation...');
  
  // Check if Redis is already installed and running
  if (checkRedisInstallation() && checkRedisServer()) {
    console.log('\n🎉 Redis is already installed and running!');
    createEnvFile();
    console.log('\n✅ Setup complete! You can now use Redis with your checkout system.');
    return;
  }
  
  console.log('\n📋 Redis Installation Options for Windows:\n');
  
  // Option 1: Chocolatey
  if (checkChocolatey()) {
    console.log('1️⃣  Installing Redis via Chocolatey...');
    if (installRedisWithChocolatey()) {
      createEnvFile();
      createRedisServiceScript();
      console.log('\n✅ Redis installed successfully via Chocolatey!');
      console.log('🚀 Start Redis server: redis-server');
      return;
    }
  }
  
  // Option 2: Docker
  if (checkDocker()) {
    console.log('\n2️⃣  Installing Redis via Docker...');
    if (installRedisWithDocker()) {
      createEnvFile();
      console.log('\n✅ Redis container started successfully!');
      console.log('🚀 Redis is running on localhost:6379');
      return;
    }
  }
  
  // Option 3: Manual download
  console.log('\n3️⃣  Manual Installation (Recommended for Windows)');
  try {
    await downloadRedisForWindows();
    createEnvFile();
    createRedisServiceScript();
    console.log('\n📋 Next Steps:');
    console.log('1. Extract the downloaded zip file');
    console.log('2. Copy files to C:\\Redis\\');
    console.log('3. Add C:\\Redis\\ to your PATH');
    console.log('4. Run: redis-server.exe');
    console.log('5. Test: redis-cli ping');
  } catch (error) {
    console.error('❌ Manual download failed:', error.message);
  }
  
  // Option 4: WSL2
  console.log('\n4️⃣  Alternative: Use WSL2 (Windows Subsystem for Linux)');
  console.log('📋 WSL2 Installation Steps:');
  console.log('1. Install WSL2: wsl --install');
  console.log('2. Install Redis: sudo apt install redis-server');
  console.log('3. Start Redis: sudo service redis-server start');
  console.log('4. Update .env.local: REDIS_HOST=localhost');
  
  console.log('\n📚 Additional Resources:');
  console.log('- Redis for Windows: https://github.com/microsoftarchive/redis');
  console.log('- Docker Redis: https://hub.docker.com/_/redis');
  console.log('- WSL2 Setup: https://docs.microsoft.com/en-us/windows/wsl/install');
}

// Run setup
setupRedisWindows().catch(console.error);
