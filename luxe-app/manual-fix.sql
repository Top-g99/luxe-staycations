-- Manual fix for deal banners and hero backgrounds
-- Run this directly in Supabase SQL Editor

-- Add deal banner data
INSERT INTO deal_banners (title, subtitle, button_text, button_link, video_url, fallback_image_url, is_active) 
VALUES (
    'Ready to Find a Great Villa Deal?',
    'Save up to 25% on your next luxury villa stay',
    'Explore Deals',
    '/villas',
    '',
    'https://i.pinimg.com/736x/6d/a3/a3/6da3a3ded69f943f7d4df7b33e2d6086.jpg',
    true
);

-- Add hero background data
INSERT INTO hero_backgrounds (title, subtitle, image, alt_text, active, priority) 
VALUES (
    'Ready to Find a Great Villa Deal?',
    'Save up to 25% on your next luxury villa stay',
    'https://i.pinimg.com/736x/6d/a3/a3/6da3a3ded69f943f7d4df7b33e2d6086.jpg',
    'Luxury villa with mountain view',
    true,
    1
);

-- Success message
SELECT 'Manual data added successfully!' as status;

