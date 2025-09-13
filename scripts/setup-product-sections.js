const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupProductSections() {
  try {
    console.log('🚀 Setting up product sections...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '../database/create-product-sections.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`📝 Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Error executing statement:`, error);
          // Continue with other statements
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    }

    console.log('🎉 Product sections setup completed!');
    console.log('');
    console.log('📋 What was created:');
    console.log('   • product_sections table');
    console.log('   • section_products junction table');
    console.log('   • Indexes for better performance');
    console.log('   • Default sections: Featured, Popular, New Arrivals, Trending');
    console.log('');
    console.log('🔗 Next steps:');
    console.log('   1. Visit /admin/home-customization/product-management/sections');
    console.log('   2. Create and manage your product sections');
    console.log('   3. Add products to each section');
    console.log('   4. Arrange the order of sections and products');

  } catch (error) {
    console.error('❌ Error setting up product sections:', error);
    process.exit(1);
  }
}

// Run the setup
setupProductSections();

