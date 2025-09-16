/**
 * Test script for Razorpay integration
 * Run with: node scripts/test-razorpay.js
 */

const https = require('https');

// Test configuration
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const TEST_CHECKOUT_ID = 'test-checkout-' + Date.now();

console.log('🧪 Testing Razorpay Integration');
console.log('================================');

// Test 1: Environment Variables
console.log('\n1. Checking Environment Variables...');
const requiredEnvVars = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
  'RAZORPAY_WEBHOOK_SECRET'
];

let envVarsOk = true;
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    envVarsOk = false;
  }
});

if (!envVarsOk) {
  console.log('\n❌ Some environment variables are missing. Please check your .env.local file.');
  process.exit(1);
}

// Test 2: API Endpoints
console.log('\n2. Testing API Endpoints...');

async function testEndpoint(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = (url.protocol === 'https:' ? https : require('http')).request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test order creation endpoint
async function testOrderCreation() {
  try {
    console.log('Testing order creation endpoint...');
    const result = await testEndpoint('/api/payment/order', 'POST', {
      amount: 10000, // ₹100 in paise
      currency: 'INR',
      checkoutId: TEST_CHECKOUT_ID
    });
    
    if (result.status === 400 && result.data.error === 'Checkout session not found or expired') {
      console.log('✅ Order creation endpoint is working (expected error for invalid checkout)');
    } else {
      console.log(`⚠️  Unexpected response: ${result.status} - ${JSON.stringify(result.data)}`);
    }
  } catch (error) {
    console.log(`❌ Order creation test failed: ${error.message}`);
  }
}

// Test verification endpoint
async function testVerification() {
  try {
    console.log('Testing payment verification endpoint...');
    const result = await testEndpoint('/api/payment/verify', 'POST', {
      razorpay_order_id: 'test_order_id',
      razorpay_payment_id: 'test_payment_id',
      razorpay_signature: 'test_signature',
      checkoutId: TEST_CHECKOUT_ID
    });
    
    if (result.status === 400 && result.data.error === 'Checkout session not found or expired') {
      console.log('✅ Payment verification endpoint is working (expected error for invalid checkout)');
    } else {
      console.log(`⚠️  Unexpected response: ${result.status} - ${JSON.stringify(result.data)}`);
    }
  } catch (error) {
    console.log(`❌ Payment verification test failed: ${error.message}`);
  }
}

// Test webhook endpoint
async function testWebhook() {
  try {
    console.log('Testing webhook endpoint...');
    const result = await testEndpoint('/api/payment/webhook', 'POST', {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'test_payment_id',
            order_id: 'test_order_id'
          }
        }
      }
    });
    
    if (result.status === 400 && result.data.error === 'Missing signature') {
      console.log('✅ Webhook endpoint is working (expected error for missing signature)');
    } else {
      console.log(`⚠️  Unexpected response: ${result.status} - ${JSON.stringify(result.data)}`);
    }
  } catch (error) {
    console.log(`❌ Webhook test failed: ${error.message}`);
  }
}

// Run tests
async function runTests() {
  await testOrderCreation();
  await testVerification();
  await testWebhook();
  
  console.log('\n🎉 Razorpay integration tests completed!');
  console.log('\nNext steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Create a checkout session through the UI');
  console.log('3. Test the payment flow with Razorpay test cards');
  console.log('4. Configure webhook URL in Razorpay dashboard for production');
}

runTests().catch(console.error);
