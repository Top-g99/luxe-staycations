const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createHostTablesSimple() {
    console.log('🚀 Creating Host Management System Tables (Simple Approach)...\n');

    try {
        // Since we can't create tables directly via the client, let's check if we can at least insert data
        // This will help us understand what's working and what's not

        console.log('📊 Testing Supabase connection...');

        // Try to create a simple test table by inserting data
        // If the table doesn't exist, this will fail, but we'll know the connection works

        console.log('🔍 Checking if we can connect to existing tables...');
        const { data: testData, error: testError } = await supabase
            .from('properties')
            .select('id')
            .limit(1);

        if (testError) {
            console.log('⚠️ Connection test failed:', testError.message);
        } else {
            console.log('✅ Supabase connection working');
        }

        console.log('\n💡 Since we cannot create tables via the client, you need to:');
        console.log('1. Go to your Supabase Dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste this SQL:');
        console.log('\n' + '='.repeat(60));

        const sqlContent = `
-- Create hosts table
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

-- Create host_properties table
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

-- Create host_bookings table
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

-- Create host_revenue table
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

-- Create host_notifications table
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

-- Create host_verification_documents table
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

-- Insert sample host data
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
);

-- Insert sample property
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
);
`;

        console.log(sqlContent);
        console.log('='.repeat(60));

        console.log('\n📋 After running the SQL above, you can test the system with:');
        console.log('🔐 Test Credentials:');
        console.log('   Email: rajesh@example.com');
        console.log('   Password: any password (demo mode)');
        console.log('\n🌐 Access the Host Portal at: /host/login');

    } catch (error) {
        console.error('❌ Setup check failed:', error);
    }
}

// Run the setup
createHostTablesSimple().catch(console.error);