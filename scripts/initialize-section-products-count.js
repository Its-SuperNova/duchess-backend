#!/usr/bin/env node

/**
 * Script to initialize current_products_count for existing product sections
 * This script should be run after adding the current_products_count column
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initializeSectionProductsCount() {
  try {
    console.log('🔄 Initializing current_products_count for existing sections...');

    // First, check if the current_products_count column exists
    const { data: columns, error: columnsError } = await supabase
      .from('product_sections')
      .select('current_products_count')
      .limit(1);

    if (columnsError && columnsError.code === 'PGRST116') {
      console.error('❌ current_products_count column does not exist. Please run the migration first.');
      process.exit(1);
    }

    // Get all sections
    const { data: sections, error: sectionsError } = await supabase
      .from('product_sections')
      .select('id, name, title');

    if (sectionsError) {
      console.error('❌ Error fetching sections:', sectionsError);
      process.exit(1);
    }

    if (!sections || sections.length === 0) {
      console.log('ℹ️  No sections found to update.');
      return;
    }

    console.log(`📊 Found ${sections.length} sections to update:`);

    // Update each section
    for (const section of sections) {
      // Count products in this section
      const { count, error: countError } = await supabase
        .from('section_products')
        .select('*', { count: 'exact', head: true })
        .eq('section_id', section.id);

      if (countError) {
        console.error(`❌ Error counting products for section "${section.title}":`, countError);
        continue;
      }

      const currentCount = count || 0;

      // Update the section with the current count
      const { error: updateError } = await supabase
        .from('product_sections')
        .update({ current_products_count: currentCount })
        .eq('id', section.id);

      if (updateError) {
        console.error(`❌ Error updating section "${section.title}":`, updateError);
        continue;
      }

      console.log(`✅ Updated "${section.title}": ${currentCount} products`);
    }

    console.log('🎉 Successfully initialized current_products_count for all sections!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeSectionProductsCount();
