const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBannersTable() {
  try {
    console.log('Creating banners table...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'create-banners-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error creating banners table:', error);
      process.exit(1);
    }
    
    console.log('✅ Banners table created successfully!');
    console.log('📋 Table structure:');
    console.log('   - id (UUID, Primary Key)');
    console.log('   - type (VARCHAR, default: "hero")');
    console.log('   - device_type (VARCHAR, "desktop" or "mobile")');
    console.log('   - image_url (TEXT)');
    console.log('   - public_id (VARCHAR, Cloudinary public ID)');
    console.log('   - is_clickable (BOOLEAN, default: false)');
    console.log('   - redirect_url (TEXT)');
    console.log('   - position (INTEGER, default: 1)');
    console.log('   - is_active (BOOLEAN, default: true)');
    console.log('   - created_at (TIMESTAMP)');
    console.log('   - updated_at (TIMESTAMP)');
    console.log('');
    console.log('🔗 You can now use the admin panel to upload and manage banners!');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the migration
createBannersTable();
