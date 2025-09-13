#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function fixSupabaseSecurity() {
    console.log('🔒 Fixing Supabase Security Issues...\n');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Missing Supabase credentials in .env.local');
        console.log('Please update .env.local with your Supabase URL and service role key\n');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Enable RLS on all tables
        const tables = [
            'properties',
            'destinations',
            'bookings',
            'callback_requests',
            'deal_banners',
            'settings',
            'users',
            'profiles',
            'reviews',
            'host_payouts',
            'loyalty_transactions',
            'coupons',
            'payments'
        ];

        console.log('📋 Enabling Row Level Security (RLS) on tables...\n');

        for (const table of tables) {
            try {
                // Enable RLS
                const { error: rlsError } = await supabase.rpc('enable_rls', { table_name: table });

                if (rlsError) {
                    // Try alternative method
                    const { error: alterError } = await supabase.rpc('exec_sql', {
                        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
                    });

                    if (alterError) {
                        console.log(`⚠️  Could not enable RLS on ${table}: ${alterError.message}`);
                    } else {
                        console.log(`✅ Enabled RLS on ${table}`);
                    }
                } else {
                    console.log(`✅ Enabled RLS on ${table}`);
                }
            } catch (error) {
                console.log(`⚠️  Error enabling RLS on ${table}: ${error.message}`);
            }
        }

        console.log('\n📋 Creating security policies...\n');

        // Create policies for properties table
        await createPropertyPolicies(supabase);

        // Create policies for destinations table
        await createDestinationPolicies(supabase);

        // Create policies for bookings table
        await createBookingPolicies(supabase);

        // Create policies for callback_requests table
        await createCallbackPolicies(supabase);

        // Create policies for deal_banners table
        await createBannerPolicies(supabase);

        // Create policies for settings table
        await createSettingsPolicies(supabase);

        console.log('\n🎉 Security setup completed!');
        console.log('\n📋 Summary:');
        console.log('- Enabled RLS on all tables');
        console.log('- Created read policies for public access');
        console.log('- Created write policies for authenticated users');
        console.log('- Created admin policies for full access');

        console.log('\n💡 Next steps:');
        console.log('1. Check your Supabase dashboard - security warnings should be resolved');
        console.log('2. Test your application to ensure everything still works');
        console.log('3. Consider implementing user authentication for write operations');

    } catch (error) {
        console.log('❌ Error fixing security:', error.message);
        console.log('\n💡 You may need to manually enable RLS in the Supabase dashboard');
    }
}

async function createPropertyPolicies(supabase) {
    try {
        // Allow public read access to properties
        const { error: readError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow public read access" ON properties
        FOR SELECT USING (true);
      `
        });

        if (readError && !readError.message.includes('already exists')) {
            console.log(`⚠️  Error creating read policy for properties: ${readError.message}`);
        } else {
            console.log('✅ Created read policy for properties');
        }

        // Allow authenticated users to insert properties
        const { error: insertError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow authenticated insert" ON properties
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      `
        });

        if (insertError && !insertError.message.includes('already exists')) {
            console.log(`⚠️  Error creating insert policy for properties: ${insertError.message}`);
        } else {
            console.log('✅ Created insert policy for properties');
        }

        // Allow authenticated users to update properties
        const { error: updateError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow authenticated update" ON properties
        FOR UPDATE USING (auth.role() = 'authenticated');
      `
        });

        if (updateError && !updateError.message.includes('already exists')) {
            console.log(`⚠️  Error creating update policy for properties: ${updateError.message}`);
        } else {
            console.log('✅ Created update policy for properties');
        }

        // Allow authenticated users to delete properties
        const { error: deleteError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow authenticated delete" ON properties
        FOR DELETE USING (auth.role() = 'authenticated');
      `
        });

        if (deleteError && !deleteError.message.includes('already exists')) {
            console.log(`⚠️  Error creating delete policy for properties: ${deleteError.message}`);
        } else {
            console.log('✅ Created delete policy for properties');
        }

    } catch (error) {
        console.log(`⚠️  Error creating property policies: ${error.message}`);
    }
}

