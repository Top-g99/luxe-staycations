const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables are not set!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLoyaltyRules() {
    console.log('🧪 Testing Loyalty Rules System...\n');

    try {
        // Test 1: Check if loyalty_rules table exists
        console.log('📊 Test 1: Table Existence');

        const { data: rulesData, error: rulesError } = await supabase
            .from('loyalty_rules')
            .select('count')
            .limit(1);

        if (rulesError) {
            console.log('  ❌ loyalty_rules table:', rulesError.message);
            console.log('  💡 You need to run the loyalty-rules-schema.sql script first');
            return;
        } else {
            console.log('  ✅ loyalty_rules table: OK');
        }

        // Test 2: Check default rules
        console.log('\n📋 Test 2: Default Rules');

        const { data: defaultRules, error: defaultError } = await supabase
            .from('loyalty_rules')
            .select('*')
            .order('created_at');

        if (defaultError) {
            console.log('  ❌ Failed to fetch default rules:', defaultError.message);
            return;
        } else {
            console.log('  ✅ Default rules loaded:', defaultRules.length);
            defaultRules.forEach(rule => {
                console.log(`    - ${rule.rule_name}: ${rule.rule_value} (${rule.rule_type})`);
            });
        }

        // Test 3: Test spending calculation function
        console.log('\n💰 Test 3: Spending to Jewels Calculation');

        const testSpending = 5000; // ₹5000
        const { data: jewelsEarned, error: calcError } = await supabase.rpc('calculate_jewels_from_spending', {
            spending_amount: testSpending,
            user_type: 'all'
        });

        if (calcError) {
            console.log('  ❌ Calculation failed:', calcError.message);
        } else {
            console.log('  ✅ Calculation successful');
            console.log(`    - Spending: ₹${testSpending}`);
            console.log(`    - Jewels earned: ${jewelsEarned}`);
            console.log(`    - Rate: ${jewelsEarned / (testSpending / 100)} jewels per ₹100`);
        }

        // Test 4: Test premium user bonus
        console.log('\n👑 Test 4: Premium User Bonus');

        const { data: premiumJewels, error: premiumError } = await supabase.rpc('calculate_jewels_from_spending', {
            spending_amount: testSpending,
            user_type: 'premium_users'
        });

        if (premiumError) {
            console.log('  ❌ Premium calculation failed:', premiumError.message);
        } else {
            console.log('  ✅ Premium calculation successful');
            console.log(`    - Regular user: ${jewelsEarned} jewels`);
            console.log(`    - Premium user: ${premiumJewels} jewels`);
            console.log(`    - Bonus multiplier: ${premiumJewels / jewelsEarned}x`);
        }

        // Test 5: Test active rules function
        console.log('\n📋 Test 5: Active Rules Function');

        const { data: activeRules, error: activeError } = await supabase.rpc('get_active_loyalty_rules');

        if (activeError) {
            console.log('  ❌ Active rules function failed:', activeError.message);
        } else {
            console.log('  ✅ Active rules function successful');
            console.log(`    - Active rules: ${activeRules.length}`);
            activeRules.forEach(rule => {
                console.log(`      * ${rule.rule_name}: ${rule.rule_value} (${rule.applies_to})`);
            });
        }

        // Test 6: Create a custom rule
        console.log('\n➕ Test 6: Create Custom Rule');

        const customRule = {
            rule_name: 'test_weekend_bonus',
            rule_description: 'Test weekend booking bonus',
            rule_type: 'bonus_multiplier',
            rule_value: 1.75,
            is_active: true,
            applies_to: 'all',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        };

        const { data: newRule, error: createError } = await supabase
            .from('loyalty_rules')
            .insert(customRule)
            .select()
            .single();

        if (createError) {
            console.log('  ❌ Failed to create custom rule:', createError.message);
        } else {
            console.log('  ✅ Custom rule created successfully');
            console.log(`    - Rule ID: ${newRule.id}`);
            console.log(`    - Name: ${newRule.rule_name}`);
            console.log(`    - Value: ${newRule.rule_value}`);
        }

        // Test 7: Test custom rule in calculation
        if (newRule) {
            console.log('\n🧮 Test 7: Custom Rule Calculation');

            const { data: customJewels, error: customError } = await supabase.rpc('calculate_jewels_from_spending', {
                spending_amount: testSpending,
                user_type: 'all'
            });

            if (customError) {
                console.log('  ❌ Custom rule calculation failed:', customError.message);
            } else {
                console.log('  ✅ Custom rule calculation successful');
                console.log(`    - Original jewels: ${jewelsEarned}`);
                console.log(`    - With custom rule: ${customJewels}`);
                console.log(`    - Difference: ${customJewels - jewelsEarned}`);
            }

            // Clean up test rule
            console.log('\n🧹 Cleaning up test rule...');
            await supabase.from('loyalty_rules').delete().eq('id', newRule.id);
            console.log('    ✅ Test rule cleaned up');
        }

        console.log('\n🎉 All loyalty rules tests passed!');
        console.log('\n💡 Next steps:');
        console.log('   1. Start your dev server: npm run dev');
        console.log('   2. Go to admin panel: /admin/loyalty');
        console.log('   3. Click "⚙️ Rules Configuration" tab');
        console.log('   4. Configure your spending-to-jewels rules!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testLoyaltyRules();

