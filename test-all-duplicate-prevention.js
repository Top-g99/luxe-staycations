const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables are not set!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAllDuplicatePrevention() {
    try {
        console.log('🧪 Testing ALL Duplicate Prevention Systems...\n');

        // Test 1: Destinations
        console.log('🏝️  Testing Destinations Duplicate Prevention...');
        await testDestinationDuplicates();

        // Test 2: Properties
        console.log('\n🏠 Testing Properties Duplicate Prevention...');
        await testPropertyDuplicates();

        // Test 3: Bookings
        console.log('\n📅 Testing Bookings Duplicate Prevention...');
        await testBookingDuplicates();

        // Test 4: Deal Banners
        console.log('\n🎯 Testing Deal Banners Duplicate Prevention...');
        await testDealBannerDuplicates();

        // Test 5: Callback Requests
        console.log('\n📞 Testing Callback Requests Duplicate Prevention...');
        await testCallbackRequestDuplicates();

        console.log('\n🎉 All duplicate prevention tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

async function testDestinationDuplicates() {
    try {
        // Check current destinations
        const { data: currentDestinations, error: fetchError } = await supabase
            .from('destinations')
            .select('*');

        if (fetchError) {
            console.error('❌ Error fetching destinations:', fetchError);
            return;
        }

        console.log(`📊 Current destinations: ${currentDestinations.length}`);

        // Try to create a duplicate destination
        const duplicateDestination = {
            name: 'Goa, India', // This should already exist
            description: 'This should fail due to duplicate name',
            image: 'https://example.com/goa-duplicate.jpg',
            featured: false
        };

        console.log(`Attempting to create: "${duplicateDestination.name}"`);

        const { data: createData, error: createError } = await supabase
            .from('destinations')
            .insert(duplicateDestination)
            .select();

        if (createError) {
            console.log('✅ Duplicate prevention working! Error:', createError.message);
        } else {
            console.log('❌ Duplicate was created (this shouldn\'t happen)');
            // Clean up
            await supabase.from('destinations').delete().eq('id', createData[0].id);
        }

    } catch (error) {
        console.error('❌ Destination test failed:', error);
    }
}

async function testPropertyDuplicates() {
    try {
        // Check current properties
        const { data: currentProperties, error: fetchError } = await supabase
            .from('properties')
            .select('*');

        if (fetchError) {
            console.error('❌ Error fetching properties:', fetchError);
            return;
        }

        console.log(`📊 Current properties: ${currentProperties.length}`);

        if (currentProperties.length > 0) {
            const existingProperty = currentProperties[0];

            // Try to create a duplicate property
            const duplicateProperty = {
                name: existingProperty.name,
                location: existingProperty.location,
                description: 'This should fail due to duplicate name + location',
                price: 1000,
                type: 'villa',
                amenities: ['pool', 'garden'],
                images: ['https://example.com/test.jpg'],
                featured: false,
                available: true,
                max_guests: 4,
                bedrooms: 2,
                bathrooms: 2
            };

            console.log(`Attempting to create: "${duplicateProperty.name}" in "${duplicateProperty.location}"`);

            const { data: createData, error: createError } = await supabase
                .from('properties')
                .insert(duplicateProperty)
                .select();

            if (createError) {
                console.log('✅ Duplicate prevention working! Error:', createError.message);
            } else {
                console.log('❌ Duplicate was created (this shouldn\'t happen)');
                // Clean up
                await supabase.from('properties').delete().eq('id', createData[0].id);
            }
        } else {
            console.log('⚠️  No properties found to test duplicates');
        }

    } catch (error) {
        console.error('❌ Property test failed:', error);
    }
}

async function testBookingDuplicates() {
    try {
        // Check current properties and bookings
        const { data: properties, error: propError } = await supabase
            .from('properties')
            .select('id, name')
            .limit(1);

        if (propError || !properties || properties.length === 0) {
            console.log('⚠️  No properties found to test booking duplicates');
            return;
        }

        const propertyId = properties[0].id;
        console.log(`📊 Testing with property: ${properties[0].name}`);

        // Try to create a duplicate booking
        const duplicateBooking = {
            booking_id: `TEST-${Date.now()}`,
            property_id: propertyId,
            guest_name: 'Test User',
            guest_email: 'test@example.com',
            guest_phone: '+1234567890',
            check_in: '2024-01-01',
            check_out: '2024-01-03',
            guests: 2,
            total_amount: 1000.00,
            status: 'pending',
            payment_status: 'pending'
        };

        console.log(`Attempting to create booking for: ${duplicateBooking.guest_email}`);

        const { data: createData, error: createError } = await supabase
            .from('bookings')
            .insert(duplicateBooking)
            .select();

        if (createError) {
            console.log('✅ Duplicate prevention working! Error:', createError.message);
        } else {
            console.log('✅ First booking created successfully');

            // Now try to create a duplicate
            const duplicateBooking2 = {
                ...duplicateBooking,
                booking_id: `TEST-${Date.now()}-2`
            };

            console.log(`Attempting to create duplicate booking for: ${duplicateBooking2.guest_email}`);

            const { data: createData2, error: createError2 } = await supabase
                .from('bookings')
                .insert(duplicateBooking2)
                .select();

            if (createError2) {
                console.log('✅ Duplicate prevention working! Error:', createError2.message);
            } else {
                console.log('❌ Duplicate was created (this shouldn\'t happen)');
            }

            // Clean up test bookings
            await supabase.from('bookings').delete().eq('id', createData[0].id);
            if (createData2) {
                await supabase.from('bookings').delete().eq('id', createData2[0].id);
            }
        }

    } catch (error) {
        console.error('❌ Booking test failed:', error);
    }
}

async function testDealBannerDuplicates() {
    try {
        // Check current deal banners
        const { data: currentBanners, error: fetchError } = await supabase
            .from('deal_banners')
            .select('*');

        if (fetchError) {
            console.error('❌ Error fetching deal banners:', fetchError);
            return;
        }

        console.log(`📊 Current deal banners: ${currentBanners.length}`);

        if (currentBanners.length > 0) {
            const existingBanner = currentBanners[0];

            // Try to create a duplicate deal banner
            const duplicateBanner = {
                title: existingBanner.title,
                description: 'This should fail due to duplicate title',
                video_url: 'https://example.com/test.mp4',
                button_text: 'Book Now',
                button_url: 'https://example.com/book',
                active: true
            };

            console.log(`Attempting to create: "${duplicateBanner.title}"`);

            const { data: createData, error: createError } = await supabase
                .from('deal_banners')
                .insert(duplicateBanner)
                .select();

            if (createError) {
                console.log('✅ Duplicate prevention working! Error:', createError.message);
            } else {
                console.log('❌ Duplicate was created (this shouldn\'t happen)');
                // Clean up
                await supabase.from('deal_banners').delete().eq('id', createData[0].id);
            }
        } else {
            console.log('⚠️  No deal banners found to test duplicates');
        }

    } catch (error) {
        console.error('❌ Deal banner test failed:', error);
    }
}

async function testCallbackRequestDuplicates() {
    try {
        // Check current callback requests
        const { data: currentRequests, error: fetchError } = await supabase
            .from('callback_requests')
            .select('*');

        if (fetchError) {
            console.error('❌ Error fetching callback requests:', fetchError);
            return;
        }

        console.log(`📊 Current callback requests: ${currentRequests.length}`);

        // Try to create a callback request
        const testRequest = {
            name: 'Test User',
            email: 'test@example.com',
            phone: '+1234567890',
            message: 'Test callback request',
            number_of_guests: 2,
            status: 'pending'
        };

        console.log(`Attempting to create callback request for: ${testRequest.phone}`);

        const { data: createData, error: createError } = await supabase
            .from('callback_requests')
            .insert(testRequest)
            .select();

        if (createError) {
            console.log('✅ Duplicate prevention working! Error:', createError.message);
        } else {
            console.log('✅ First callback request created successfully');

            // Now try to create a duplicate within the same hour
            const duplicateRequest = {
                ...testRequest,
                message: 'Duplicate request within same hour'
            };

            console.log(`Attempting to create duplicate callback request for: ${duplicateRequest.phone}`);

            const { data: createData2, error: createError2 } = await supabase
                .from('callback_requests')
                .insert(duplicateRequest)
                .select();

            if (createError2) {
                console.log('✅ Duplicate prevention working! Error:', createError2.message);
            } else {
                console.log('❌ Duplicate was created (this shouldn\'t happen)');
            }

            // Clean up test requests
            await supabase.from('callback_requests').delete().eq('id', createData[0].id);
            if (createData2) {
                await supabase.from('callback_requests').delete().eq('id', createData2[0].id);
            }
        }

    } catch (error) {
        console.error('❌ Callback request test failed:', error);
    }
}

// Run the tests
testAllDuplicatePrevention();





