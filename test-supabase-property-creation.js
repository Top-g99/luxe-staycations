// Test property creation with correct Supabase schema
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://okphwjvhzofxevtmlapn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcGh3anZoem9meGV2dG1sYXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODU4NjMsImV4cCI6MjA3MTQ2MTg2M30.xwb10Ff-7nCothbmnL8Kesp4n8TYyJLcdehPgrXLsUw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPropertyCreation() {
    console.log('🏠 Testing property creation with correct schema...');
    
    const testProperty = {
        name: 'Luxury Beach Villa - Supabase Test',
        location: 'Goa',
        description: 'Beautiful beachfront villa with private pool and ocean views. Perfect for families and groups.',
        price: 15000,
        type: 'villa',
        amenities: ['wifi', 'parking', 'pool', 'beach_access'],
        featured: true,
        rating: 0,
        reviews: 0,
        max_guests: 8,
        bedrooms: 4,
        bathrooms: 3,
        host_name: 'John Doe',
        host_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        square_footage: 2500,
        year_built: 2020,
        distance_to_beach: 0.1,
        distance_to_city: 15,
        primary_view: 'ocean_view',
        property_style: 'modern',
        highlights: ['beach_access', 'private_pool', 'sunset_view'],
        available: true,
        images: [
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'
        ]
    };
    
    try {
        const { data, error } = await supabase
            .from('properties')
            .insert([testProperty])
            .select();
            
        if (error) {
            console.log('❌ Property creation failed:', error.message);
            console.log('Error details:', error);
        } else {
            console.log('✅ Property created successfully!');
            console.log('📋 Created property:', data[0]);
            console.log('🆔 Property ID:', data[0].id);
        }
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
}

async function testPropertyRetrieval() {
    console.log('\n📋 Testing property retrieval...');
    
    try {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);
            
        if (error) {
            console.log('❌ Property retrieval failed:', error.message);
        } else {
            console.log('✅ Properties retrieved successfully!');
            console.log('📊 Total properties found:', data.length);
            data.forEach((prop, index) => {
                console.log(`${index + 1}. ${prop.name} - ${prop.location} - ₹${prop.price}`);
                console.log(`   Type: ${prop.type}, Guests: ${prop.max_guests}, Bedrooms: ${prop.bedrooms}`);
                console.log(`   Amenities: ${prop.amenities.join(', ')}`);
                console.log(`   Created: ${new Date(prop.created_at).toLocaleString()}`);
                console.log('');
            });
        }
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
}

async function runTests() {
    await testPropertyCreation();
    await testPropertyRetrieval();
}

runTests();
