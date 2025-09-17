import { supabase, TABLES } from './supabaseClient';

export async function setupDatabase() {
  console.log('Setting up database tables...');
  
  try {
    // Test connection
    const { data, error } = await supabase.from('information_schema.tables').select('*').limit(1);
    
    if (error) {
      console.error('Database connection error:', error);
      return false;
    }
    
    console.log('Database connection successful');
    
    // Create tables if they don't exist
    const tables = [
      {
        name: TABLES.PROPERTIES,
        sql: `
          CREATE TABLE IF NOT EXISTS ${TABLES.PROPERTIES} (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            location TEXT NOT NULL,
            state TEXT NOT NULL,
            city TEXT NOT NULL,
            price_per_night DECIMAL(10,2) NOT NULL,
            max_guests INTEGER NOT NULL,
            bedrooms INTEGER NOT NULL,
            bathrooms INTEGER NOT NULL,
            amenities TEXT[],
            images TEXT[],
            is_active BOOLEAN DEFAULT true,
            property_type TEXT NOT NULL CHECK (property_type IN ('villa', 'homestay', 'cottage', 'bungalow', 'pool_villa', 'luxury_villa')),
            host_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: TABLES.BOOKINGS,
        sql: `
          CREATE TABLE IF NOT EXISTS ${TABLES.BOOKINGS} (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            property_id UUID REFERENCES ${TABLES.PROPERTIES}(id),
            guest_name TEXT NOT NULL,
            guest_email TEXT NOT NULL,
            guest_phone TEXT NOT NULL,
            check_in DATE NOT NULL,
            check_out DATE NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
            payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'refunded')),
            special_requests TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: TABLES.DESTINATIONS,
        sql: `
          CREATE TABLE IF NOT EXISTS ${TABLES.DESTINATIONS} (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            state TEXT NOT NULL,
            description TEXT,
            image_url TEXT,
            is_popular BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: TABLES.OFFERS,
        sql: `
          CREATE TABLE IF NOT EXISTS ${TABLES.OFFERS} (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            discount_percentage DECIMAL(5,2) NOT NULL,
            valid_from DATE NOT NULL,
            valid_until DATE NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: TABLES.LOYALTY_MEMBERS,
        sql: `
          CREATE TABLE IF NOT EXISTS ${TABLES.LOYALTY_MEMBERS} (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            points INTEGER DEFAULT 0,
            tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
            total_bookings INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: TABLES.CALLBACKS,
        sql: `
          CREATE TABLE IF NOT EXISTS ${TABLES.CALLBACKS} (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            message TEXT,
            status TEXT NOT NULL CHECK (status IN ('pending', 'contacted', 'resolved')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: TABLES.CONSULTATIONS,
        sql: `
          CREATE TABLE IF NOT EXISTS ${TABLES.CONSULTATIONS} (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            property_type TEXT NOT NULL,
            location TEXT NOT NULL,
            budget TEXT,
            message TEXT,
            status TEXT NOT NULL CHECK (status IN ('pending', 'scheduled', 'completed')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: TABLES.PARTNER_REQUESTS,
        sql: `
          CREATE TABLE IF NOT EXISTS ${TABLES.PARTNER_REQUESTS} (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            property_name TEXT NOT NULL,
            location TEXT NOT NULL,
            property_type TEXT NOT NULL,
            message TEXT,
            status TEXT NOT NULL CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: TABLES.SPECIAL_REQUESTS,
        sql: `
          CREATE TABLE IF NOT EXISTS ${TABLES.SPECIAL_REQUESTS} (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            booking_id UUID REFERENCES ${TABLES.BOOKINGS}(id),
            request_type TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: TABLES.EMAIL_LOGS,
        sql: `
          CREATE TABLE IF NOT EXISTS ${TABLES.EMAIL_LOGS} (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            to_email TEXT NOT NULL,
            subject TEXT NOT NULL,
            template_type TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
            sent_at TIMESTAMP WITH TIME ZONE NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: TABLES.ANALYTICS,
        sql: `
          CREATE TABLE IF NOT EXISTS ${TABLES.ANALYTICS} (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            metric_name TEXT NOT NULL,
            metric_value DECIMAL(15,2) NOT NULL,
            date DATE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      }
    ];

    // Note: In a real Supabase setup, you would run these SQL commands in the Supabase SQL editor
    // For now, we'll just log them
    console.log('Database setup SQL commands:');
    tables.forEach(table => {
      console.log(`\n-- Creating table: ${table.name}`);
      console.log(table.sql);
    });

    console.log('\nDatabase setup completed. Please run these SQL commands in your Supabase SQL editor.');
    return true;
    
  } catch (error) {
    console.error('Database setup error:', error);
    return false;
  }
}

// Function to insert sample data
export async function insertSampleData() {
  console.log('Inserting sample data...');
  
  try {
    // Sample destinations
    const { error: destError } = await supabase
      .from(TABLES.DESTINATIONS)
      .insert([
        {
          name: 'Lonavala',
          state: 'Maharashtra',
          description: 'Hill station known for its scenic beauty and pleasant weather',
          image_url: '/images/destinations/lonavala.jpg',
          is_popular: true
        },
        {
          name: 'Goa',
          state: 'Goa',
          description: 'Beach paradise with beautiful coastline and vibrant culture',
          image_url: '/images/destinations/goa.jpg',
          is_popular: true
        },
        {
          name: 'Kerala',
          state: 'Kerala',
          description: 'God\'s own country with backwaters and lush greenery',
          image_url: '/images/destinations/kerala.jpg',
          is_popular: true
        }
      ]);

    if (destError) {
      console.error('Error inserting destinations:', destError);
    } else {
      console.log('Sample destinations inserted successfully');
    }

    // Sample properties
    const { error: propError } = await supabase
      .from(TABLES.PROPERTIES)
      .insert([
        {
          name: 'Luxury Villa in Lonavala',
          description: 'Beautiful 3-bedroom villa with mountain views',
          location: 'Lonavala, Maharashtra',
          state: 'Maharashtra',
          city: 'Lonavala',
          price_per_night: 15000,
          max_guests: 6,
          bedrooms: 3,
          bathrooms: 2,
          amenities: ['WiFi', 'Parking', 'Swimming Pool', 'Garden'],
          images: ['/images/properties/villa1.jpg'],
          property_type: 'luxury_villa',
          is_active: true
        },
        {
          name: 'Beach House in Goa',
          description: 'Modern beachfront property with ocean views',
          location: 'Calangute, Goa',
          state: 'Goa',
          city: 'Calangute',
          price_per_night: 12000,
          max_guests: 4,
          bedrooms: 2,
          bathrooms: 2,
          amenities: ['WiFi', 'Parking', 'Beach Access', 'Kitchen'],
          images: ['/images/properties/beach-house1.jpg'],
          property_type: 'villa',
          is_active: true
        }
      ]);

    if (propError) {
      console.error('Error inserting properties:', propError);
    } else {
      console.log('Sample properties inserted successfully');
    }

    console.log('Sample data insertion completed');
    return true;
    
  } catch (error) {
    console.error('Sample data insertion error:', error);
    return false;
  }
}
