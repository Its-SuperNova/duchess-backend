-- Add current_products_count column to product_sections table
-- This column will track how many products are currently in each section
-- Add the new column
ALTER TABLE product_sections
ADD COLUMN IF NOT EXISTS current_products_count INTEGER DEFAULT 0;
-- Create a function to update the current_products_count
CREATE OR REPLACE FUNCTION update_section_products_count() RETURNS TRIGGER AS $$ BEGIN -- Handle INSERT and UPDATE operations
    IF TG_OP = 'INSERT'
    OR TG_OP = 'UPDATE' THEN -- Update the count for the section
UPDATE product_sections
SET current_products_count = (
        SELECT COUNT(*)
        FROM section_products
        WHERE section_id = NEW.section_id
    )
WHERE id = NEW.section_id;
RETURN NEW;
END IF;
-- Handle DELETE operations
IF TG_OP = 'DELETE' THEN -- Update the count for the section
UPDATE product_sections
SET current_products_count = (
        SELECT COUNT(*)
        FROM section_products
        WHERE section_id = OLD.section_id
    )
WHERE id = OLD.section_id;
RETURN OLD;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;
-- Create triggers to automatically update the count
DROP TRIGGER IF EXISTS trigger_update_section_products_count_insert ON section_products;
CREATE TRIGGER trigger_update_section_products_count_insert
AFTER
INSERT ON section_products FOR EACH ROW EXECUTE FUNCTION update_section_products_count();
DROP TRIGGER IF EXISTS trigger_update_section_products_count_update ON section_products;
CREATE TRIGGER trigger_update_section_products_count_update
AFTER
UPDATE ON section_products FOR EACH ROW EXECUTE FUNCTION update_section_products_count();
DROP TRIGGER IF EXISTS trigger_update_section_products_count_delete ON section_products;
CREATE TRIGGER trigger_update_section_products_count_delete
AFTER DELETE ON section_products FOR EACH ROW EXECUTE FUNCTION update_section_products_count();
-- Initialize current_products_count for existing sections
UPDATE product_sections
SET current_products_count = (
        SELECT COUNT(*)
        FROM section_products
        WHERE section_products.section_id = product_sections.id
    );
-- Add a check constraint to ensure current_products_count is not negative
ALTER TABLE product_sections
ADD CONSTRAINT check_current_products_count_non_negative CHECK (current_products_count >= 0);
-- Add a check constraint to ensure current_products_count doesn't exceed max_products
ALTER TABLE product_sections
ADD CONSTRAINT check_current_products_count_not_exceed_max CHECK (current_products_count <= max_products);