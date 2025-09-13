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

async function createHostTables() {
    console.log('🚀 Creating Host Management System Tables...\n');

    try {
        // 1. Create hosts table
        console.log('📋 Creating hosts table...');
        const { error: hostsError } = await supabase.rpc('create_table_if_not_exists', {
            table_name: 'hosts',
            table_sql: `
        CREATE TABLE hosts (
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
        )
      `
        });

        if (hostsError) {
            console.log('⚠️ hosts table creation failed (might already exist):', hostsError.message);
        } else {
            console.log('✅ hosts table created successfully');
        }

        // 2. Create host_properties table
        console.log('📋 Creating host_properties table...');
        const { error: propertiesError } = await supabase.rpc('create_table_if_not_exists', {
            table_name: 'host_properties',
            table_sql: `
        CREATE TABLE host_properties (
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
        )
      `
        });

        if (propertiesError) {
            console.log('⚠️ host_properties table creation failed (might already exist):', propertiesError.message);
        } else {
            console.log('✅ host_properties table created successfully');
        }

        // 3. Create host_bookings table
        console.log('📋 Creating host_bookings table...');
        const { error: bookingsError } = await supabase.rpc('create_table_if_not_exists', {
            table_name: 'host_bookings',
            table_sql: `
        CREATE TABLE host_bookings (
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
        )
      `
        });

        if (bookingsError) {
            console.log('⚠️ host_bookings table creation failed (might already exist):', bookingsError.message);
        } else {
            console.log('✅ host_bookings table created successfully');
        }

        // 4. Create host_revenue table
        console.log('📋 Creating host_revenue table...');
        const { error: revenueError } = await supabase.rpc('create_table_if_not_exists', {
            table_name: 'host_revenue',
            table_sql: `
        CREATE TABLE host_revenue (
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
        )
      `
        });

        if (revenueError) {
            console.log('⚠️ host_revenue table creation failed (might already exist):', revenueError.message);
        } else {
            console.log('✅ host_revenue table created successfully');
        }

        // 5. Create host_notifications table
        console.log('📋 Creating host_notifications table...');
        const { error: notificationsError } = await supabase.rpc('create_table_if_not_exists', {
            table_name: 'host_notifications',
            table_sql: `
        CREATE TABLE host_notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          host_id UUID NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
          is_read BOOLEAN DEFAULT false,
          action_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
        });

        if (notificationsError) {
            console.log('⚠️ host_notifications table creation failed (might already exist):', notificationsError.message);
        } else {
            console.log('✅ host_notifications table created successfully');
        }

        // 6. Create host_verification_documents table
        console.log('📋 Creating host_verification_documents table...');
        const { error: docsError } = await supabase.rpc('create_table_if_not_exists', {
            table_name: 'host_verification_documents',
            table_sql: `
        CREATE TABLE host_verification_documents (
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
        )
      `
        });

        if (docsError) {
            console.log('⚠️ host_verification_documents table creation failed (might already exist):', docsError.message);
        } else {
            console.log('✅ host_verification_documents table created successfully');
        }

        // 7. Insert sample data
        console.log('\n📊 Inserting sample data...');

        // Insert sample host
        const { data: hostData, error: hostInsertError } = await supabase
            .from('hosts')
            .upsert([{
                id: '550e8400-e29b-41d4-a716-446655440001',
                name: 'Rajesh Kumar',
                email: 'rajesh@example.com',
                phone: '+91 98765 43210',
                password_hash: '$2a$10$dummy.hash.for.demo.purposes',
                verification_status: 'verified',
                member_since: '2024-06-01',
                bank_details: {
                    accountNumber: 'XXXX XXXX 1234',
                    ifscCode: 'HDFC0001234',
                    accountHolderName: 'Rajesh Kumar'
                }
            }], { onConflict: 'id' })
            .select();

        if (hostInsertError) {
            console.log('⚠️ Sample host insertion failed:', hostInsertError.message);
        } else {
            console.log('✅ Sample host inserted successfully');
        }

        // Insert sample properties
        if (hostData && hostData[0]) {
            const { error: propertyInsertError } = await supabase
                .from('host_properties')
                .upsert([{
                    id: '660e8400-e29b-41d4-a716-446655440001',
                    host_id: hostData[0].id,
                    name: 'Casa Alphonso',
                    location: 'Lonavala, Maharashtra',
                    type: 'Luxury Villa',
                    status: 'active',
                    description: 'Beautiful luxury villa with mountain views and private pool',
                    amenities: ['Private Pool', 'Mountain View', 'BBQ Area', 'WiFi', 'AC', 'Kitchen'],
                    pricing: {
                        basePrice: 8000,
                        weekendPrice: 10000,
                        seasonalRates: {
                            'summer': 12000,
                            'monsoon': 6000,
                            'winter': 10000
                        }
                    },
                    images: ['/images/casa-alphonso-1.jpg', '/images/casa-alphonso-2.jpg'],
                    max_guests: 8,
                    bedrooms: 3,
                    bathrooms: 2,
                    total_bookings: 45,
                    total_revenue: 125000.00,
                    average_rating: 4.5
                }], { onConflict: 'id' });

            if (propertyInsertError) {
                console.log('⚠️ Sample property insertion failed:', propertyInsertError.message);
            } else {
                console.log('✅ Sample property inserted successfully');
            }
        }

        console.log('\n🎉 Host Management System Setup Complete!');
        console.log('\n📋 What was created:');
        console.log('   • hosts table - Property owner profiles');
        console.log('   • host_properties table - Property listings');
        console.log('   • host_bookings table - Guest bookings');
        console.log('   • host_revenue table - Revenue tracking');
        console.log('   • host_notifications table - Host notifications');
        console.log('   • host_verification_documents table - Verification docs');
        console.log('   • Sample data for testing');
        console.log('\n🔐 Test Credentials:');
        console.log('   Email: rajesh@example.com');
        console.log('   Password: any password (demo mode)');
        console.log('\n🌐 Access the Host Portal at: /host/login');

    } catch (error) {
        console.error('❌ Setup failed:', error);
        console.log('\n💡 Alternative: You can manually create tables in Supabase Dashboard');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to Table Editor');
        console.log('3. Create tables manually using the SQL from migration-data/04-create-host-tables.sql');
        process.exit(1);
    }
}

// Run the setup
createHostTables().catch(console.error);