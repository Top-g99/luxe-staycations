const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables are not set!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDuplicatePrevention() {
    try {
        console.log('🧪 Testing Duplicate Prevention System...\n');

        // Test 1: Check current destinations
        console.log('📊 Current destinations in database:');
        const { data: currentDestinations, error: fetchError } = await supabase
            .from('destinations')
            .select('*')
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error('❌ Error fetching destinations:', fetchError);
            return;
        }

        console.log(`✅ Found ${currentDestinations.length} destinations`);
        currentDestinations.forEach(dest => {
            console.log(`   - ${dest.name} (ID: ${dest.id})`);
        });

        // Test 2: Try to create a duplicate destination
        console.log('\n🧪 Testing duplicate prevention...');
        const duplicateDestination = {
            name: 'Goa, India', // This already exists
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

            // Check if it's a duplicate key error
            if (createError.message.includes('duplicate') || createError.message.includes('already exists')) {
                console.log('🎯 Successfully prevented duplicate destination creation!');
            } else {
                console.log('⚠️  Different type of error occurred');
            }
        } else {
            console.log('❌ Duplicate was created (this shouldn\'t happen)');
            console.log('Created destination:', createData[0]);

            // Clean up the test entry
            const { error: deleteError } = await supabase
                .from('destinations')
                .delete()
                .eq('id', createData[0].id);

            if (deleteError) {
                console.error('⚠️  Failed to clean up test destination:', deleteError);
            } else {
                console.log('🧹 Test destination cleaned up');
            }
        }

        // Test 3: Verify final count (should be the same)
        const { data: finalDestinations, error: finalError } = await supabase
            .from('destinations')
            .select('*');

        if (!finalError) {
            console.log(`\n📊 Final destination count: ${finalDestinations.length}`);
            if (finalDestinations.length === currentDestinations.length) {
                console.log('✅ Destination count unchanged - duplicate prevention working!');
            } else {
                console.log('⚠️  Destination count changed unexpectedly');
            }
        }

        // Test 4: Try to create a unique destination (should succeed)
        console.log('\n🧪 Testing unique destination creation...');
        const uniqueDestination = {
            name: `Test Destination ${Date.now()}`, // Unique name
            description: 'This is a test destination for duplicate prevention testing',
            image: 'https://example.com/test.jpg',
            featured: false
        };

        console.log(`Attempting to create: "${uniqueDestination.name}"`);

        const { data: uniqueData, error: uniqueError } = await supabase
            .from('destinations')
            .insert(uniqueDestination)
            .select();

        if (uniqueError) {
            console.log('❌ Failed to create unique destination:', uniqueError.message);
        } else {
            console.log('✅ Successfully created unique destination:', uniqueData[0]);

            // Clean up the test destination
            const { error: cleanupError } = await supabase
                .from('destinations')
                .delete()
                .eq('id', uniqueData[0].id);

            if (cleanupError) {
                console.error('⚠️  Failed to clean up test destination:', cleanupError);
            } else {
                console.log('🧹 Test destination cleaned up');
            }
        }

        console.log('\n🎉 Duplicate prevention test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testDuplicatePrevention();




