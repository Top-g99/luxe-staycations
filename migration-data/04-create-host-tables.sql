-- Host Management System Tables
-- This migration creates the complete host portal infrastructure

-- 1. Hosts table (property owners)
CREATE TABLE IF NOT EXISTS hosts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('verified', 'pending', 'unverified')),
    member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bank_details JSONB DEFAULT '{}',
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Host properties table
CREATE TABLE IF NOT EXISTS host_properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    host_id UUID NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    description TEXT,
    amenities JSONB DEFAULT '[]',
    pricing JSONB DEFAULT '{}',
    images JSONB DEFAULT '[]',
    max_guests INTEGER DEFAULT 1,
    bedrooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    total_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Host bookings table
CREATE TABLE IF NOT EXISTS host_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES host_properties(id) ON DELETE CASCADE,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(20),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INTEGER DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Host revenue table
CREATE TABLE IF NOT EXISTS host_revenue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    host_id UUID NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
    property_id UUID REFERENCES host_properties(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES host_bookings(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL,
    revenue_type VARCHAR(20) DEFAULT 'booking' CHECK (revenue_type IN ('booking', 'commission', 'bonus', 'refund')),
    period VARCHAR(20) DEFAULT 'monthly' CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
    period_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Host notifications table
CREATE TABLE IF NOT EXISTS host_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    host_id UUID NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Host verification documents table
CREATE TABLE IF NOT EXISTS host_verification_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    host_id UUID NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('id_proof', 'address_proof', 'property_ownership', 'bank_statement')),
    document_url TEXT NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hosts_email ON hosts(email);
CREATE INDEX IF NOT EXISTS idx_hosts_verification_status ON hosts(verification_status);
CREATE INDEX IF NOT EXISTS idx_host_properties_host_id ON host_properties(host_id);
CREATE INDEX IF NOT EXISTS idx_host_properties_status ON host_properties(status);
CREATE INDEX IF NOT EXISTS idx_host_properties_location ON host_properties(location);
CREATE INDEX IF NOT EXISTS idx_host_bookings_property_id ON host_bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_host_bookings_status ON host_bookings(status);
CREATE INDEX IF NOT EXISTS idx_host_revenue_host_id ON host_revenue(host_id);
CREATE INDEX IF NOT EXISTS idx_host_revenue_period_date ON host_revenue(period_date);
CREATE INDEX IF NOT EXISTS idx_host_notifications_host_id ON host_notifications(host_id);
CREATE INDEX IF NOT EXISTS idx_host_notifications_is_read ON host_notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_hosts_updated_at BEFORE UPDATE ON hosts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_host_properties_updated_at BEFORE UPDATE ON host_properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_host_bookings_updated_at BEFORE UPDATE ON host_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_host_verification_documents_updated_at BEFORE UPDATE ON host_verification_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample host data for testing
INSERT INTO hosts (id, name, email, phone, password_hash, verification_status, member_since, bank_details) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Rajesh Kumar',
    'rajesh@example.com',
    '+91 98765 43210',
    '$2a$10$dummy.hash.for.demo.purposes',
    'verified',
    '2024-06-01',
    '{"accountNumber": "XXXX XXXX 1234", "ifscCode": "HDFC0001234", "accountHolderName": "Rajesh Kumar"}'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Priya Sharma',
    'priya@example.com',
    '+91 98765 43211',
    '$2a$10$dummy.hash.for.demo.purposes',
    'pending',
    '2024-07-01',
    '{"accountNumber": "XXXX XXXX 5678", "ifscCode": "ICIC0005678", "accountHolderName": "Priya Sharma"}'
);

