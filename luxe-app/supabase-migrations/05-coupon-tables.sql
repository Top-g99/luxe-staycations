-- Create offers_banners table
CREATE TABLE IF NOT EXISTS offers_banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    button_text TEXT NOT NULL,
    button_link TEXT NOT NULL,
    background_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    category TEXT DEFAULT 'general' CHECK (category IN ('partnership', 'promotion', 'seasonal', 'general')),
    priority INTEGER DEFAULT 1,
    -- Coupon Code Management
    has_coupon BOOLEAN DEFAULT false,
    coupon_code TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2),
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    max_uses INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    terms_and_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupon_redemptions table for accounting and analytics
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id TEXT PRIMARY KEY,
    coupon_code TEXT NOT NULL,
    banner_id TEXT NOT NULL,
    banner_title TEXT NOT NULL,
    order_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    booking_id TEXT,
    customer_email TEXT,
    customer_name TEXT,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (banner_id) REFERENCES offers_banners(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offers_banners_active ON offers_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_banners_coupon ON offers_banners(has_coupon, coupon_code);
CREATE INDEX IF NOT EXISTS idx_offers_banners_category ON offers_banners(category);
CREATE INDEX IF NOT EXISTS idx_offers_banners_priority ON offers_banners(priority DESC);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_code ON coupon_redemptions(coupon_code);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_banner ON coupon_redemptions(banner_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_date ON coupon_redemptions(redeemed_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_booking ON coupon_redemptions(booking_id);

-- Create updated_at trigger for offers_banners
CREATE OR REPLACE FUNCTION update_offers_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_offers_banners_updated_at
    BEFORE UPDATE ON offers_banners
    FOR EACH ROW
    EXECUTE FUNCTION update_offers_banners_updated_at();

-- Create updated_at trigger for coupon_redemptions
CREATE OR REPLACE FUNCTION update_coupon_redemptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_coupon_redemptions_updated_at
    BEFORE UPDATE ON coupon_redemptions
    FOR EACH ROW
    EXECUTE FUNCTION update_coupon_redemptions_updated_at();

-- Insert sample data for testing
INSERT INTO offers_banners (
    id, title, subtitle, description, button_text, button_link, 
    is_active, category, priority, has_coupon, coupon_code, 
    discount_type, discount_value, min_order_amount, max_uses, 
    used_count, terms_and_conditions
) VALUES (
    'sample-1',
    'LUXE Premium Experience',
    'Premium Luxury Villas',
    'Enjoy FLAT 50% OFF on 2nd night when you book our premium luxury villas for your next holiday adventure.',
    'Book Now',
    '/villas',
    true,
    'promotion',
    1,
    true,
    'LUXEPREMIUM',
    'percentage',
    50.00,
    3000.00,
    500,
    89,
    'Valid on 2nd night booking only. Minimum booking amount of ₹3000. Valid till 31 Oct 2026.'
) ON CONFLICT (id) DO NOTHING;

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE offers_banners ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (adjust as needed)
-- CREATE POLICY "Allow authenticated users to read offers_banners" ON offers_banners
--     FOR SELECT TO authenticated USING (true);

-- CREATE POLICY "Allow authenticated users to read coupon_redemptions" ON coupon_redemptions
--     FOR SELECT TO authenticated USING (true);
