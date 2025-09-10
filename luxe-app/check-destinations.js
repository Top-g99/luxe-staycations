const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Checking destinations data...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables are not set!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDestinations() {
    try {
        console.log('\n📊 Fetching destinations from Supabase...');

        const { data: destinations, error } = await supabase
            .from('destinations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching destinations:', error);
            return;
        }

        console.log(`✅ Found ${destinations.length} destinations in Supabase`);

        // Check for duplicates by name
        const nameCounts = {};
        const duplicates = [];

        destinations.forEach(dest => {
            if (nameCounts[dest.name]) {
                nameCounts[dest.name]++;
                duplicates.push(dest);
            } else {
                nameCounts[dest.name] = 1;
            }
        });

        console.log('\n🔍 Duplicate Analysis:');
        Object.entries(nameCounts).forEach(([name, count]) => {
            if (count > 1) {
                console.log(`⚠️  "${name}" appears ${count} times`);
            }
        });

        if (duplicates.length > 0) {
            console.log(`\n🚨 Found ${duplicates.length} duplicate destinations`);
            console.log('\n📋 Duplicate entries:');
            duplicates.forEach(dest => {
                console.log(`   - ID: ${dest.id}, Name: "${dest.name}", Created: ${dest.created_at}`);
            });

            console.log('\n💡 To fix duplicates, you can:');
            console.log('   1. Delete duplicate entries from the admin panel');
            console.log('   2. Or run a cleanup script to remove duplicates automatically');

            // Offer to clean up duplicates
            if (duplicates.length > 0) {
                console.log('\n🧹 Would you like me to create a cleanup script?');
                console.log('   This will remove duplicate destinations keeping only the most recent one for each name.');
            }
        } else {
            console.log('\n✅ No duplicate destinations found!');
        }

        console.log('\n📋 All destinations:');
        destinations.forEach(dest => {
            console.log(`   - ${dest.name} (ID: ${dest.id}, Featured: ${dest.featured})`);
        });

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

checkDestinations();