-- Insert sample properties
INSERT INTO host_properties (id, host_id, name, location, type, status, description, amenities, pricing, images, max_guests, bedrooms, bathrooms, total_bookings, total_revenue, average_rating) VALUES
(
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Casa Alphonso',
    'Lonavala, Maharashtra',
    'Luxury Villa',
    'active',
    'Beautiful luxury villa with mountain views and private pool',
    '["Private Pool", "Mountain View", "BBQ Area", "WiFi", "AC", "Kitchen"]',
    '{"basePrice": 8000, "weekendPrice": 10000, "seasonalRates": {"summer": 12000, "monsoon": 6000, "winter": 10000}}',
    '["/images/casa-alphonso-1.jpg", "/images/casa-alphonso-2.jpg"]',
    8,
    3,
    2,
    45,
    125000.00,
    4.5
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'Serene Retreat',
    'Mahabaleshwar, Maharashtra',
    'Cottage',
    'active',
    'Peaceful cottage surrounded by nature',
    '["Garden", "Valley View", "Fireplace", "Parking", "WiFi"]',
    '{"basePrice": 6000, "weekendPrice": 7500, "seasonalRates": {"summer": 8000, "monsoon": 5000, "winter": 7000}}',
    '["/images/serene-retreat-1.jpg"]',
    6,
    2,
    2,
    32,
    89000.00,
    4.3
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440002',
    'Ocean View Villa',
    'Goa, India',
    'Beach Villa',
    'pending',
    'Stunning beachfront villa with ocean views',
    '["Beach Access", "Ocean View", "Private Pool", "BBQ", "WiFi"]',
    '{"basePrice": 12000, "weekendPrice": 15000, "seasonalRates": {"peak": 18000, "offPeak": 10000}}',
    '["/images/ocean-view-1.jpg"]',
    10,
    4,
    3,
    0,
    0.00,
    0.0
);

-- Insert sample bookings
INSERT INTO host_bookings (id, property_id, guest_name, guest_email, guest_phone, check_in, check_out, guests, total_amount, status, payment_status) VALUES
(
    '770e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    'Priya Sharma',
    'priya.guest@example.com',
    '+91 98765 43212',
    '2025-02-01',
    '2025-02-03',
    4,
    16000.00,
    'confirmed',
    'paid'
),
(
    '770e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440001',
    'Amit Patel',
    'amit.guest@example.com',
    '+91 98765 43213',
    '2025-02-05',
    '2025-02-07',
    2,
    12000.00,
    'confirmed',
    'paid'
),
(
    '770e8400-e29b-41d4-a716-446655440003',
    '660e8400-e29b-41d4-a716-446655440002',
    'Neha Singh',
    'neha.guest@example.com',
    '+91 98765 43214',
    '2025-02-10',
    '2025-02-12',
    3,
    9000.00,
    'pending',
    'pending'
);

-- Insert sample revenue data
INSERT INTO host_revenue (host_id, property_id, booking_id, amount, commission_amount, net_amount, revenue_type, period, period_date) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    '770e8400-e29b-41d4-a716-446655440001',
    16000.00,
    1600.00,
    14400.00,
    'booking',
    'monthly',
    '2025-02-01'
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    '770e8400-e29b-41d4-a716-446655440002',
    12000.00,
    1200.00,
    10800.00,
    'booking',
    'monthly',
    '2025-02-01'
);

-- Insert sample notifications
INSERT INTO host_notifications (host_id, title, message, type, action_url) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'New Booking Received',
    'You have a new booking for Casa Alphonso from Priya Sharma',
    'success',
    '/host/bookings'
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Payment Received',
    'Payment of ₹16,000 has been received for booking #BK001',
    'success',
    '/host/revenue'
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Property Verification Complete',
    'Your property Casa Alphonso has been verified and is now live',
    'success',
    '/host/properties'
);

-- Create RLS (Row Level Security) policies
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_verification_documents ENABLE ROW LEVEL SECURITY;

-- Hosts can only see their own data
CREATE POLICY "Hosts can view own profile" ON hosts
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Hosts can update own profile" ON hosts
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Host properties policies
CREATE POLICY "Hosts can view own properties" ON host_properties
    FOR SELECT USING (host_id::text = auth.uid()::text);

