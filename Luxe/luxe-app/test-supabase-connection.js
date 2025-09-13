// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://okphwjvhzofxevtmlapn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcGh3anZoem9meGV2dG1sYXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODU4NjMsImV4cCI6MjA3MTQ2MTg2M30.xwb10Ff-7nCothbmnL8Kesp4n8TYyJLcdehPgrXLsUw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('🔍 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey.substring(0, 20) + '...');
    
    try {
        // Test basic connection
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .limit(1);
            
        if (error) {
            console.log('❌ Connection failed:', error.message);
            if (error.message.includes('relation "properties" does not exist')) {
                console.log('📋 Properties table does not exist. You need to run the SQL schema.');
                console.log('📁 Run the SQL from: supabase-properties-schema.sql');
            }
        } else {
            console.log('✅ Connection successful!');
            console.log('📊 Properties found:', data.length);
            if (data.length > 0) {
                console.log('📋 Sample property:', data[0]);
            }
        }
    } catch (err) {
        console.log('❌ Connection error:', err.message);
    }
}

testConnection();