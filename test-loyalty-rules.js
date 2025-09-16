// Simple test to verify LoyaltyRulesManager component
console.log('Testing LoyaltyRulesManager import...');

try {
    // This will test if the component can be imported without runtime errors
    const LoyaltyRulesManager = require('./src/components/loyalty/LoyaltyRulesManager.tsx');
    console.log('✅ LoyaltyRulesManager imported successfully');
} catch (error) {
    console.error('❌ Error importing LoyaltyRulesManager:', error.message);
}