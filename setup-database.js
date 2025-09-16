#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
    console.log('🗄️  Setting up Supabase Database Schema...\n');

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
        const { error: propertiesError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS properties (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          rating DECIMAL(3,2) DEFAULT 0,
          reviews INTEGER DEFAULT 0,
          max_guests INTEGER NOT NULL,
          amenities TEXT[],
          image VARCHAR(500),
          featured BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        });

        if (propertiesError) {
            console.log('⚠️  Properties table might already exist or there was an error:', propertiesError.message);
        } else {
            console.log('✅ Properties table created successfully');
        }

        // Create destinations table
        console.log('📋 Creating destinations table...');
        const { error: destinationsError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS destinations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          description TEXT,
          image VARCHAR(500),
          rating DECIMAL(3,2) DEFAULT 0,
          reviews INTEGER DEFAULT 0,
          highlights TEXT[],
          images TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        });

        if (destinationsError) {
            console.log('⚠️  Destinations table might already exist or there was an error:', destinationsError.message);
        } else {
            console.log('✅ Destinations table created successfully');
        }

        // Create bookings table
        console.log('📋 Creating bookings table...');
        const { error: bookingsError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS bookings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          property_id UUID REFERENCES properties(id),
          guest_name VARCHAR(255) NOT NULL,
          guest_email VARCHAR(255) NOT NULL,
          guest_phone VARCHAR(50),
          check_in_date DATE NOT NULL,
          check_out_date DATE NOT NULL,
          guests_count INTEGER NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          special_requests TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        });

        if (bookingsError) {
            console.log('⚠️  Bookings table might already exist or there was an error:', bookingsError.message);
        } else {
            console.log('✅ Bookings table created successfully');
        }

        // Create callback_requests table
        console.log('📋 Creating callback_requests table...');
        const { error: callbacksError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS callback_requests (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          message TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        });

        if (callbacksError) {
            console.log('⚠️  Callback requests table might already exist or there was an error:', callbacksError.message);
        } else {
            console.log('✅ Callback requests table created successfully');
        }

        // Create deal_banners table
        console.log('📋 Creating deal_banners table...');
        const { error: bannersError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS deal_banners (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255),
          image VARCHAR(500),
          link VARCHAR(500),
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        });

        if (bannersError) {
            console.log('⚠️  Deal banners table might already exist or there was an error:', bannersError.message);
        } else {
            console.log('✅ Deal banners table created successfully');
        }

        // Create hero_backgrounds table
        console.log('📋 Creating hero_backgrounds table...');
        const { error: heroBackgroundsError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS hero_backgrounds (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle TEXT,
          image VARCHAR(500) NOT NULL,
          alt_text VARCHAR(255),
          active BOOLEAN DEFAULT true,
          priority INTEGER DEFAULT 1,
          link VARCHAR(500),
          link_text VARCHAR(255),
          start_date DATE,
          end_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        });

        if (heroBackgroundsError) {
            console.log('⚠️  Hero backgrounds table might already exist or there was an error:', heroBackgroundsError.message);
        } else {
            console.log('✅ Hero backgrounds table created successfully');
        }

        // Create settings table
        console.log('📋 Creating settings table...');
        const { error: settingsError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS settings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        });

        if (settingsError) {
            console.log('⚠️  Settings table might already exist or there was an error:', settingsError.message);
        } else {
            console.log('✅ Settings table created successfully');
        }

        console.log('\n🎉 Database schema setup completed!');
        console.log('\n📦 Next step: Run "node setup-storage.js" to create storage buckets');

    } catch (error) {
        console.log('❌ Error setting up database:', error.message);
        console.log('\n💡 Alternative: You can manually run the SQL commands in the Supabase SQL Editor');
    }

    setupDatabase();