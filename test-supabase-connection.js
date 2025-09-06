const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables are not set!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    try {
        console.log('\n🔍 Testing basic connection...');

        // Test 1: Basic connection
        const { data, error } = await supabase.from('destinations').select('count').limit(1);

        if (error) {
            console.error('❌ Connection test failed:', error);

            if (error.code === 'PGRST116') {
                console.error('💡 This suggests the table "destinations" does not exist.');
                console.error('💡 You need to run the database schema first.');
            } else if (error.code === 'PGRST301') {
                console.error('💡 This suggests a permission/authentication issue.');
            }

            return;
        }

        console.log('✅ Basic connection successful');
        console.log('📊 Data:', data);

        // Test 2: Try to create a test destination
        console.log('\n🔍 Testing destination creation...');
        const testDestination = {
            name: 'Test Destination',
            description: 'This is a test destination',
            image: 'https://example.com/test.jpg',
            featured: false
        };

        const { data: createData, error: createError } = await supabase
            .from('destinations')
            .insert(testDestination)
            .select();

        if (createError) {
            console.error('❌ Destination creation failed:', createError);
        } else {
            console.log('✅ Destination creation successful:', createData);

            // Clean up - delete the test destination
            const { error: deleteError } = await supabase
                .from('destinations')
                .delete()
                .eq('id', createData[0].id);

            if (deleteError) {
                console.error('⚠️ Failed to clean up test destination:', deleteError);
            } else {
                console.log('🧹 Test destination cleaned up');
            }
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testConnection();




