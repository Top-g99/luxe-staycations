#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
    console.log('🗄️  Setting up Supabase Database Schema (Direct Method)...\n');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Missing Supabase credentials in .env.local');
        console.log('Please update .env.local with your Supabase URL and service role key\n');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Create properties table
        console.log('📋 Creating properties table...');
        const { error: propertiesError } = await supabase
            .from('properties')
            .select('id')
            .limit(1);

        if (propertiesError && propertiesError.code === 'PGRST116') {
            // Table doesn't exist, create it
            console.log('Creating properties table...');
            const { error } = await supabase.rpc('create_properties_table');
            if (error) {
                console.log('⚠️  Error creating properties table:', error.message);
                console.log('💡 You may need to create the table manually in the Supabase SQL Editor');
            } else {
                console.log('✅ Properties table created successfully');
            }
        } else {
            console.log('✅ Properties table already exists');
        }

        // Create destinations table
        console.log('📋 Creating destinations table...');
        const { error: destinationsError } = await supabase
            .from('destinations')
            .select('id')
            .limit(1);

        if (destinationsError && destinationsError.code === 'PGRST116') {
            console.log('Creating destinations table...');
            const { error } = await supabase.rpc('create_destinations_table');
            if (error) {
                console.log('⚠️  Error creating destinations table:', error.message);
            } else {
                console.log('✅ Destinations table created successfully');
            }
        } else {
            console.log('✅ Destinations table already exists');
        }

        // Create bookings table
        console.log('📋 Creating bookings table...');
        const { error: bookingsError } = await supabase
            .from('bookings')
            .select('id')
            .limit(1);

        if (bookingsError && bookingsError.code === 'PGRST116') {
            console.log('Creating bookings table...');
            const { error } = await supabase.rpc('create_bookings_table');
            if (error) {
                console.log('⚠️  Error creating bookings table:', error.message);
            } else {
                console.log('✅ Bookings table created successfully');
            }
        } else {
            console.log('✅ Bookings table already exists');
        }

        // Create callback_requests table
        console.log('📋 Creating callback_requests table...');
        const { error: callbacksError } = await supabase
            .from('callback_requests')
            .select('id')
            .limit(1);

        if (callbacksError && callbacksError.code === 'PGRST116') {
            console.log('Creating callback_requests table...');
            const { error } = await supabase.rpc('create_callback_requests_table');
            if (error) {
                console.log('⚠️  Error creating callback_requests table:', error.message);
            } else {
                console.log('✅ Callback requests table created successfully');
            }
        } else {
            console.log('✅ Callback requests table already exists');
        }

        // Create deal_banners table
        console.log('📋 Creating deal_banners table...');
        const { error: bannersError } = await supabase
            .from('deal_banners')
            .select('id')
            .limit(1);

        if (bannersError && bannersError.code === 'PGRST116') {
            console.log('Creating deal_banners table...');
            const { error } = await supabase.rpc('create_deal_banners_table');
            if (error) {
                console.log('⚠️  Error creating deal_banners table:', error.message);
            } else {
                console.log('✅ Deal banners table created successfully');
            }
        } else {
            console.log('✅ Deal banners table already exists');
        }

        // Create settings table
        console.log('📋 Creating settings table...');
        const { error: settingsError } = await supabase
            .from('settings')
            .select('id')
            .limit(1);

        if (settingsError && settingsError.code === 'PGRST116') {
            console.log('Creating settings table...');
            const { error } = await supabase.rpc('create_settings_table');
            if (error) {
                console.log('⚠️  Error creating settings table:', error.message);
            } else {
                console.log('✅ Settings table created successfully');
            }
        } else {
            console.log('✅ Settings table already exists');
        }

        console.log('\n🎉 Database schema setup completed!');
        console.log('\n📦 Next step: Run "node setup-storage.js" to create storage buckets');
        console.log('\n💡 If tables don\'t exist, you may need to create them manually in the Supabase SQL Editor');

    } catch (error) {
        console.log('❌ Error setting up database:', error.message);
        console.log('\n💡 Alternative: You can manually create the tables in the Supabase SQL Editor');
    }
}

setupDatabase();