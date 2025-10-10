#!/usr/bin/env node

/**
 * Redis Setup Script
 * 
 * This script helps set up Redis for the checkout system.
 * It validates the Redis connection and provides setup instructions.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Redis for Duchess Pastries Checkout System\n');

// Check if Redis is installed
function checkRedisInstallation() {
  try {
    execSync('redis-cli --version', { stdio: 'pipe' });
    console.log('✅ Redis CLI is installed');
    return true;
  } catch (error) {
    console.log('❌ Redis CLI not found');
    return false;
  }
}

// Check Redis connection
function checkRedisConnection() {
  try {
    execSync('redis-cli ping', { stdio: 'pipe' });
    console.log('✅ Redis server is running');
    return true;
  } catch (error) {
    console.log('❌ Redis server is not running');
    return false;
  }
}

// Create environment file if it doesn't exist
function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    const envContent = `# Redis Configuration
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

// Install Redis dependencies
function installDependencies() {
  try {
    console.log('📦 Installing Redis dependencies...');
    execSync('npm install redis ioredis', { stdio: 'inherit' });
    console.log('✅ Redis dependencies installed');
  } catch (error) {
    console.error('❌ Failed to install Redis dependencies:', error.message);
  }
}

// Main setup function
async function setupRedis() {
  console.log('🔍 Checking Redis installation...');
  const redisInstalled = checkRedisInstallation();
  
  if (!redisInstalled) {
    console.log('\n📋 Redis Installation Instructions:');
    console.log('1. Install Redis on your system:');
    console.log('   - Windows: Download from https://redis.io/download');
    console.log('   - macOS: brew install redis');
    console.log('   - Ubuntu/Debian: sudo apt-get install redis-server');
    console.log('   - CentOS/RHEL: sudo yum install redis');
    console.log('\n2. Start Redis server:');
    console.log('   - Windows: redis-server');
    console.log('   - macOS/Linux: redis-server');
    console.log('\n3. Run this script again after installation');
    return;
  }
  
  console.log('\n🔍 Checking Redis connection...');
  const redisRunning = checkRedisConnection();
  
  if (!redisRunning) {
    console.log('\n📋 Redis Server Setup:');
    console.log('1. Start Redis server:');
    console.log('   - Windows: redis-server');
    console.log('   - macOS/Linux: redis-server');
    console.log('\n2. Or start Redis as a service:');
    console.log('   - macOS: brew services start redis');
    console.log('   - Ubuntu: sudo systemctl start redis');
    console.log('\n3. Run this script again after starting Redis');
    return;
  }
  
  console.log('\n📝 Setting up environment...');
  createEnvFile();
  
  console.log('\n📦 Installing dependencies...');
  installDependencies();
  
  console.log('\n✅ Redis setup completed successfully!');
  console.log('\n🚀 Next steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Test Redis connection: curl http://localhost:3000/api/redis/health');
  console.log('3. Check checkout system with Redis storage');
  
  console.log('\n📊 Redis Features Enabled:');
  console.log('- ✅ Checkout session storage');
  console.log('- ✅ Delivery charge caching');
  console.log('- ✅ Coupon caching');
  console.log('- ✅ User session tracking');
  console.log('- ✅ Statistics collection');
}

// Run setup
setupRedis().catch(console.error);





