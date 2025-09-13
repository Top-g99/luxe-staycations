const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://okphwjvhzofxevxmlapn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcGh3anZoem9meGV2dG1sYXBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg4NTg2MywiZXhwIjoyMDcxNDYxODYzfQ.N2HiHya_yuS3hsWt8GJsDK9P8nZ1jpaKlUxj6ST-SV8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateProperties() {
    try {
        console.log('Starting property migration to Supabase...');

        // First, check if the properties table exists
        const { error: tableCheck } = await supabase
            .from('properties')
            .select('id')
            .limit(1);

        if (tableCheck) {
            console.log('Creating properties table...');

            // Create the properties table if it doesn't exist
            const { error: createError } = await supabase.rpc('create_properties_table');

            if (createError) {
                console.log('Table creation failed, trying direct SQL...');
                // Try to create table with direct SQL
                const { error: sqlError } = await supabase.rpc('exec_sql', {
                    sql: `
            CREATE TABLE IF NOT EXISTS properties (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              location TEXT NOT NULL,
              description TEXT,
              price DECIMAL(10,2) NOT NULL,
              rating DECIMAL(3,2) DEFAULT 0,
              reviews INTEGER DEFAULT 0,
              maxGuests INTEGER DEFAULT 2,
              amenities JSONB DEFAULT '[]',
              image TEXT,
              featured BOOLEAN DEFAULT false,
              createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
                });

                if (sqlError) {
                    console.error('Failed to create table:', sqlError);
                    return;
                }
            }
        }

        // Sample properties to add
        const sampleProperties = [{
                id: 'casa-alphonso-1',
                name: 'Casa Alphonso 1',
                location: 'Goa, India',
                description: 'Luxurious villa with ocean views and private pool',
                price: 25000,
                rating: 4.8,
                reviews: 45,
                maxGuests: 6,
                amenities: ['Private Pool', 'Ocean View', 'WiFi', 'Kitchen', 'Parking'],
                image: '/images/properties/casa-alphonso-1.jpg',
                featured: true
            },
            {
                id: 'casa-alphonso-2',
                name: 'Casa Alphonso 2',
                location: 'Goa, India',
                description: 'Modern villa with garden and mountain views',
                price: 22000,
                rating: 4.6,
                reviews: 32,
                maxGuests: 4,
                amenities: ['Garden View', 'Mountain View', 'WiFi', 'Kitchen', 'Parking'],
                image: '/images/properties/casa-alphonso-2.jpg',
                featured: true
            },
            {
                id: 'luxe-villa-mumbai',
                name: 'Luxe Villa Mumbai',
                location: 'Mumbai, India',
                description: 'Premium villa in the heart of Mumbai with city views',
                price: 35000,
                rating: 4.9,
                reviews: 67,
                maxGuests: 8,
                amenities: ['City View', 'Private Pool', 'WiFi', 'Kitchen', 'Parking', 'Gym'],
                image: '/images/properties/luxe-villa-mumbai.jpg',
                featured: true
            }
        ];

        console.log('Adding properties to Supabase...');

        for (const property of sampleProperties) {
            const { error } = await supabase
                .from('properties')
                .upsert(property, { onConflict: 'id' });

            if (error) {
                console.error(`Error adding ${property.name}:`, error);
            } else {
                console.log(`✓ Added: ${property.name}`);
            }
        }

        console.log('Migration completed!');

        // Verify the data was added
        const { data: properties, error: fetchError } = await supabase
            .from('properties')
            .select('*');

        if (fetchError) {
            console.error('Error fetching properties:', fetchError);
        } else {
            console.log(`Total properties in Supabase: ${properties.length}`);
            properties.forEach(p => console.log(`- ${p.name} (${p.featured ? 'Featured' : 'Regular'})`));
        }

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrateProperties();