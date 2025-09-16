const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://okphwjvhzofxevxmlapn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcGh3anZoem9meGV2dG1sYXBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg4NTg2MywiZXhwIjoyMDcxNDYxODYzfQ.N2HiHya_yuS3hsWt8GJsDK9P8nZ1jpaKlUxj6ST-SV8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProperties() {
    try {
        console.log('Checking Supabase properties table...');

        // Try to fetch properties
        const { data, error } = await supabase
            .from('properties')
            .select('*');

        if (error) {
            console.error('Error fetching properties:', error);
            return;
        }

        console.log(`Found ${data.length} properties in Supabase:`);
        data.forEach(p => {
            console.log(`- ${p.name} (${p.featured ? 'Featured' : 'Regular'}) - ${p.location}`);
        });

    } catch (error) {
        console.error('Check failed:', error);
    }
}

checkProperties();