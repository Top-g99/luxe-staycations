const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables are not set!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyLoyaltySchema() {
    console.log('🔍 Verifying Loyalty Program Schema...\n');

    try {
        // Test 1: Check if tables exist
        console.log('📊 Test 1: Table Existence');

        const { data: transactionsData, error: transactionsError } = await supabase
            .from('loyalty_transactions')
            .select('count')
            .limit(1);

        if (transactionsError) {
            console.log('  ❌ loyalty_transactions table:', transactionsError.message);
        } else {
            console.log('  ✅ loyalty_transactions table: OK');
        }

        const { data: summaryData, error: summaryError } = await supabase
            .from('user_loyalty_summary')
            .select('count')
            .limit(1);

        if (summaryError) {
            console.log('  ❌ user_loyalty_summary table:', summaryError.message);
        } else {
            console.log('  ✅ user_loyalty_summary table: OK');
        }

        // Test 2: Check table structure
        console.log('\n📋 Test 2: Table Structure');

        try {
            const { data: sampleData, error: sampleError } = await supabase
                .from('loyalty_transactions')
                .select('*')
                .limit(1);

            if (sampleError) {
                console.log('  ❌ Structure check failed:', sampleError.message);
            } else if (sampleData && sampleData.length > 0) {
                const columns = Object.keys(sampleData[0]);
                console.log('  ✅ loyalty_transactions columns:', columns.join(', '));

                const requiredColumns = ['id', 'user_id', 'jewels_earned', 'jewels_redeemed', 'reason', 'expires_at', 'created_at', 'updated_at'];
                const missingColumns = requiredColumns.filter(col => !columns.includes(col));

                if (missingColumns.length > 0) {
                    console.log('  ❌ Missing columns:', missingColumns.join(', '));
                } else {
                    console.log('  ✅ All required columns present');
                }
            }
        } catch (error) {
            console.log('  ❌ Structure check error:', error.message);
        }

        // Test 3: Check functions
        console.log('\n⚙️  Test 3: Database Functions');

        try {
            const { data: functionData, error: functionError } = await supabase.rpc('calculate_user_loyalty_balance', {
                user_uuid: '00000000-0000-0000-0000-000000000000'
            });

            if (functionError && functionError.message.includes('function')) {
                console.log('  ❌ calculate_user_loyalty_balance function missing');
            } else {
                console.log('  ✅ calculate_user_loyalty_balance function: OK');
            }
        } catch (error) {
            console.log('  ❌ Function test failed:', error.message);
        }

        // Test 4: Check sample data
        console.log('\n📊 Test 4: Sample Data');

        try {
            const { data: sampleTransactions, error: sampleError } = await supabase
                .from('loyalty_transactions')
                .select('*')
                .limit(3);

            if (sampleError) {
                console.log('  ❌ Sample data check failed:', sampleError.message);
            } else {
                console.log('  ✅ Sample transactions found:', sampleTransactions ? .length || 0);
                if (sampleTransactions && sampleTransactions.length > 0) {
                    console.log('  📝 Sample transaction:', {
                        user_id: sampleTransactions[0].user_id,
                        jewels_earned: sampleTransactions[0].jewels_earned,
                        reason: sampleTransactions[0].reason
                    });
                }
            }
        } catch (error) {
            console.log('  ❌ Sample data check error:', error.message);
        }

        console.log('\n🎯 Schema Verification Complete!');
        console.log('\n💡 Next Steps:');
        console.log('   1. If any tests failed, run the setup-complete-loyalty-schema.sql script');
        console.log('   2. Start your dev server: npm run dev');
        console.log('   3. Test the admin panel: /admin/loyalty');
        console.log('   4. Test guest features: /guest/dashboard');

    } catch (error) {
        console.error('❌ Verification failed:', error);
    }
}

verifyLoyaltySchema();





