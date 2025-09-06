-- First, let's see what tables and columns currently exist
-- This will help us understand what needs to be fixed

-- Check existing tables
SELECT 'EXISTING TABLES:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('properties', 'destinations', 'deal_banners', 'hero_backgrounds')
ORDER BY table_name;

-- Check properties table structure
SELECT 'PROPERTIES TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
ORDER BY ordinal_position;

-- Check destinations table structure
SELECT 'DESTINATIONS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'destinations' 
ORDER BY ordinal_position;

-- Check deal_banners table structure
SELECT 'DEAL_BANNERS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'deal_banners' 
ORDER BY ordinal_position;

-- Check if hero_backgrounds table exists
SELECT 'HERO_BACKGROUNDS TABLE EXISTS:' as info;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'hero_backgrounds'
) as exists;

-- Check existing policies
SELECT 'EXISTING POLICIES:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('properties', 'destinations', 'deal_banners', 'hero_backgrounds')
ORDER BY tablename, policyname;
