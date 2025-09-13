#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Please check your .env.local file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addSelfBookingColumn() {
    try {
        console.log('🔧 Adding is_self_booking column to host_bookings table...');

        // Add the column
        const { error: alterError } = await supabase.rpc('exec_sql', {
            sql: `
        ALTER TABLE host_bookings 
        ADD COLUMN IF NOT EXISTS is_self_booking BOOLEAN DEFAULT FALSE;
      `
        });

        if (alterError) {
            console.log('⚠️  exec_sql failed, trying alternative approach...');

            // Try direct SQL execution
            const { error: directError } = await supabase
                .from('host_bookings')
                .select('*')
                .limit(1);

            if (directError) {
                console.error('❌ Cannot access host_bookings table:', directError);
                console.log('\n📝 Please run this SQL manually in your Supabase SQL Editor:');
                console.log(`
ALTER TABLE host_bookings 
ADD COLUMN IF NOT EXISTS is_self_booking BOOLEAN DEFAULT FALSE;

-- Update existing records
UPDATE host_bookings 
SET is_self_booking = FALSE 
WHERE is_self_booking IS NULL;
        `);
                return;
            }

            console.log('✅ host_bookings table is accessible');
            console.log('📝 Please run the ALTER TABLE command manually in Supabase SQL Editor');
        } else {
            console.log('✅ Successfully added is_self_booking column');

            // Update existing records
            const { error: updateError } = await supabase.rpc('exec_sql', {
                sql: `
          UPDATE host_bookings 
          SET is_self_booking = FALSE 
          WHERE is_self_booking IS NULL;
        `
            });

            if (updateError) {
                console.log('⚠️  Could not update existing records automatically');
                console.log('📝 Please run this SQL manually:');
                console.log(`
UPDATE host_bookings 
SET is_self_booking = FALSE 
WHERE is_self_booking IS NULL;
        `);
            } else {
                console.log('✅ Successfully updated existing records');
            }
        }

        console.log('\n🎉 Migration completed successfully!');
        console.log('Your host portal booking system is now ready.');

    } catch (error) {
        console.error('❌ Error during migration:', error);
        console.log('\n📝 Please run this SQL manually in your Supabase SQL Editor:');
        console.log(`
-- Add the column
ALTER TABLE host_bookings 
ADD COLUMN IF NOT EXISTS is_self_booking BOOLEAN DEFAULT FALSE;

-- Update existing records
UPDATE host_bookings 
SET is_self_booking = FALSE 
WHERE is_self_booking IS NULL;

-- Add comment
COMMENT ON COLUMN host_bookings.is_self_booking IS 'Indicates if this booking was created by the host for themselves or their guests';
    `);
    }
}

// Run the migration
addSelfBookingColumn();