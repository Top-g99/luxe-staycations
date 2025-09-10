-- Clean diagnostic script to check database structure
-- Run this first to see what exists

-- Check which tables exist
SELECT '=== EXISTING TABLES ===' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('properties', 'destinations', 'deal_banners', 'hero_backgrounds')
ORDER BY table_name;

-- Check properties table columns
SELECT '=== PROPERTIES TABLE COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
ORDER BY ordinal_position;

-- Check destinations table columns
SELECT '=== DESTINATIONS TABLE COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'destinations' 
ORDER BY ordinal_position;

-- Check deal_banners table columns
SELECT '=== DEAL_BANNERS TABLE COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'deal_banners' 
ORDER BY ordinal_position;

-- Check if hero_backgrounds table exists
SELECT '=== HERO_BACKGROUNDS TABLE ===' as info;
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hero_backgrounds')
        THEN 'EXISTS'
        ELSE 'DOES NOT EXIST'
    END as status;
