const { createClient } = require('@supabase/supabase-js');

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

async function addDisplayOrderColumn() {
  try {
    console.log('🚀 Adding display_order column to categories table...');
    
    // First, let's check if the column already exists by trying to select it
    const { data: testData, error: testError } = await supabase
      .from('categories')
      .select('display_order')
      .limit(1);
    
    if (!testError) {
      console.log('✅ display_order column already exists!');
      return;
    }
    
    console.log('📝 Column does not exist, proceeding with migration...');
    
    // Since we can't directly alter table structure via the client,
    // we'll need to do this through the Supabase dashboard or SQL editor
    console.log('\n⚠️  Manual step required:');
    console.log('Please run the following SQL in your Supabase SQL editor:');
    console.log('\n' + '='.repeat(60));
    console.log(`
-- Add display_order column to categories table
ALTER TABLE categories ADD COLUMN display_order INTEGER;

-- Set initial display_order values based on current alphabetical order
UPDATE categories 
SET display_order = subquery.row_number
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name ASC) as row_number
  FROM categories
) AS subquery
WHERE categories.id = subquery.id;

-- Create an index on display_order for better query performance
CREATE INDEX idx_categories_display_order ON categories(display_order);
    `);
    console.log('='.repeat(60));
    
    console.log('\n📋 After running the SQL above:');
    console.log('1. The display_order column will be added');
    console.log('2. Existing categories will be ordered alphabetically');
    console.log('3. Admin panel category reordering will work');
    console.log('4. User home page will reflect the admin panel order');
    
  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  }
}

// Run the migration
addDisplayOrderColumn();
