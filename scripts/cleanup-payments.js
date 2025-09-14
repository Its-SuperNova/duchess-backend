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

async function cleanupPayments() {
  try {
    console.log('🧹 Cleaning up payment data...\n');

    // First, let's see what payment data exists
    console.log('📋 Current payments in database:');
    const { data: payments, error: fetchError } = await supabase
      .from('payments')
      .select('id, external_order_id, amount, payment_status, created_at');

    if (fetchError) {
      console.error('❌ Error fetching payments:', fetchError);
      return;
    }

    if (!payments || payments.length === 0) {
      console.log('✅ No payments found in database');
      return;
    }

    console.log(`Found ${payments.length} payments:`);
    payments.forEach((payment, index) => {
      console.log(`${index + 1}. ID: ${payment.id}`);
      console.log(`   External Order ID: ${payment.external_order_id}`);
      console.log(`   Amount: ₹${payment.amount}`);
      console.log(`   Status: ${payment.payment_status}`);
      console.log(`   Created: ${payment.created_at}`);
      console.log('');
    });

    // Check which orders reference these payments
    console.log('🔗 Checking order references...');
    const { data: ordersWithPayments, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, latest_payment_id')
      .not('latest_payment_id', 'is', null);

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      return;
    }

    if (ordersWithPayments && ordersWithPayments.length > 0) {
      console.log(`Found ${ordersWithPayments.length} orders with payment references:`);
      ordersWithPayments.forEach((order, index) => {
        console.log(`${index + 1}. Order: ${order.order_number} -> Payment ID: ${order.latest_payment_id}`);
      });
    } else {
      console.log('✅ No orders reference payments');
    }

    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will delete payment records!');
    console.log('This action cannot be undone.');
    console.log('');
    console.log('Options:');
    console.log('1. Delete all payments (--confirm):');
    console.log('   node scripts/cleanup-payments.js --confirm');
    console.log('');
    console.log('2. Delete only test payments (--test-only):');
    console.log('   node scripts/cleanup-payments.js --test-only');
    console.log('');
    console.log('3. Delete payments by date range (--date-range):');
    console.log('   node scripts/cleanup-payments.js --date-range 2025-08-31');
    console.log('');
    console.log('4. Delete payments by status (--status pending):');
    console.log('   node scripts/cleanup-payments.js --status pending');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

async function deleteAllPayments() {
  try {
    console.log('🗑️  Deleting ALL payment records...');
    
    // Step 1: Update orders table to remove payment references
    console.log('📝 Step 1: Removing payment references from orders...');
    const { error: updateError } = await supabase
      .from('orders')
      .update({ latest_payment_id: null })
      .not('latest_payment_id', 'is', null);

    if (updateError) {
      console.error('❌ Error updating orders:', updateError);
      return;
    }
    console.log('✅ Orders updated successfully');

    // Step 2: Delete all payments
    console.log('🗑️  Step 2: Deleting all payment records...');
    const { data, error } = await supabase
      .from('payments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except dummy ID

    if (error) {
      console.error('❌ Error deleting payments:', error);
      return;
    }

    console.log(`✅ Successfully deleted ${data?.length || 0} payment records`);
  } catch (error) {
    console.error('❌ Delete failed:', error);
  }
}

async function deleteTestPayments() {
  try {
    console.log('🧪 Deleting test payment records only...');
    
    // Step 1: Get test payment IDs
    console.log('📝 Step 1: Finding test payments...');
    const { data: testPayments, error: fetchError } = await supabase
      .from('payments')
      .select('id, external_order_id')
      .ilike('external_order_id', '%test%');

    if (fetchError) {
      console.error('❌ Error fetching test payments:', fetchError);
      return;
    }

    if (!testPayments || testPayments.length === 0) {
      console.log('✅ No test payments found');
      return;
    }

    const testPaymentIds = testPayments.map(p => p.id);
    console.log(`Found ${testPaymentIds.length} test payments to delete`);

    // Step 2: Update orders table to remove references to test payments
    console.log('📝 Step 2: Removing test payment references from orders...');
    const { error: updateError } = await supabase
      .from('orders')
      .update({ latest_payment_id: null })
      .in('latest_payment_id', testPaymentIds);

    if (updateError) {
      console.error('❌ Error updating orders:', updateError);
      return;
    }
    console.log('✅ Orders updated successfully');

    // Step 3: Delete test payments
    console.log('🗑️  Step 3: Deleting test payment records...');
    const { data, error } = await supabase
      .from('payments')
      .delete()
      .in('id', testPaymentIds);

    if (error) {
      console.error('❌ Error deleting test payments:', error);
      return;
    }

    console.log(`✅ Successfully deleted ${data?.length || 0} test payment records`);
  } catch (error) {
    console.error('❌ Delete failed:', error);
  }
}

async function deletePaymentsByDate(date) {
  try {
    console.log(`🗑️  Deleting payments from date: ${date}...`);
    
    // Step 1: Get payment IDs for the specified date
    console.log('📝 Step 1: Finding payments for the specified date...');
    const { data: datePayments, error: fetchError } = await supabase
      .from('payments')
      .select('id, external_order_id, created_at')
      .gte('created_at', `${date}T00:00:00`)
      .lt('created_at', `${date}T23:59:59`);

    if (fetchError) {
      console.error('❌ Error fetching payments by date:', fetchError);
      return;
    }

    if (!datePayments || datePayments.length === 0) {
      console.log('✅ No payments found for the specified date');
      return;
    }

    const datePaymentIds = datePayments.map(p => p.id);
    console.log(`Found ${datePaymentIds.length} payments to delete for ${date}`);

    // Step 2: Update orders table to remove references
    console.log('📝 Step 2: Removing payment references from orders...');
    const { error: updateError } = await supabase
      .from('orders')
      .update({ latest_payment_id: null })
      .in('latest_payment_id', datePaymentIds);

    if (updateError) {
      console.error('❌ Error updating orders:', updateError);
      return;
    }
    console.log('✅ Orders updated successfully');

    // Step 3: Delete payments
    console.log('🗑️  Step 3: Deleting payment records...');
    const { data, error } = await supabase
      .from('payments')
      .delete()
      .in('id', datePaymentIds);

    if (error) {
      console.error('❌ Error deleting payments:', error);
      return;
    }

    console.log(`✅ Successfully deleted ${data?.length || 0} payment records`);
  } catch (error) {
    console.error('❌ Delete failed:', error);
  }
}

async function deletePaymentsByStatus(status) {
  try {
    console.log(`🗑️  Deleting payments with status: ${status}...`);
    
    // Step 1: Get payment IDs for the specified status
    console.log('📝 Step 1: Finding payments with the specified status...');
    const { data: statusPayments, error: fetchError } = await supabase
      .from('payments')
      .select('id, external_order_id, payment_status')
      .eq('payment_status', status);

    if (fetchError) {
      console.error('❌ Error fetching payments by status:', fetchError);
      return;
    }

    if (!statusPayments || statusPayments.length === 0) {
      console.log(`✅ No payments found with status: ${status}`);
      return;
    }

    const statusPaymentIds = statusPayments.map(p => p.id);
    console.log(`Found ${statusPaymentIds.length} payments with status '${status}' to delete`);

    // Step 2: Update orders table to remove references
    console.log('📝 Step 2: Removing payment references from orders...');
    const { error: updateError } = await supabase
      .from('orders')
      .update({ latest_payment_id: null })
      .in('latest_payment_id', statusPaymentIds);

    if (updateError) {
      console.error('❌ Error updating orders:', updateError);
      return;
    }
    console.log('✅ Orders updated successfully');

    // Step 3: Delete payments
    console.log('🗑️  Step 3: Deleting payment records...');
    const { data, error } = await supabase
      .from('payments')
      .delete()
      .in('id', statusPaymentIds);

    if (error) {
      console.error('❌ Error deleting payments:', error);
      return;
    }

    console.log(`✅ Successfully deleted ${data?.length || 0} payment records`);
  } catch (error) {
    console.error('❌ Delete failed:', error);
  }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--confirm')) {
  deleteAllPayments();
} else if (args.includes('--test-only')) {
  deleteTestPayments();
} else if (args.includes('--date-range')) {
  const dateIndex = args.indexOf('--date-range');
  const date = args[dateIndex + 1];
  if (!date) {
    console.error('❌ Please provide a date (YYYY-MM-DD) after --date-range');
    process.exit(1);
  }
  deletePaymentsByDate(date);
} else if (args.includes('--status')) {
  const statusIndex = args.indexOf('--status');
  const status = args[statusIndex + 1];
  if (!status) {
    console.error('❌ Please provide a status after --status');
    process.exit(1);
  }
  deletePaymentsByStatus(status);
} else {
  cleanupPayments();
}
