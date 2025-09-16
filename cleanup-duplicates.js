const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧹 Cleaning up duplicate destinations...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables are not set!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanupDuplicates() {
    try {
        console.log('\n📊 Fetching all destinations...');

        const { data: destinations, error } = await supabase
            .from('destinations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching destinations:', error);
            return;
        }

        console.log(`✅ Found ${destinations.length} total destinations`);

        // Group destinations by name
        const destinationsByName = {};
        destinations.forEach(dest => {
            if (!destinationsByName[dest.name]) {
                destinationsByName[dest.name] = [];
            }
            destinationsByName[dest.name].push(dest);
        });

        // Find duplicates
        const duplicatesToRemove = [];
        const keepDestinations = [];

        Object.entries(destinationsByName).forEach(([name, dests]) => {
            if (dests.length > 1) {
                console.log(`\n⚠️  "${name}" has ${dests.length} instances:`);

                // Sort by creation date (newest first) and keep the first one
                const sorted = dests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                const keep = sorted[0];
                const remove = sorted.slice(1);

                console.log(`   ✅ Keeping: ${keep.id} (created: ${keep.created_at})`);
                remove.forEach(dest => {
                    console.log(`   🗑️  Removing: ${dest.id} (created: ${dest.created_at})`);
                    duplicatesToRemove.push(dest.id);
                });

                keepDestinations.push(keep);
            } else {
                // Single instance, keep it
                keepDestinations.push(dests[0]);
            }
        });

        if (duplicatesToRemove.length === 0) {
            console.log('\n✅ No duplicates found!');
            return;
        }

        console.log(`\n🚨 Found ${duplicatesToRemove.length} duplicate destinations to remove`);
        console.log(`💾 Will keep ${keepDestinations.length} unique destinations`);

        // Ask for confirmation
        console.log('\n⚠️  WARNING: This will permanently delete duplicate destinations!');
        console.log('   Make sure you have a backup if needed.');

        // For safety, let's just show what would be deleted without actually deleting
        console.log('\n📋 Summary of what would be deleted:');
        duplicatesToRemove.forEach(id => {
            const dest = destinations.find(d => d.id === id);
            console.log(`   - ${dest.name} (ID: ${id})`);
        });

        console.log('\n💡 To actually delete the duplicates, you can:');
        console.log('   1. Use the admin panel to manually delete each duplicate');
        console.log('   2. Or modify this script to uncomment the deletion code');

        // Uncomment the following lines to actually perform the deletion:
        /*
        console.log('\n🗑️  Deleting duplicate destinations...');
    
        for (const id of duplicatesToRemove) {
          try {
            const { error: deleteError } = await supabase
              .from('destinations')
              .delete()
              .eq('id', id);
            
            if (deleteError) {
              console.error(`❌ Failed to delete ${id}:`, deleteError);
            } else {
              console.log(`✅ Deleted duplicate: ${id}`);
            }
          } catch (error) {
            console.error(`❌ Error deleting ${id}:`, error);
          }
        }
    
        console.log('\n🎉 Cleanup completed!');
        */

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

cleanupDuplicates();