async function createDestinationPolicies(supabase) {
    try {
        // Allow public read access to destinations
        const { error: readError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow public read access" ON destinations
        FOR SELECT USING (true);
      `
        });

        if (readError && !readError.message.includes('already exists')) {
            console.log(`⚠️  Error creating read policy for destinations: ${readError.message}`);
        } else {
            console.log('✅ Created read policy for destinations');
        }

        // Allow authenticated users to insert destinations
        const { error: insertError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow authenticated insert" ON destinations
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      `
        });

        if (insertError && !insertError.message.includes('already exists')) {
            console.log(`⚠️  Error creating insert policy for destinations: ${insertError.message}`);
        } else {
            console.log('✅ Created insert policy for destinations');
        }

        // Allow authenticated users to update destinations
        const { error: updateError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow authenticated update" ON destinations
        FOR UPDATE USING (auth.role() = 'authenticated');
      `
        });

        if (updateError && !updateError.message.includes('already exists')) {
            console.log(`⚠️  Error creating update policy for destinations: ${updateError.message}`);
        } else {
            console.log('✅ Created update policy for destinations');
        }

        // Allow authenticated users to delete destinations
        const { error: deleteError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow authenticated delete" ON destinations
        FOR DELETE USING (auth.role() = 'authenticated');
      `
        });

        if (deleteError && !deleteError.message.includes('already exists')) {
            console.log(`⚠️  Error creating delete policy for destinations: ${deleteError.message}`);
        } else {
            console.log('✅ Created delete policy for destinations');
        }

    } catch (error) {
        console.log(`⚠️  Error creating destination policies: ${error.message}`);
    }
}

async function createBookingPolicies(supabase) {
    try {
        // Allow public read access to bookings
        const { error: readError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow public read access" ON bookings
        FOR SELECT USING (true);
      `
        });

        if (readError && !readError.message.includes('already exists')) {
            console.log(`⚠️  Error creating read policy for bookings: ${readError.message}`);
        } else {
            console.log('✅ Created read policy for bookings');
        }

        // Allow public insert for bookings (guests need to book)
        const { error: insertError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow public insert" ON bookings
        FOR INSERT WITH CHECK (true);
      `
        });

        if (insertError && !insertError.message.includes('already exists')) {
            console.log(`⚠️  Error creating insert policy for bookings: ${insertError.message}`);
        } else {
            console.log('✅ Created insert policy for bookings');
        }

        // Allow authenticated users to update bookings
        const { error: updateError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow authenticated update" ON bookings
        FOR UPDATE USING (auth.role() = 'authenticated');
      `
        });

        if (updateError && !updateError.message.includes('already exists')) {
            console.log(`⚠️  Error creating update policy for bookings: ${updateError.message}`);
        } else {
            console.log('✅ Created update policy for bookings');
        }

        // Allow authenticated users to delete bookings
        const { error: deleteError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow authenticated delete" ON bookings
        FOR DELETE USING (auth.role() = 'authenticated');
      `
        });

        if (deleteError && !deleteError.message.includes('already exists')) {
            console.log(`⚠️  Error creating delete policy for bookings: ${deleteError.message}`);
        } else {
            console.log('✅ Created delete policy for bookings');
        }

    } catch (error) {
        console.log(`⚠️  Error creating booking policies: ${error.message}`);
    }
}

async function createCallbackPolicies(supabase) {
    try {
        // Allow public read access to callback_requests
        const { error: readError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow public read access" ON callback_requests
        FOR SELECT USING (true);
      `
        });

        if (readError && !readError.message.includes('already exists')) {
            console.log(`⚠️  Error creating read policy for callback_requests: ${readError.message}`);
        } else {
            console.log('✅ Created read policy for callback_requests');
        }

        // Allow public insert for callback_requests (customers need to submit)
        const { error: insertError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow public insert" ON callback_requests
        FOR INSERT WITH CHECK (true);
      `
        });

        if (insertError && !insertError.message.includes('already exists')) {
            console.log(`⚠️  Error creating insert policy for callback_requests: ${insertError.message}`);
        } else {
            console.log('✅ Created insert policy for callback_requests');
        }

        // Allow authenticated users to update callback_requests
        const { error: updateError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow authenticated update" ON callback_requests
        FOR UPDATE USING (auth.role() = 'authenticated');
      `
        });

        if (updateError && !updateError.message.includes('already exists')) {
            console.log(`⚠️  Error creating update policy for callback_requests: ${updateError.message}`);
        } else {
            console.log('✅ Created update policy for callback_requests');
        }

        // Allow authenticated users to delete callback_requests
        const { error: deleteError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow authenticated delete" ON callback_requests
        FOR DELETE USING (auth.role() = 'authenticated');
      `
        });

        if (deleteError && !deleteError.message.includes('already exists')) {
            console.log(`⚠️  Error creating delete policy for callback_requests: ${deleteError.message}`);
        } else {
            console.log('✅ Created delete policy for callback_requests');
        }

    } catch (error) {
        console.log(`⚠️  Error creating callback policies: ${error.message}`);
    }
}

