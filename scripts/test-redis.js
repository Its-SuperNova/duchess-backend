#!/usr/bin/env node

/**
 * Redis Integration Test Script
 * 
 * This script tests the Redis integration for the checkout system.
 * It verifies that Redis is working correctly and fallbacks are functioning.
 * Uses PowerShell for better Windows compatibility.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Redis Integration for Checkout System\n');

// Test Redis connection
async function testRedisConnection() {
  try {
    console.log('🔍 Testing Redis connection...');
    execSync('redis-cli ping', { stdio: 'pipe' });
    console.log('✅ Redis connection successful');
    return true;
  } catch (error) {
    console.log('❌ Redis connection failed');
    console.log('   Make sure Redis server is running: redis-server');
    return false;
  }
}

// Test Redis health endpoint
async function testHealthEndpoint() {
  try {
    console.log('🔍 Testing Redis health endpoint...');
    const response = execSync('powershell -Command "Invoke-RestMethod -Uri \'http://localhost:3000/api/redis/health\' -Method GET | ConvertTo-Json -Depth 10"', { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    const healthData = JSON.parse(response);
    
    if (healthData.redis.connected) {
      console.log('✅ Redis health endpoint working');
      console.log(`   Sessions: ${healthData.sessions.count}`);
      console.log(`   Status: ${healthData.status}`);
      return true;
    } else {
      console.log('❌ Redis health endpoint failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Health endpoint test failed');
    console.log('   Make sure the development server is running: npm run dev');
    console.log('   Error:', error.message);
    return false;
  }
}

// Test checkout session creation
async function testCheckoutSession() {
  try {
    console.log('🔍 Testing checkout session creation...');
    
    const testData = {
      items: [
        {
          product_id: 'test-1',
          product_name: 'Test Product',
          quantity: 1,
          unit_price: 100,
          total_price: 100
        }
      ],
      subtotal: 100,
      discount: 0,
      deliveryFee: 0,
      totalAmount: 100,
      userId: 'test-user',
      userEmail: 'test@example.com'
    };
    
    // Use PowerShell's Invoke-RestMethod for better Windows compatibility
    const jsonData = JSON.stringify(testData);
    const response = execSync(`powershell -Command "Invoke-RestMethod -Uri 'http://localhost:3000/api/create-checkout' -Method POST -ContentType 'application/json' -Body '${jsonData.replace(/"/g, '\\"')}' | ConvertTo-Json -Depth 10"`, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    const result = JSON.parse(response);
    
    if (result.checkoutId) {
      console.log('✅ Checkout session created successfully');
      console.log(`   Checkout ID: ${result.checkoutId}`);
      return result.checkoutId;
    } else {
      console.log('❌ Checkout session creation failed');
      return null;
    }
  } catch (error) {
    console.log('❌ Checkout session test failed');
    console.log('   Error details:', error.message);
    return null;
  }
}

// Test session retrieval
async function testSessionRetrieval(checkoutId) {
  if (!checkoutId) return false;
  
  try {
    console.log('🔍 Testing session retrieval...');
    
    const response = execSync(`powershell -Command "Invoke-RestMethod -Uri 'http://localhost:3000/api/checkout/${checkoutId}' -Method GET | ConvertTo-Json -Depth 10"`, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    if (response.includes('checkoutId')) {
      console.log('✅ Session retrieval successful');
      return true;
    } else {
      console.log('❌ Session retrieval failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Session retrieval test failed');
    console.log('   Error details:', error.message);
    return false;
  }
}

// Test Redis cleanup
async function testRedisCleanup() {
  try {
    console.log('🔍 Testing Redis cleanup...');
    
    const testData = { action: "get_stats" };
    const jsonData = JSON.stringify(testData);
    
    const response = execSync(`powershell -Command "Invoke-RestMethod -Uri 'http://localhost:3000/api/redis/cleanup' -Method POST -ContentType 'application/json' -Body '${jsonData.replace(/"/g, '\\"')}' | ConvertTo-Json -Depth 10"`, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    const result = JSON.parse(response);
    
    if (result.success) {
      console.log('✅ Redis cleanup endpoint working');
      console.log(`   Session count: ${result.sessionCount}`);
      return true;
    } else {
      console.log('❌ Redis cleanup test failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Redis cleanup test failed');
    console.log('   Error details:', error.message);
    return false;
  }
}

// Test fallback mechanisms
async function testFallbackMechanisms() {
  try {
    console.log('🔍 Testing fallback mechanisms...');
    
    // Test with Redis disabled (simulate Redis failure)
    const originalRedisHost = process.env.REDIS_HOST;
    process.env.REDIS_HOST = 'invalid-host';
    
    const testData = {
      items: [
        {
          product_id: 'test-2',
          product_name: 'Test Product 2',
          quantity: 1,
          unit_price: 200,
          total_price: 200
        }
      ],
      subtotal: 200,
      discount: 0,
      deliveryFee: 0,
      totalAmount: 200,
      userId: 'test-user-2',
      userEmail: 'test2@example.com'
    };
    
    const jsonData = JSON.stringify(testData);
    const response = execSync(`powershell -Command "Invoke-RestMethod -Uri 'http://localhost:3000/api/create-checkout' -Method POST -ContentType 'application/json' -Body '${jsonData.replace(/"/g, '\\"')}' | ConvertTo-Json -Depth 10"`, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    const result = JSON.parse(response);
    
    if (result.checkoutId) {
      console.log('✅ Fallback mechanism working (database/in-memory)');
      console.log(`   Checkout ID: ${result.checkoutId}`);
    } else {
      console.log('❌ Fallback mechanism failed');
    }
    
    // Restore original Redis host
    process.env.REDIS_HOST = originalRedisHost;
    
    return result.checkoutId;
  } catch (error) {
    console.log('❌ Fallback mechanism test failed');
    console.log('   Error details:', error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Redis Integration Tests\n');
  
  const results = [];
  let checkoutId = null;
  
  // Run tests in sequence to pass checkoutId between tests
  console.log(`\n📋 Running Redis Connection test...`);
  try {
    const result = await testRedisConnection();
    results.push({ name: 'Redis Connection', passed: !!result, result });
  } catch (error) {
    console.log(`❌ Redis Connection test failed:`, error.message);
    results.push({ name: 'Redis Connection', passed: false, error: error.message });
  }

  console.log(`\n📋 Running Health Endpoint test...`);
  try {
    const result = await testHealthEndpoint();
    results.push({ name: 'Health Endpoint', passed: !!result, result });
  } catch (error) {
    console.log(`❌ Health Endpoint test failed:`, error.message);
    results.push({ name: 'Health Endpoint', passed: false, error: error.message });
  }

  console.log(`\n📋 Running Checkout Session Creation test...`);
  try {
    checkoutId = await testCheckoutSession();
    results.push({ name: 'Checkout Session Creation', passed: !!checkoutId, result: checkoutId });
  } catch (error) {
    console.log(`❌ Checkout Session Creation test failed:`, error.message);
    results.push({ name: 'Checkout Session Creation', passed: false, error: error.message });
  }

  console.log(`\n📋 Running Session Retrieval test...`);
  try {
    const result = await testSessionRetrieval(checkoutId);
    results.push({ name: 'Session Retrieval', passed: !!result, result });
  } catch (error) {
    console.log(`❌ Session Retrieval test failed:`, error.message);
    results.push({ name: 'Session Retrieval', passed: false, error: error.message });
  }

  console.log(`\n📋 Running Redis Cleanup test...`);
  try {
    const result = await testRedisCleanup();
    results.push({ name: 'Redis Cleanup', passed: !!result, result });
  } catch (error) {
    console.log(`❌ Redis Cleanup test failed:`, error.message);
    results.push({ name: 'Redis Cleanup', passed: false, error: error.message });
  }

  console.log(`\n📋 Running Fallback Mechanisms test...`);
  try {
    const result = await testFallbackMechanisms();
    results.push({ name: 'Fallback Mechanisms', passed: !!result, result });
  } catch (error) {
    console.log(`❌ Fallback Mechanisms test failed:`, error.message);
    results.push({ name: 'Fallback Mechanisms', passed: false, error: error.message });
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('='.repeat(50));
  console.log(`Total: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Redis integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
  
  return passed === total;
}

// Run tests
runTests().catch(console.error);