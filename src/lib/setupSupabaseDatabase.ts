import { supabase } from './supabaseClient';

export async function setupSupabaseDatabase() {
  try {
    console.log('Setting up Supabase database...');

    // Create properties table
    const { error: propertiesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS properties (
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
    });

    if (propertiesError) {
      console.error('Error creating properties table:', propertiesError);
    } else {
      console.log('Properties table created successfully');
    }

    // Create bookings table
    const { error: bookingsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS bookings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          property_id UUID REFERENCES properties(id),
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
    });

    if (bookingsError) {
      console.error('Error creating bookings table:', bookingsError);
    } else {
      console.log('Bookings table created successfully');
    }

    // Create destinations table
    const { error: destinationsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS destinations (
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
    });

    if (destinationsError) {
      console.error('Error creating destinations table:', destinationsError);
    } else {
      console.log('Destinations table created successfully');
    }

    // Create callbacks table
    const { error: callbacksError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS callbacks (
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
    });

    if (callbacksError) {
      console.error('Error creating callbacks table:', callbacksError);
    } else {
      console.log('Callbacks table created successfully');
    }

    // Create consultations table
    const { error: consultationsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS consultations (
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
    });

    if (consultationsError) {
      console.error('Error creating consultations table:', consultationsError);
    } else {
      console.log('Consultations table created successfully');
    }

    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
        ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
        ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE callbacks ENABLE ROW LEVEL SECURITY;
        ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Enable all operations for all users" ON properties FOR ALL USING (true);
        CREATE POLICY "Enable all operations for all users" ON bookings FOR ALL USING (true);
        CREATE POLICY "Enable all operations for all users" ON destinations FOR ALL USING (true);
        CREATE POLICY "Enable all operations for all users" ON callbacks FOR ALL USING (true);
        CREATE POLICY "Enable all operations for all users" ON consultations FOR ALL USING (true);
      `
    });

    if (rlsError) {
      console.error('Error setting up RLS:', rlsError);
    } else {
      console.log('RLS enabled successfully');
    }

    // Insert sample data
    await insertSampleData();

    console.log('Database setup completed successfully!');
    return { success: true, message: 'Database setup completed' };

  } catch (error) {
    console.error('Error setting up database:', error);
    return { success: false, message: 'Database setup failed' };
  }
}

async function insertSampleData() {
  try {
    // Insert sample properties
    const { error: propertiesError } = await supabase
      .from('properties')
      .insert([
        {
          name: 'Luxury Villa in Lonavala',
          description: 'Beautiful 3-bedroom villa with mountain views and private pool',
          location: 'Lonavala, Maharashtra',
          state: 'Maharashtra',
          city: 'Lonavala',
          price_per_night: 15000,
          max_guests: 6,
          bedrooms: 3,
          bathrooms: 2,
          amenities: ['WiFi', 'Parking', 'Swimming Pool', 'Garden', 'Kitchen', 'AC'],
          images: ['/images/properties/villa1.jpg'],
          is_active: true,
          property_type: 'luxury_villa'
        },
        {
          name: 'Beach House in Goa',
          description: 'Modern beachfront property with ocean views and direct beach access',
          location: 'Calangute, Goa',
          state: 'Goa',
          city: 'Calangute',
          price_per_night: 12000,
          max_guests: 4,
          bedrooms: 2,
          bathrooms: 2,
          amenities: ['WiFi', 'Parking', 'Beach Access', 'Kitchen', 'AC', 'Balcony'],
          images: ['/images/properties/beach-house1.jpg'],
          is_active: true,
          property_type: 'villa'
        }
      ]);

    if (propertiesError) {
      console.error('Error inserting sample properties:', propertiesError);
    } else {
      console.log('Sample properties inserted successfully');
    }

    // Insert sample destinations
    const { error: destinationsError } = await supabase
      .from('destinations')
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
        }
      ]);

    if (destinationsError) {
      console.error('Error inserting sample destinations:', destinationsError);
    } else {
      console.log('Sample destinations inserted successfully');
    }

    // Insert sample bookings
    const { error: bookingsError } = await supabase
      .from('bookings')
      .insert([
        {
          property_id: '00000000-0000-0000-0000-000000000001', // This will be replaced with actual property ID
          guest_name: 'John Doe',
          guest_email: 'john@example.com',
          guest_phone: '+91 98765 43210',
          check_in: '2024-02-01',
          check_out: '2024-02-03',
          total_amount: 30000,
          status: 'confirmed',
          payment_status: 'paid',
          special_requests: 'Late check-in requested'
        }
      ]);

    if (bookingsError) {
      console.error('Error inserting sample bookings:', bookingsError);
    } else {
      console.log('Sample bookings inserted successfully');
    }

  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}
