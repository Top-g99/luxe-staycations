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

async function checkHostTables() {
    console.log('🔍 Checking Host Management System Tables...\n');

    try {
        // Check if hosts table exists
        console.log('📋 Checking hosts table...');
        const { data: hostsData, error: hostsError } = await supabase
            .from('hosts')
            .select('count')
            .limit(1);

        if (hostsError) {
            console.log('❌ hosts table does not exist');
        } else {
            console.log('✅ hosts table exists');
        }

        // Check if host_properties table exists
        console.log('📋 Checking host_properties table...');
        const { data: propertiesData, error: propertiesError } = await supabase
            .from('host_properties')
            .select('count')
            .limit(1);

        if (propertiesError) {
            console.log('❌ host_properties table does not exist');
        } else {
            console.log('✅ host_properties table exists');
        }

        // Check if host_bookings table exists
        console.log('📋 Checking host_bookings table...');
        const { data: bookingsData, error: bookingsError } = await supabase
            .from('host_bookings')
            .select('count')
            .limit(1);

        if (bookingsError) {
            console.log('❌ host_bookings table does not exist');
        } else {
            console.log('✅ host_bookings table exists');
        }

        // Check if host_revenue table exists
        console.log('📋 Checking host_revenue table...');
        const { data: revenueData, error: revenueError } = await supabase
            .from('host_revenue')
            .select('count')
            .limit(1);

        if (revenueError) {
            console.log('❌ host_revenue table does not exist');
        } else {
            console.log('✅ host_revenue table exists');
        }

        // Check if host_notifications table exists
        console.log('📋 Checking host_notifications table...');
        const { data: notificationsData, error: notificationsError } = await supabase
            .from('host_notifications')
            .select('count')
            .limit(1);

        if (notificationsError) {
            console.log('❌ host_notifications table does not exist');
        } else {
            console.log('✅ host_notifications table exists');
        }

        // Check if host_verification_documents table exists
        console.log('📋 Checking host_verification_documents table...');
        const { data: docsData, error: docsError } = await supabase
            .from('host_verification_documents')
            .select('count')
            .limit(1);

        if (docsError) {
            console.log('❌ host_verification_documents table does not exist');
        } else {
            console.log('✅ host_verification_documents table exists');
        }

        console.log('\n📊 Summary:');
        console.log('If any tables are missing, you can create them manually in Supabase Dashboard:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to Table Editor');
        console.log('3. Create tables manually using the SQL from migration-data/04-create-host-tables.sql');
        console.log('\n🌐 Or test the current Host Portal at: /host/login');

    } catch (error) {
        console.error('❌ Check failed:', error);
    }
}

// Run the check
checkHostTables().catch(console.error);