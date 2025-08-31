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

async function updateDeliveryFees() {
  try {
    console.log('🔄 Updating delivery fees to 0 for all orders...\n');

    // First, let's see how many orders have non-zero delivery fees
    console.log('📋 Checking current delivery fees...');
    const { data: ordersWithFees, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, delivery_charge, total_amount')
      .gt('delivery_charge', 0);

    if (fetchError) {
      console.error('❌ Error fetching orders:', fetchError);
      return;
    }

    if (!ordersWithFees || ordersWithFees.length === 0) {
      console.log('✅ No orders found with delivery fees > 0');
      return;
    }

    console.log(`Found ${ordersWithFees.length} orders with delivery fees > 0:`);
    ordersWithFees.forEach((order, index) => {
      console.log(`${index + 1}. Order: ${order.order_number}`);
      console.log(`   Current delivery fee: ₹${order.delivery_charge}`);
      console.log(`   Current total: ₹${order.total_amount}`);
      console.log('');
    });

    // Ask for confirmation
    console.log('⚠️  WARNING: This will set delivery_charge to 0 for all orders!');
    console.log('This action cannot be undone.');
    console.log('');
    console.log('To proceed, run this script with the --confirm flag:');
    console.log('node scripts/update-delivery-fees.js --confirm');

  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

async function confirmUpdateDeliveryFees() {
  try {
    console.log('🔄 Updating delivery fees to 0 for all orders...');
    
    // Update all orders to set delivery_charge to 0
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        delivery_charge: 0,
        updated_at: new Date().toISOString()
      })
      .gt('delivery_charge', 0);

    if (error) {
      console.error('❌ Error updating orders:', error);
      return;
    }

    console.log(`✅ Successfully updated ${data?.length || 0} orders`);
    console.log('All delivery fees have been set to 0');
  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--confirm')) {
  confirmUpdateDeliveryFees();
} else {
  updateDeliveryFees();
}
