// Test script for coupons functionality
// Run with: node scripts/test-coupons.js

const BASE_URL = 'http://localhost:3000/api/coupons';

async function testCouponsAPI() {
  console.log('🧪 Testing Coupons API...\n');

  try {
    // Test 1: Create a new coupon
    console.log('1. Creating a new coupon...');
    const newCoupon = {
      code: "TEST20",
      type: "percentage",
      value: 20,
      minOrderAmount: 500,
      maxDiscountCap: 100,
      usageLimit: 50,
      usagePerUser: 1,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      applicableCategories: ["1", "2"],
      isActive: true
    };

    const createResponse = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCoupon)
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(`Failed to create coupon: ${error.error}`);
    }

    const createdCoupon = await createResponse.json();
    console.log('✅ Coupon created successfully:', createdCoupon.code);
    console.log('   ID:', createdCoupon.id);
    console.log('   Type:', createdCoupon.type);
    console.log('   Value:', createdCoupon.value);
    console.log('');

    // Test 2: Get all coupons
    console.log('2. Fetching all coupons...');
    const getResponse = await fetch(BASE_URL);
    
    if (!getResponse.ok) {
      throw new Error('Failed to fetch coupons');
    }

    const coupons = await getResponse.json();
    console.log(`✅ Found ${coupons.length} coupons`);
    console.log('');

    // Test 3: Get specific coupon
    console.log('3. Fetching specific coupon...');
    const getSpecificResponse = await fetch(`${BASE_URL}/${createdCoupon.id}`);
    
    if (!getSpecificResponse.ok) {
      throw new Error('Failed to fetch specific coupon');
    }

    const specificCoupon = await getSpecificResponse.json();
    console.log('✅ Retrieved specific coupon:', specificCoupon.code);
    console.log('');

    // Test 4: Update coupon
    console.log('4. Updating coupon...');
    const updateData = {
      ...newCoupon,
      code: "TEST25",
      value: 25,
      maxDiscountCap: 150
    };

    const updateResponse = await fetch(`${BASE_URL}/${createdCoupon.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(`Failed to update coupon: ${error.error}`);
    }

    const updatedCoupon = await updateResponse.json();
    console.log('✅ Coupon updated successfully');
    console.log('   New code:', updatedCoupon.code);
    console.log('   New value:', updatedCoupon.value);
    console.log('');

    // Test 5: Try to create duplicate coupon (should fail)
    console.log('5. Testing duplicate coupon creation (should fail)...');
    const duplicateResponse = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCoupon)
    });

    if (duplicateResponse.ok) {
      console.log('❌ Duplicate coupon creation should have failed');
    } else {
      const error = await duplicateResponse.json();
      console.log('✅ Duplicate coupon creation correctly failed:', error.error);
    }
    console.log('');

    // Test 6: Delete coupon
    console.log('6. Deleting coupon...');
    const deleteResponse = await fetch(`${BASE_URL}/${createdCoupon.id}`, {
      method: 'DELETE'
    });

    if (!deleteResponse.ok) {
      throw new Error('Failed to delete coupon');
    }

    console.log('✅ Coupon deleted successfully');
    console.log('');

    console.log('🎉 All tests passed! Coupons API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
testCouponsAPI(); 