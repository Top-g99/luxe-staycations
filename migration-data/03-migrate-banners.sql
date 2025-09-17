-- Deal Banners Migration Script
-- Generated on: 2025-08-29T08:59:42.327Z

-- Clear existing data (optional)
-- DELETE FROM deal_banners;

-- Insert banners
INSERT INTO deal_banners (id, title, description, video_url, button_text, button_url, active, created_at, updated_at) VALUES
(
    'banner-001',
    'Summer Special',
    'Get 20% off on luxury villas',
    '', -- No hardcoded video URL
    'Book Now',
    '/villas',
    true,
    '2025-08-29T08:59:42.325Z',
    '2025-08-29T08:59:42.325Z'
);

-- Verify migration
SELECT COUNT(*) as total_banners FROM deal_banners;
