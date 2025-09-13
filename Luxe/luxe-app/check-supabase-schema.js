// Check current Supabase properties table schema
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://okphwjvhzofxevtmlapn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcGh3anZoem9meGV2dG1sYXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODU4NjMsImV4cCI6MjA3MTQ2MTg2M30.xwb10Ff-7nCothbmnL8Kesp4n8TYyJLcdehPgrXLsUw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('🔍 Checking Supabase properties table schema...');
    
    try {
        // Get one property to see the current schema
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .limit(1);
            
        if (error) {
            console.log('❌ Error:', error.message);
        } else if (data && data.length > 0) {
            console.log('✅ Current schema fields:');
            const property = data[0];
            Object.keys(property).forEach(key => {
                console.log(`  - ${key}: ${typeof property[key]} (${property[key]})`);
            });
        } else {
            console.log('📋 No properties found');
        }
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
}

checkSchema();
