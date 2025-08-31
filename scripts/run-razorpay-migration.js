const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
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

async function runMigration() {
  try {
    console.log('🚀 Starting Razorpay migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../database/razorpay-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Migration result:', data);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Alternative method if exec_sql RPC doesn't exist
async function runMigrationAlternative() {
  try {
    console.log('🚀 Starting Razorpay migration (alternative method)...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../database/razorpay-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded');
    console.log('⚠️  Please run the following SQL manually in your Supabase SQL editor:');
    console.log('\n' + '='.repeat(80));
    console.log(migrationSQL);
    console.log('='.repeat(80));
    console.log('\n📝 Copy the above SQL and run it in your Supabase dashboard SQL editor.');
    
  } catch (error) {
    console.error('❌ Error reading migration file:', error);
    process.exit(1);
  }
}

// Check if we can use the RPC method
async function checkRPCAvailable() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
    return !error;
  } catch (error) {
    return false;
  }
}

async function main() {
  const rpcAvailable = await checkRPCAvailable();
  
  if (rpcAvailable) {
    await runMigration();
  } else {
    await runMigrationAlternative();
  }
}

main();

