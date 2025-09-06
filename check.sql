SELECT 'Tables:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('properties', 'destinations', 'deal_banners', 'hero_backgrounds');

SELECT 'Properties columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'properties';

SELECT 'Destinations columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'destinations';

SELECT 'Deal banners columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'deal_banners';