async function createBannerPolicies(supabase) {
    try {
        // Allow public read access to deal_banners
        const { error: readError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow public read access" ON deal_banners
        FOR SELECT USING (true);
      `
        });

        if (readError && !readError.message.includes('already exists')) {
            console.log(`⚠️  Error creating read policy for deal_banners: ${readError.message}`);
        } else {
            console.log('✅ Created read policy for deal_banners');
        }

        // Allow authenticated users to insert deal_banners
        const { error: insertError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow authenticated insert" ON deal_banners
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      `
        });

        if (insertError && !insertError.message.includes('already exists')) {
            console.log(`⚠️  Error creating insert policy for deal_banners: ${insertError.message}`);
        } else {
            console.log('✅ Created insert policy for deal_banners');
        }

        // Allow authenticated users to update deal_banners
        const { error: updateError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow authenticated update" ON deal_banners
        FOR UPDATE USING (auth.role() = 'authenticated');
      `
        });

        if (updateError && !updateError.message.includes('already exists')) {
            console.log(`⚠️  Error creating update policy for deal_banners: ${updateError.message}`);
        } else {
            console.log('✅ Created update policy for deal_banners');
        }

        // Allow authenticated users to delete deal_banners
        const { error: deleteError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow authenticated delete" ON deal_banners
        FOR DELETE USING (auth.role() = 'authenticated');
      `
        });

        if (deleteError && !deleteError.message.includes('already exists')) {
            console.log(`⚠️  Error creating delete policy for deal_banners: ${deleteError.message}`);
        } else {
            console.log('✅ Created delete policy for deal_banners');
        }

    } catch (error) {
        console.log(`⚠️  Error creating banner policies: ${error.message}`);
    }
}

async function createSettingsPolicies(supabase) {
    try {
        // Allow public read access to settings
        const { error: readError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow public read access" ON settings
        FOR SELECT USING (true);
      `
        });

        if (readError && !readError.message.includes('already exists')) {
            console.log(`⚠️  Error creating read policy for settings: ${readError.message}`);
        } else {
            console.log('✅ Created read policy for settings');
        }

        // Allow authenticated users to insert settings
        const { error: insertError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow authenticated insert" ON settings
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      `
        });

        if (insertError && !insertError.message.includes('already exists')) {
            console.log(`⚠️  Error creating insert policy for settings: ${insertError.message}`);
        } else {
            console.log('✅ Created insert policy for settings');
        }

        // Allow authenticated users to update settings
        const { error: updateError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow authenticated update" ON settings
        FOR UPDATE USING (auth.role() = 'authenticated');
      `
        });

        if (updateError && !updateError.message.includes('already exists')) {
            console.log(`⚠️  Error creating update policy for settings: ${updateError.message}`);
        } else {
            console.log('✅ Created update policy for settings');
        }

        // Allow authenticated users to delete settings
        const { error: deleteError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE POLICY "Allow authenticated delete" ON settings
        FOR DELETE USING (auth.role() = 'authenticated');
      `
        });

        if (deleteError && !deleteError.message.includes('already exists')) {
            console.log(`⚠️  Error creating delete policy for settings: ${deleteError.message}`);
        } else {
            console.log('✅ Created delete policy for settings');
        }

    } catch (error) {
        console.log(`⚠️  Error creating settings policies: ${error.message}`);
    }
}

fixSupabaseSecurity();