CREATE POLICY "Hosts can insert own properties" ON host_properties
    FOR INSERT WITH CHECK (host_id::text = auth.uid()::text);

CREATE POLICY "Hosts can update own properties" ON host_properties
    FOR UPDATE USING (host_id::text = auth.uid()::text);

-- Host bookings policies
CREATE POLICY "Hosts can view own property bookings" ON host_bookings
    FOR SELECT USING (
        property_id IN (
            SELECT id FROM host_properties WHERE host_id::text = auth.uid()::text
        )
    );

-- Host revenue policies
CREATE POLICY "Hosts can view own revenue" ON host_revenue
    FOR SELECT USING (host_id::text = auth.uid()::text);

-- Host notifications policies
CREATE POLICY "Hosts can view own notifications" ON host_notifications
    FOR SELECT USING (host_id::text = auth.uid()::text);

CREATE POLICY "Hosts can update own notifications" ON host_notifications
    FOR UPDATE USING (host_id::text = auth.uid()::text);

-- Host verification documents policies
CREATE POLICY "Hosts can view own documents" ON host_verification_documents
    FOR SELECT USING (host_id::text = auth.uid()::text);

CREATE POLICY "Hosts can insert own documents" ON host_verification_documents
    FOR INSERT WITH CHECK (host_id::text = auth.uid()::text);

-- Public can view active properties (for guest browsing)
CREATE POLICY "Public can view active properties" ON host_properties
    FOR SELECT USING (status = 'active');

-- Create views for easier data access
CREATE OR REPLACE VIEW host_dashboard_stats AS
SELECT 
    h.id as host_id,
    h.name as host_name,
    COUNT(hp.id) as total_properties,
    COUNT(CASE WHEN hp.status = 'active' THEN 1 END) as active_properties,
    SUM(hp.total_bookings) as total_bookings,
    SUM(hp.total_revenue) as total_revenue,
    AVG(hp.average_rating) as average_rating
FROM hosts h
LEFT JOIN host_properties hp ON h.id = hp.host_id
GROUP BY h.id, h.name;

-- Create function to calculate host commission
CREATE OR REPLACE FUNCTION calculate_host_commission(booking_amount DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    -- 10% commission rate
    RETURN booking_amount * 0.10;
END;
$$ LANGUAGE plpgsql;

-- Create function to update property stats after booking
CREATE OR REPLACE FUNCTION update_property_stats_after_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' THEN
        UPDATE host_properties 
        SET 
            total_bookings = total_bookings + 1,
            total_revenue = total_revenue + NEW.total_amount,
            updated_at = NOW()
        WHERE id = NEW.property_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating property stats
CREATE TRIGGER trigger_update_property_stats
    AFTER INSERT OR UPDATE ON host_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_property_stats_after_booking();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create indexes for better performance on frequently queried fields
CREATE INDEX IF NOT EXISTS idx_host_properties_type ON host_properties(type);
CREATE INDEX IF NOT EXISTS idx_host_properties_created_at ON host_properties(created_at);
CREATE INDEX IF NOT EXISTS idx_host_bookings_check_in ON host_bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_host_bookings_check_out ON host_bookings(check_out);
CREATE INDEX IF NOT EXISTS idx_host_revenue_revenue_type ON host_revenue(revenue_type);

COMMENT ON TABLE hosts IS 'Property owners who can list and manage their properties';
COMMENT ON TABLE host_properties IS 'Properties listed by hosts for guest bookings';
COMMENT ON TABLE host_bookings IS 'Bookings made by guests for host properties';
COMMENT ON TABLE host_revenue IS 'Revenue tracking for hosts including commissions';
COMMENT ON TABLE host_notifications IS 'Notifications sent to hosts about their properties and bookings';
COMMENT ON TABLE host_verification_documents IS 'Documents submitted by hosts for verification';
