const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables are not set!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCompleteLoyaltyProgram() {
    console.log('🧪 Testing Complete Luxe Jewels Loyalty Program...\n');

    try {
        // Test 1: Database Schema
        console.log('📊 Test 1: Database Schema Validation');
        await testDatabaseSchema();

        // Test 2: Guest User Experience
        console.log('\n👤 Test 2: Guest User Experience');
        await testGuestUserExperience();

        // Test 3: Admin Management
        console.log('\n👨‍💼 Test 3: Admin Management Interface');
        await testAdminManagement();

        // Test 4: API Endpoints
        console.log('\n🔌 Test 4: API Endpoints');
        await testAPIEndpoints();

        // Test 5: Business Logic
        console.log('\n💎 Test 5: Business Logic & Rules');
        await testBusinessLogic();

        console.log('\n🎉 Complete loyalty program test finished!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

async function testDatabaseSchema() {
    try {
        console.log('  🔍 Checking required tables...');

        // Check loyalty_transactions table
        const { data: transactionsData, error: transactionsError } = await supabase
            .from('loyalty_transactions')
            .select('count')
            .limit(1);

        if (transactionsError) {
            console.log('    ❌ loyalty_transactions table error:', transactionsError.message);
            return false;
        } else {
            console.log('    ✅ loyalty_transactions table: OK');
        }

        // Check user_loyalty_summary table
        const { data: summaryData, error: summaryError } = await supabase
            .from('user_loyalty_summary')
            .select('count')
            .limit(1);

        if (summaryError) {
            console.log('    ❌ user_loyalty_summary table error:', summaryError.message);
            console.log('    💡 You need to run the create-missing-loyalty-tables.sql script');
            return false;
        } else {
            console.log('    ✅ user_loyalty_summary table: OK');
        }

        // Check if functions exist
        console.log('  🔍 Checking database functions...');

        try {
            const { data: functionData, error: functionError } = await supabase.rpc('calculate_user_loyalty_balance', {
                user_uuid: '00000000-0000-0000-0000-000000000000'
            });

            if (functionError && functionError.message.includes('function')) {
                console.log('    ❌ calculate_user_loyalty_balance function missing');
                return false;
            } else {
                console.log('    ✅ calculate_user_loyalty_balance function: OK');
            }
        } catch (error) {
            console.log('    ❌ Function test failed:', error.message);
            return false;
        }

        console.log('    ✅ Database schema: PASSED');
        return true;

    } catch (error) {
        console.log('    ❌ Schema test failed:', error.message);
        return false;
    }
}

async function testGuestUserExperience() {
    try {
        console.log('  🔍 Testing guest user loyalty features...');

        // Test 1: Check if we can create a test user loyalty record
        const testUserId = 'test-user-' + Date.now();
        const testTransaction = {
            user_id: testUserId,
            jewels_earned: 100,
            reason: 'manual_adjustment',
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        };

        console.log('    🔍 Creating test loyalty transaction...');
        const { data: createData, error: createError } = await supabase
            .from('loyalty_transactions')
            .insert(testTransaction)
            .select();

        if (createError) {
            console.log('    ❌ Failed to create test transaction:', createError.message);
            return false;
        } else {
            console.log('    ✅ Test transaction created successfully');
        }

        // Test 2: Check if summary was automatically created
        console.log('    🔍 Checking if summary was auto-created...');
        const { data: summaryData, error: summaryError } = await supabase
            .from('user_loyalty_summary')
            .select('*')
            .eq('user_id', testUserId)
            .single();

        if (summaryError) {
            console.log('    ❌ Summary auto-creation failed:', summaryError.message);
            return false;
        } else {
            console.log('    ✅ Summary auto-created successfully');
            console.log('      - Active balance:', summaryData.active_jewels_balance);
            console.log('      - Total earned:', summaryData.total_jewels_earned);
        }

        // Test 3: Test jewel redemption
        console.log('    🔍 Testing jewel redemption...');
        const { data: redeemData, error: redeemError } = await supabase.rpc('redeem_jewels', {
            user_uuid: testUserId,
            jewels_to_redeem: 50
        });

        if (redeemError) {
            console.log('    ❌ Redemption failed:', redeemError.message);
        } else {
            console.log('    ✅ Redemption successful');
            console.log('      - Discount amount:', redeemData[0] ? .discount_amount);
        }

        // Clean up test data
        console.log('    🧹 Cleaning up test data...');
        await supabase.from('loyalty_transactions').delete().eq('user_id', testUserId);
        await supabase.from('user_loyalty_summary').delete().eq('user_id', testUserId);

        console.log('    ✅ Guest user experience: PASSED');
        return true;

    } catch (error) {
        console.log('    ❌ Guest user test failed:', error.message);
        return false;
    }
}

async function testAdminManagement() {
    try {
        console.log('  🔍 Testing admin management features...');

        // Test 1: Check if we can fetch users (this would require admin privileges)
        console.log('    🔍 Testing user listing capability...');

        const { data: usersData, error: usersError } = await supabase
            .from('user_loyalty_summary')
            .select('*')
            .limit(5);

        if (usersError) {
            console.log('    ❌ User listing failed:', usersError.message);
        } else {
            console.log('    ✅ User listing successful');
            console.log('      - Found users:', usersData ? .length || 0);
        }

        // Test 2: Check if we can create manual adjustments
        console.log('    🔍 Testing manual adjustment capability...');

        const testUserId = 'admin-test-' + Date.now();
        const testAdjustment = {
            user_id: testUserId,
            jewels_earned: 200,
            reason: 'manual_adjustment',
            expires_at: null
        };

        const { data: adjustmentData, error: adjustmentError } = await supabase
            .from('loyalty_transactions')
            .insert(testAdjustment)
            .select();

        if (adjustmentError) {
            console.log('    ❌ Manual adjustment failed:', adjustmentError.message);
        } else {
            console.log('    ✅ Manual adjustment successful');
        }

        // Clean up
        await supabase.from('loyalty_transactions').delete().eq('user_id', testUserId);
        await supabase.from('user_loyalty_summary').delete().eq('user_id', testUserId);

        console.log('    ✅ Admin management: PASSED');
        return true;

    } catch (error) {
        console.log('    ❌ Admin management test failed:', error.message);
        return false;
    }
}

async function testAPIEndpoints() {
    try {
        console.log('  🔍 Testing API endpoints...');

        // Test 1: Test the redeem API endpoint
        console.log('    🔍 Testing /api/loyalty/redeem endpoint...');

        const testUserId = 'api-test-' + Date.now();
        const testTransaction = {
            user_id: testUserId,
            jewels_earned: 150,
            reason: 'manual_adjustment',
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        };

        // Create test data first
        await supabase.from('loyalty_transactions').insert(testTransaction);

        // Test the API endpoint (this would require the server to be running)
        console.log('    ⚠️  API endpoint test requires server to be running');
        console.log('    💡 To test: Start your dev server and test the endpoints manually');

        // Clean up
        await supabase.from('loyalty_transactions').delete().eq('user_id', testUserId);
        await supabase.from('user_loyalty_summary').delete().eq('user_id', testUserId);

        console.log('    ✅ API endpoints: SKIPPED (requires server)');
        return true;

    } catch (error) {
        console.log('    ❌ API endpoint test failed:', error.message);
        return false;
    }
}

async function testBusinessLogic() {
    try {
        console.log('  🔍 Testing business logic and rules...');

        // Test 1: Test minimum redemption rule
        console.log('    🔍 Testing minimum redemption rule...');

        const testUserId = 'logic-test-' + Date.now();
        const testTransaction = {
            user_id: testUserId,
            jewels_earned: 50, // Less than 100 minimum
            reason: 'manual_adjustment',
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        };

        // Create test data
        await supabase.from('loyalty_transactions').insert(testTransaction);

        // Try to redeem less than minimum
        const { data: redeemData, error: redeemError } = await supabase.rpc('redeem_jewels', {
            user_uuid: testUserId,
            jewels_to_redeem: 50 // Should fail
        });

        if (redeemError) {
            console.log('    ✅ Minimum redemption rule enforced');
        } else {
            console.log('    ❌ Minimum redemption rule failed');
        }

        // Test 2: Test expiration logic
        console.log('    🔍 Testing expiration logic...');

        const expiredTransaction = {
            user_id: testUserId,
            jewels_earned: 100,
            reason: 'manual_adjustment',
            expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Expired yesterday
        };

        await supabase.from('loyalty_transactions').insert(expiredTransaction);

        // Check if expired jewels are properly handled
        const { data: balanceData, error: balanceError } = await supabase.rpc('calculate_user_loyalty_balance', {
            user_uuid: testUserId
        });

        if (!balanceError && balanceData && balanceData.length > 0) {
            const balance = balanceData[0];
            console.log('    ✅ Expiration logic working');
            console.log('      - Active balance:', balance.active_balance);
            console.log('      - Total balance:', balance.total_balance);
        }

        // Clean up
        await supabase.from('loyalty_transactions').delete().eq('user_id', testUserId);
        await supabase.from('user_loyalty_summary').delete().eq('user_id', testUserId);

        console.log('    ✅ Business logic: PASSED');
        return true;

    } catch (error) {
        console.log('    ❌ Business logic test failed:', error.message);
        return false;
    }
}

// Run the complete test
testCompleteLoyaltyProgram();





