const { createClient } = require('@supabase/supabase-js');
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

async function setupSections() {
  try {
    console.log('🚀 Setting up product sections...');

    // First, let's try to create the tables using direct SQL
    console.log('📝 Creating product_sections table...');
    
    // Create product_sections table
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('product_sections')
      .select('*')
      .limit(1);

    if (sectionsError && sectionsError.code === 'PGRST116') {
      console.log('❌ product_sections table does not exist. Please create it manually in your Supabase dashboard.');
      console.log('');
      console.log('📋 SQL to run in Supabase SQL Editor:');
      console.log(`
-- Create product_sections table
CREATE TABLE IF NOT EXISTS product_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    max_products INTEGER DEFAULT 12,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create section_products junction table
CREATE TABLE IF NOT EXISTS section_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES product_sections(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(section_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_sections_display_order ON product_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_product_sections_active ON product_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_section_products_section_id ON section_products(section_id);
CREATE INDEX IF NOT EXISTS idx_section_products_product_id ON section_products(product_id);
CREATE INDEX IF NOT EXISTS idx_section_products_display_order ON section_products(section_id, display_order);

-- Insert default sections
INSERT INTO product_sections (name, title, description, display_order, max_products) VALUES
('featured', 'Featured Products', 'Our handpicked selection of premium products', 1, 8),
('popular', 'Popular Products', 'Customer favorites and bestsellers', 2, 12),
('new-arrivals', 'New Arrivals', 'Fresh products just added to our collection', 3, 6),
('trending', 'Trending Now', 'Products that are currently trending', 4, 8)
ON CONFLICT DO NOTHING;
      `);
      console.log('');
      console.log('🔗 Steps to complete setup:');
      console.log('   1. Go to your Supabase dashboard');
      console.log('   2. Navigate to SQL Editor');
      console.log('   3. Copy and paste the SQL above');
      console.log('   4. Run the SQL');
      console.log('   5. Come back and test the sections management');
      return;
    }

    if (sectionsError) {
      console.error('❌ Error checking product_sections table:', sectionsError);
      return;
    }

    console.log('✅ product_sections table exists');

    // Check section_products table
    console.log('📝 Checking section_products table...');
    const { data: junctionData, error: junctionError } = await supabase
      .from('section_products')
      .select('*')
      .limit(1);

    if (junctionError && junctionError.code === 'PGRST116') {
      console.log('❌ section_products table does not exist. Please create it manually.');
      return;
    }

    if (junctionError) {
      console.error('❌ Error checking section_products table:', junctionError);
      return;
    }

    console.log('✅ section_products table exists');

    // Check if we have any sections
    const { data: existingSections, error: sectionsCheckError } = await supabase
      .from('product_sections')
      .select('*');

    if (sectionsCheckError) {
      console.error('❌ Error checking existing sections:', sectionsCheckError);
      return;
    }

    if (!existingSections || existingSections.length === 0) {
      console.log('📝 No sections found, creating default sections...');
      
      const { error: insertError } = await supabase
        .from('product_sections')
        .insert([
          {
            name: 'featured',
            title: 'Featured Products',
            description: 'Our handpicked selection of premium products',
            display_order: 1,
            max_products: 8
          },
          {
            name: 'popular',
            title: 'Popular Products',
            description: 'Customer favorites and bestsellers',
            display_order: 2,
            max_products: 12
          },
          {
            name: 'new-arrivals',
            title: 'New Arrivals',
            description: 'Fresh products just added to our collection',
            display_order: 3,
            max_products: 6
          },
          {
            name: 'trending',
            title: 'Trending Now',
            description: 'Products that are currently trending',
            display_order: 4,
            max_products: 8
          }
        ]);

      if (insertError) {
        console.error('❌ Error inserting default sections:', insertError);
        return;
      }

      console.log('✅ Default sections created successfully');
    } else {
      console.log(`✅ Found ${existingSections.length} existing sections`);
    }

    console.log('🎉 Product sections setup completed!');
    console.log('');
    console.log('🔗 You can now access:');
    console.log('   /admin/home-customization/product-management/sections');

  } catch (error) {
    console.error('❌ Error setting up sections:', error);
  }
}

setupSections();

