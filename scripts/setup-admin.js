// Script to set up an admin user
// Run this script to promote a user to admin role
// Usage: node scripts/setup-admin.js <email>

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need to add this to your .env.local

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease add SUPABASE_SERVICE_ROLE_KEY to your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdmin(email) {
  if (!email) {
    console.error('Please provide an email address');
    console.error('Usage: node scripts/setup-admin.js <email>');
    process.exit(1);
  }

  try {
    console.log(`Setting up admin role for: ${email}`);

    // First, check if the user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        console.error(`User with email ${email} not found`);
        console.error('Please make sure the user has signed in at least once');
        process.exit(1);
      }
      throw fetchError;
    }

    console.log('User found:', existingUser.name);

    // Update the user's role to admin
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    console.log('✅ Successfully promoted user to admin role');
    console.log('Updated user:', {
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });

  } catch (error) {
    console.error('❌ Error setting up admin:', error.message);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];
setupAdmin(email); 