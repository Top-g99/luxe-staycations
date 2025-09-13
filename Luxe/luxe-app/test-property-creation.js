// Test property creation in Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://okphwjvhzofxevtmlapn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcGh3anZoem9meGV2dG1sYXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODU4NjMsImV4cCI6MjA3MTQ2MTg2M30.xwb10Ff-7nCothbmnL8Kesp4n8TYyJLcdehPgrXLsUw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPropertyCreation() {
    console.log('🏠 Testing property creation in Supabase...');
    
    const testProperty = {
        name: 'Test Villa from Script',
        location: 'Goa',
        description: 'Beautiful test villa created from script',
        price: 12000,
        type: 'Villa',
        amenities: ['WiFi', 'Pool', 'Parking'],
        featured: false,
        rating: 0,
        reviews: 0,
        max_guests: 6,
        bedrooms: 3,
        bathrooms: 2,
        host_name: 'Test Host',
        host_image: '',
        property_size: '2000 sq ft',
        year_built: '2020',
        floor_level: 'Ground Floor',
        total_floors: 2,
        parking_spaces: 2,
        pet_friendly: true,
        smoking_allowed: false,
        wheelchair_accessible: false,
        neighborhood: 'Beach Area',
        distance_from_airport: '30 km',
        distance_from_city_center: '15 km',
        distance_from_beach: '500 m',
        public_transport: 'Bus stop 200m away',
        check_in_time: '15:00',
        check_out_time: '11:00',
        early_check_in: false,
        late_check_out: false,
        cancellation_policy: 'Flexible',
        cleaning_fee: 1000,
        service_fee: 500,
        security_deposit: 5000,
        weekly_discount: 10,
        monthly_discount: 20,
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80']
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
            .limit(5);
            
        if (error) {
            console.log('❌ Property retrieval failed:', error.message);
        } else {
            console.log('✅ Properties retrieved successfully!');
            console.log('📊 Total properties found:', data.length);
            data.forEach((prop, index) => {
                console.log(`${index + 1}. ${prop.name} - ${prop.location} - ₹${prop.price}`);
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
