#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...\n');

    // Test if we can connect to the database
    console.log('📋 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }

    console.log('✅ Database connection successful');
    
    if (testData && testData.length > 0) {
      console.log(`📧 Found user: ${testData[0].email}`);
      const realUserId = testData[0].id;
      
      // Test orders table with a real user ID
      console.log('\n🧪 Testing orders table insert...');
             const testOrder = {
         user_id: realUserId,
         order_number: 'TEST-ORDER-' + Date.now(),
         status: 'pending',
         payment_status: 'pending',
         item_total: 100,
         delivery_charge: 0,
         discount_amount: 0,
         cgst: 0,
         sgst: 0,
         total_amount: 100,
         notes: JSON.stringify({
           addressText: 'Test Address',
           customizationOptions: { addKnife: false, addCandles: false },
           specialInstructions: 'Test instructions'
         }),
         is_knife: false,
         is_candle: false,
         is_text_on_card: false,
         delivery_timing: 'same_day',
         contact_name: 'Test Customer',
         contact_number: '1234567890',
         contact_alternate_number: '9876543210',
         is_coupon: false,
         coupon_id: null,
         coupon_code: null,
         payment_method: 'online',
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString(),
       };

      const { data: orderInsert, error: orderError } = await supabase
        .from('orders')
        .insert(testOrder)
        .select('id, order_number');

      if (orderError) {
        console.error('❌ Orders table insert failed:', orderError);
        
        // Try to identify which fields are causing issues
        if (orderError.message.includes('column')) {
          console.log('\n🔍 Column error detected. Trying minimal insert...');
          
          const minimalOrder = {
            user_id: realUserId,
            order_number: 'MINIMAL-TEST-' + Date.now(),
            status: 'pending',
            payment_status: 'pending',
            item_total: 100,
            total_amount: 100,
            contact_name: 'Test Customer',
            contact_number: '1234567890',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data: minimalInsert, error: minimalError } = await supabase
            .from('orders')
            .insert(minimalOrder)
            .select('id, order_number');

          if (minimalError) {
            console.error('❌ Minimal insert also failed:', minimalError);
          } else {
            console.log('✅ Minimal insert successful:', minimalInsert);
            
            // Clean up
            await supabase
              .from('orders')
              .delete()
              .eq('order_number', minimalInsert[0].order_number);
            console.log('🧹 Minimal test data cleaned up');
          }
        }
      } else {
        console.log('✅ Orders table insert successful:', orderInsert);
        
        // Clean up test data
        await supabase
          .from('orders')
          .delete()
          .eq('order_number', orderInsert[0].order_number);
        console.log('🧹 Test data cleaned up');
      }

      // Test payments table with a real order ID
      console.log('\n🧪 Testing payments table...');
      
      // First create a test order to get a valid order_id
      const testOrderForPayment = {
        user_id: realUserId,
        order_number: 'PAYMENT-TEST-' + Date.now(),
        status: 'pending',
        payment_status: 'pending',
        item_total: 100,
        total_amount: 100,
        contact_name: 'Test Customer',
        contact_number: '1234567890',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: testOrderData, error: testOrderError } = await supabase
        .from('orders')
        .insert(testOrderForPayment)
        .select('id')
        .single();

      if (testOrderError) {
        console.error('❌ Failed to create test order for payment:', testOrderError);
      } else {
        const testPayment = {
          order_id: testOrderData.id, // Use real order ID
          external_order_id: 'test_external_order_' + Date.now(),
          amount: 100,
          currency: 'INR',
          payment_status: 'pending',
          payment_method: 'external',
          signature_verified: false,
          webhook_received: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

              const { data: paymentInsert, error: paymentError } = await supabase
          .from('payments')
          .insert(testPayment)
          .select('id, external_order_id');

        if (paymentError) {
          console.error('❌ Payments table insert failed:', paymentError);
        } else {
          console.log('✅ Payments table insert successful:', paymentInsert);
          
          // Clean up test data
          await supabase
            .from('payments')
            .delete()
            .eq('external_order_id', paymentInsert[0].external_order_id);
          console.log('🧹 Payments test data cleaned up');
        }

        // Clean up the test order we created for payment testing
        await supabase
          .from('orders')
          .delete()
          .eq('id', testOrderData.id);
        console.log('🧹 Test order for payment cleaned up');
      }
    } else {
      console.log('⚠️  No users found in database');
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkSchema();
