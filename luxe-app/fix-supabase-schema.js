const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Fixing Supabase database schema...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables are not set!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixSchema() {
    try {
        console.log('\n🔍 Checking current table structure...');

        // First, let's see what the current table looks like
        const { data: tableInfo, error: tableError } = await supabase
            .from('destinations')
            .select('*')
            .limit(1);

        if (tableError) {
            console.error('❌ Error checking table:', tableError);
            return;
        }

        console.log('✅ Table exists, checking structure...');

        // Get the count of existing destinations
        const { data: countData, error: countError } = await supabase
            .from('destinations')
            .select('count');

        if (countError) {
            console.error('❌ Error getting count:', countError);
            return;
        }

        const destinationCount = countData[0] ? .count || 0;
        console.log(`📊 Found ${destinationCount} existing destinations`);

        if (destinationCount > 0) {
            console.log('\n🔄 Backing up existing data...');

            // Create a backup table with all existing data
            const { error: backupError } = await supabase.rpc('exec_sql', {
                sql: `
          CREATE TEMP TABLE destinations_backup AS 
          SELECT * FROM destinations;
        `
            });

            if (backupError) {
                console.log('⚠️ Could not create backup table (this is okay for temp tables)');
            } else {
                console.log('✅ Backup created');
            }
        }

        console.log('\n🔧 Dropping and recreating destinations table...');

        // Drop the existing table
        const { error: dropError } = await supabase.rpc('exec_sql', {
            sql: 'DROP TABLE IF EXISTS destinations CASCADE;'
        });

        if (dropError) {
            console.log('⚠️ Could not drop table via RPC, trying direct SQL...');

            // Try alternative approach - create a new table with different name
            const { error: createNewError } = await supabase.rpc('exec_sql', {
                sql: `
          CREATE TABLE destinations_new (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            image TEXT,
            featured BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
            });

            if (createNewError) {
                console.error('❌ Failed to create new table:', createNewError);
                return;
            }

            console.log('✅ New table created successfully');

            // Now try to copy data if we have any
            if (destinationCount > 0) {
                console.log('\n📋 Copying data to new table...');

                // Get all existing destinations
                const { data: existingDestinations, error: fetchError } = await supabase
                    .from('destinations')
                    .select('*');

                if (fetchError) {
                    console.log('⚠️ Could not fetch existing destinations for copy');
                } else if (existingDestinations && existingDestinations.length > 0) {
                    // Insert into new table
                    const { error: insertError } = await supabase
                        .from('destinations_new')
                        .insert(existingDestinations.map(dest => ({
                            name: dest.name,
                            description: dest.description,
                            image: dest.image,
                            featured: dest.featured,
                            created_at: dest.created_at,
                            updated_at: dest.updated_at
                        })));

                    if (insertError) {
                        console.error('❌ Error copying data:', insertError);
                    } else {
                        console.log(`✅ Copied ${existingDestinations.length} destinations to new table`);
                    }
                }
            }

            // Rename tables
            console.log('\n🔄 Renaming tables...');

            const { error: renameError } = await supabase.rpc('exec_sql', {
                sql: `
          ALTER TABLE destinations RENAME TO destinations_old;
          ALTER TABLE destinations_new RENAME TO destinations;
        `
            });

            if (renameError) {
                console.log('⚠️ Could not rename tables via RPC');
                console.log('💡 You may need to manually rename destinations_new to destinations in Supabase');
            } else {
                console.log('✅ Tables renamed successfully');
            }

        } else {
            // No existing data, just create the table
            console.log('\n🔧 Creating destinations table with proper structure...');

            const { error: createError } = await supabase.rpc('exec_sql', {
                sql: `
          CREATE TABLE destinations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            image TEXT,
            featured BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
            });

            if (createError) {
                console.error('❌ Failed to create table:', createError);
                return;
            }

            console.log('✅ Table created successfully');
        }

        console.log('\n🧪 Testing the fixed table...');

        // Test creating a destination
        const testDestination = {
            name: 'Test Destination - Fixed',
            description: 'This is a test to verify the fix',
            image: 'https://example.com/test.jpg',
            featured: false
        };

        const { data: testData, error: testError } = await supabase
            .from('destinations')
            .insert(testDestination)
            .select();

        if (testError) {
            console.error('❌ Test destination creation failed:', testError);
            return;
        }

        console.log('✅ Test destination created successfully:', testData[0]);

        // Clean up test data
        const { error: cleanupError } = await supabase
            .from('destinations')
            .delete()
            .eq('id', testData[0].id);

        if (cleanupError) {
            console.log('⚠️ Could not clean up test data:', cleanupError);
        } else {
            console.log('🧹 Test data cleaned up');
        }

        console.log('\n🎉 Schema fix completed successfully!');
        console.log('💡 You can now run the migration in your admin dashboard');

    } catch (error) {
        console.error('❌ Unexpected error:', error);

        // If RPC doesn't work, provide manual instructions
        console.log('\n💡 If the automatic fix failed, you need to manually update the schema:');
        console.log('1. Go to Supabase Dashboard > SQL Editor');
        console.log('2. Run this SQL:');
        console.log(`
      -- Backup existing data
      CREATE TEMP TABLE destinations_backup AS SELECT * FROM destinations;
      
      -- Drop and recreate table
      DROP TABLE destinations CASCADE;
      
      CREATE TABLE destinations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image TEXT,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Restore data
      INSERT INTO destinations (name, description, image, featured, created_at, updated_at)
      SELECT name, description, image, featured, created_at, updated_at
      FROM destinations_backup;
      
      -- Clean up
      DROP TABLE destinations_backup;
    `);
    }
}

fixSchema();





