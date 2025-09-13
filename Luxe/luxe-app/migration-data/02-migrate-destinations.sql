-- Destinations Migration Script
-- Generated on: 2025-08-29T08:59:42.326Z

-- Clear existing data (optional)
-- DELETE FROM destinations;

-- Insert destinations
INSERT INTO destinations (id, name, description, image, featured, created_at, updated_at) VALUES
(
    'goa-001',
    'Goa',
    'Tropical paradise with pristine beaches',
    'goa-beach.jpg',
    true,
    '2025-08-29T08:59:42.325Z',
    '2025-08-29T08:59:42.325Z'
),
(
    'kerala-001',
    'Kerala',
    'God''s own country with backwaters',
    'kerala-backwaters.jpg',
    true,
    '2025-08-29T08:59:42.325Z',
    '2025-08-29T08:59:42.325Z'
);

-- Verify migration
SELECT COUNT(*) as total_destinations FROM destinations;
