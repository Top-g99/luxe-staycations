-- Properties Migration Script
-- Generated on: 2025-08-29T08:59:42.326Z

-- Clear existing data (optional)
-- DELETE FROM properties;

-- Insert properties
INSERT INTO properties (id, name, location, description, price, rating, reviews, type, amenities, featured, bedrooms, bathrooms, max_guests, images, available, created_at, updated_at) VALUES
(
    'casa-alphonso-001',
    'Casa Alphonso',
    'Goa, India',
    'Luxury villa with ocean view',
    15000,
    4.8,
    127,
    'villa',
    ARRAY['Pool', 'Ocean View', 'Private Beach', 'WiFi'],
    true,
    4,
    3,
    8,
    ARRAY['casa-alphonso-1.jpg', 'casa-alphonso-2.jpg'],
    true,
    '2025-08-29T08:59:42.324Z',
    '2025-08-29T08:59:42.325Z'
);

-- Verify migration
SELECT COUNT(*) as total_properties FROM properties;
