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

async function createTables() {
  try {
    console.log('🚀 Creating product sections tables...');

    // Create product_sections table
    console.log('📝 Creating product_sections table...');
    const { error: sectionsError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });

    if (sectionsError) {
      console.error('❌ Error creating product_sections table:', sectionsError);
    } else {
      console.log('✅ product_sections table created successfully');
    }

    // Create section_products table
    console.log('📝 Creating section_products table...');
    const { error: junctionError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS section_products (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          section_id UUID NOT NULL REFERENCES product_sections(id) ON DELETE CASCADE,
          product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          display_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(section_id, product_id)
        );
      `
    });

    if (junctionError) {
      console.error('❌ Error creating section_products table:', junctionError);
    } else {
      console.log('✅ section_products table created successfully');
    }

    // Create indexes
    console.log('📝 Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_product_sections_display_order ON product_sections(display_order);
        CREATE INDEX IF NOT EXISTS idx_product_sections_active ON product_sections(is_active);
        CREATE INDEX IF NOT EXISTS idx_section_products_section_id ON section_products(section_id);
        CREATE INDEX IF NOT EXISTS idx_section_products_product_id ON section_products(product_id);
        CREATE INDEX IF NOT EXISTS idx_section_products_display_order ON section_products(section_id, display_order);
      `
    });

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Insert default sections
    console.log('📝 Inserting default sections...');
    const { error: insertError } = await supabase.rpc('exec', {
      sql: `
        INSERT INTO product_sections (name, title, description, display_order, max_products) VALUES
        ('featured', 'Featured Products', 'Our handpicked selection of premium products', 1, 8),
        ('popular', 'Popular Products', 'Customer favorites and bestsellers', 2, 12),
        ('new-arrivals', 'New Arrivals', 'Fresh products just added to our collection', 3, 6),
        ('trending', 'Trending Now', 'Products that are currently trending', 4, 8)
        ON CONFLICT DO NOTHING;
      `
    });

    if (insertError) {
      console.error('❌ Error inserting default sections:', insertError);
    } else {
      console.log('✅ Default sections inserted successfully');
    }

    console.log('🎉 Database setup completed!');
    console.log('');
    console.log('📋 What was created:');
    console.log('   • product_sections table');
    console.log('   • section_products junction table');
    console.log('   • Indexes for better performance');
    console.log('   • Default sections: Featured, Popular, New Arrivals, Trending');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

createTables();

