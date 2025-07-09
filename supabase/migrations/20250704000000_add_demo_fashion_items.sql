-- Add demo fashion items from virtual try-on demo assets
-- This migration adds the clothing items seen in the virtual try-on demo

-- First, create categories for our demo items
INSERT INTO public.categories (id, name, icon_name, sort_order, is_active) 
VALUES 
    (gen_random_uuid(), 'tops', 'shirt', 1, true),
    (gen_random_uuid(), 'bottoms', 'square', 2, true),
    (gen_random_uuid(), 'outerwear', 'jacket', 3, true)
ON CONFLICT (name) DO NOTHING;

-- Create brands for our demo items
INSERT INTO public.brands (id, name, description, is_verified) 
VALUES 
    (gen_random_uuid(), 'Demo Collection', 'Virtual Try-On Demo Items', true),
    (gen_random_uuid(), 'Ed Hardy Style', 'Graphic Design Apparel', true),
    (gen_random_uuid(), 'Classic Basics', 'Essential Wardrobe Items', true)
ON CONFLICT (name) DO NOTHING;

-- Get the category and brand IDs we just created
WITH category_ids AS (
    SELECT 
        id as category_id,
        name as category_name
    FROM public.categories 
    WHERE name IN ('tops', 'bottoms', 'outerwear')
),
brand_ids AS (
    SELECT 
        id as brand_id,
        name as brand_name
    FROM public.brands 
    WHERE name IN ('Demo Collection', 'Ed Hardy Style', 'Classic Basics')
)

-- COMMENTED OUT: Fashion items INSERT to prevent conflicts with TypeScript demo items
-- Demo fashion items are now managed in src/data/demoWardrobeItems.ts instead of database
-- This prevents duplicate items and allows for faster development iteration

/*
-- Insert the demo fashion items
INSERT INTO public.fashion_items (
    id,
    brand_id,
    category_id,
    name,
    description,
    product_code,
    price,
    currency,
    colors,
    sizes,
    materials,
    images,
    tags,
    style_attributes,
    popularity_score,
    is_featured,
    is_active
) 
SELECT 
    gen_random_uuid(),
    (SELECT brand_id FROM brand_ids WHERE brand_name = 'Classic Basics'),
    (SELECT category_id FROM category_ids WHERE category_name = 'tops'),
    'Classic White T-Shirt',
    'Clean, minimalist white t-shirt perfect for any occasion. Comfortable fit with premium cotton blend.',
    'DEMO-WT-001',
    29.99,
    'USD',
    '["white"]'::jsonb,
    '["XS", "S", "M", "L", "XL"]'::jsonb,
    '["cotton", "polyester"]'::jsonb,
    '["/assets/virtual-try-on-demo/20250408_1616_Stylish Simplicity Display_remix_01jrbgr0zrf1887vc81r8rs7ky.png"]'::jsonb,
    '["basic", "casual", "essential", "white", "versatile"]'::jsonb,
    '{"neckline": "crew", "sleeve": "short", "fit": "regular"}'::jsonb,
    85,
    true,
    true

UNION ALL

SELECT 
    gen_random_uuid(),
    (SELECT brand_id FROM brand_ids WHERE brand_name = 'Classic Basics'),
    (SELECT category_id FROM category_ids WHERE category_name = 'bottoms'),
    'Black Tailored Pants',
    'Sleek black pants with a tailored fit. Perfect for both casual and semi-formal occasions.',
    'DEMO-BP-001',
    79.99,
    'USD',
    '["black"]'::jsonb,
    '["28", "30", "32", "34", "36", "38"]'::jsonb,
    '["cotton", "polyester", "spandex"]'::jsonb,
    '["/assets/virtual-try-on-demo/20250408_1616_Stylish Simplicity Display_remix_01jrbgr0zrf1887vc81r8rs7ky.png"]'::jsonb,
    '["black", "tailored", "versatile", "pants", "formal"]'::jsonb,
    '{"fit": "tailored", "waist": "mid-rise", "length": "full"}'::jsonb,
    80,
    true,
    true

UNION ALL

SELECT 
    gen_random_uuid(),
    (SELECT brand_id FROM brand_ids WHERE brand_name = 'Ed Hardy Style'),
    (SELECT category_id FROM category_ids WHERE category_name = 'outerwear'),
    'Blue Denim Jacket with Graphics',
    'Vintage-inspired denim jacket featuring bold graphic designs and patches. Statement piece for any outfit.',
    'DEMO-DJ-001',
    149.99,
    'USD',
    '["blue", "denim"]'::jsonb,
    '["S", "M", "L", "XL"]'::jsonb,
    '["denim", "cotton"]'::jsonb,
    '["/assets/virtual-try-on-demo/top-front.png", "/assets/virtual-try-on-demo/top-back.png"]'::jsonb,
    '["denim", "jacket", "graphic", "vintage", "statement", "blue"]'::jsonb,
    '{"style": "vintage", "closure": "button", "collar": "spread", "graphics": "front-back"}'::jsonb,
    75,
    true,
    true

UNION ALL

SELECT 
    gen_random_uuid(),
    (SELECT brand_id FROM brand_ids WHERE brand_name = 'Ed Hardy Style'),
    (SELECT category_id FROM category_ids WHERE category_name = 'bottoms'),
    'Graphic Denim Shorts',
    'Bold denim shorts with striking skull and character graphics. Perfect for making a statement.',
    'DEMO-DS-001',
    89.99,
    'USD',
    '["blue", "denim"]'::jsonb,
    '["28", "30", "32", "34", "36"]'::jsonb,
    '["denim", "cotton"]'::jsonb,
    '["/assets/virtual-try-on-demo/bottom-front.png", "/assets/virtual-try-on-demo/bottom-side.png"]'::jsonb,
    '["denim", "shorts", "graphic", "skull", "statement", "blue", "summer"]'::jsonb,
    '{"style": "graphic", "length": "knee", "graphics": "skull-character", "fit": "regular"}'::jsonb,
    70,
    true,
    true;
*/

-- Update RLS policies to allow INSERT operations for fashion items
-- This is needed for the app to be able to create new fashion items

-- Drop the existing view-only policy
DROP POLICY IF EXISTS "Anyone can view fashion items" ON public.fashion_items;

-- Create new policies that allow both viewing and inserting
CREATE POLICY "Anyone can view fashion items" ON public.fashion_items
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create fashion items" ON public.fashion_items
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Also allow INSERT operations on categories and brands for authenticated users
CREATE POLICY "Authenticated users can create categories" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create brands" ON public.brands
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Add some indexes for better performance on the new items
CREATE INDEX IF NOT EXISTS idx_fashion_items_tags ON public.fashion_items USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_fashion_items_style_attributes ON public.fashion_items USING gin(style_attributes);
CREATE INDEX IF NOT EXISTS idx_fashion_items_colors ON public.fashion_items USING gin(colors);
CREATE INDEX IF NOT EXISTS idx_fashion_items_sizes ON public.fashion_items USING gin(sizes);