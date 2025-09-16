/**
 * Test Razorpay connection and environment variables
 * Run with: node scripts/test-razorpay-connection.js
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing Razorpay Connection');
console.log('================================');

// Check environment variables
console.log('\n1. Environment Variables:');
const requiredVars = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
  'RAZORPAY_WEBHOOK_SECRET'
];

let allVarsPresent = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 8)}...`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    allVarsPresent = false;
  }
});

if (!allVarsPresent) {
  console.log('\n❌ Some environment variables are missing!');
  console.log('Please check your .env.local file and ensure all Razorpay variables are set.');
  process.exit(1);
}

// Test Razorpay connection
console.log('\n2. Testing Razorpay Connection:');

try {
  const Razorpay = require('razorpay');
  
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  console.log('✅ Razorpay instance created successfully');
  
  // Test creating a small order (this will fail with test keys, but we can see the error)
  console.log('\n3. Testing Order Creation:');
  
  const testOrderOptions = {
    amount: 100, // 1 rupee in paise
    currency: 'INR',
    receipt: `test_receipt_${Date.now()}`,
    notes: {
      test: true,
      timestamp: new Date().toISOString()
    }
  };

  razorpay.orders.create(testOrderOptions)
    .then(order => {
      console.log('✅ Test order created successfully:', order.id);
      console.log('🎉 Razorpay integration is working correctly!');
    })
    .catch(error => {
      console.log('⚠️  Test order creation failed (this is expected with test keys):');
      console.log('Error:', error.message);
      
      if (error.message.includes('Invalid key_id')) {
        console.log('❌ Invalid Razorpay Key ID. Please check your RAZORPAY_KEY_ID.');
      } else if (error.message.includes('Invalid key_secret')) {
        console.log('❌ Invalid Razorpay Key Secret. Please check your RAZORPAY_KEY_SECRET.');
      } else if (error.message.includes('Authentication failed')) {
        console.log('❌ Authentication failed. Please verify your Razorpay credentials.');
      } else {
        console.log('ℹ️  This might be a network issue or API rate limit.');
      }
    });

} catch (error) {
  console.log('❌ Failed to create Razorpay instance:', error.message);
  process.exit(1);
}

console.log('\n📋 Next Steps:');
console.log('1. If you see authentication errors, check your Razorpay dashboard for correct keys');
console.log('2. Make sure you\'re using test keys for development');
console.log('3. For production, switch to live keys');
console.log('4. Test the full payment flow in your application');
