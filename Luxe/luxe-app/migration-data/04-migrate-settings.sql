-- Settings Migration Script
-- Generated on: 2025-08-29T08:59:42.327Z

-- Clear existing data (optional)
-- DELETE FROM settings;

-- Insert settings
INSERT INTO settings (key, value, created_at, updated_at) VALUES
(
    'app_name',
    'Luxe Staycations',
    '2025-08-29T08:59:42.325Z',
    '2025-08-29T08:59:42.325Z'
),
(
    'contact_email',
    'info@luxestaycations.com',
    '2025-08-29T08:59:42.325Z',
    '2025-08-29T08:59:42.325Z'
);

-- Verify migration
SELECT COUNT(*) as total_settings FROM settings;
