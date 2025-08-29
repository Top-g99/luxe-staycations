// Comprehensive Browser Storage Reset Script
// Run this in your browser console to completely reset storage

console.log('🚨 COMPREHENSIVE BROWSER STORAGE RESET 🚨');
console.log('This will clear ALL localStorage and sessionStorage data!');

// Function to clear all storage
function resetAllStorage() {
    let clearedLocal = 0;
    let clearedSession = 0;

    // Clear ALL localStorage
    const allLocalKeys = Object.keys(localStorage);
    console.log(`Found ${allLocalKeys.length} items in localStorage`);

    allLocalKeys.forEach(key => {
        try {
            localStorage.removeItem(key);
            clearedLocal++;
            console.log(`✅ Cleared localStorage: ${key}`);
        } catch (e) {
            console.log(`❌ Could not clear localStorage: ${key}`);
        }
    });

    // Clear ALL sessionStorage
    const allSessionKeys = Object.keys(sessionStorage);
    console.log(`Found ${allSessionKeys.length} items in sessionStorage`);

    allSessionKeys.forEach(key => {
        try {
            sessionStorage.removeItem(key);
            clearedSession++;
            console.log(`✅ Cleared sessionStorage: ${key}`);
        } catch (e) {
            console.log(`❌ Could not clear sessionStorage: ${key}`);
        }
    });

    console.log(`🎉 RESET COMPLETE!`);
    console.log(`Cleared ${clearedLocal} localStorage items`);
    console.log(`Cleared ${clearedSession} sessionStorage items`);
    console.log(`Total cleared: ${clearedLocal + clearedSession} items`);

    // Test storage capacity
    try {
        const testData = 'test';
        localStorage.setItem('test', testData);
        sessionStorage.setItem('test', testData);
        console.log('✅ Storage is working again!');
        localStorage.removeItem('test');
        sessionStorage.removeItem('test');
    } catch (error) {
        console.error('❌ Storage still not working:', error);
    }
}

// Function to clear only Luxe data (safer option)
function resetLuxeStorageOnly() {
    let clearedLocal = 0;
    let clearedSession = 0;

    // Clear Luxe localStorage
    const allLocalKeys = Object.keys(localStorage);
    const luxeLocalKeys = allLocalKeys.filter(key => key.startsWith('luxe-'));

    luxeLocalKeys.forEach(key => {
        try {
            localStorage.removeItem(key);
            clearedLocal++;
            console.log(`✅ Cleared localStorage: ${key}`);
        } catch (e) {
            console.log(`❌ Could not clear localStorage: ${key}`);
        }
    });

    // Clear Luxe sessionStorage
    const allSessionKeys = Object.keys(sessionStorage);
    const luxeSessionKeys = allSessionKeys.filter(key => key.startsWith('luxe-'));

    luxeSessionKeys.forEach(key => {
        try {
            sessionStorage.removeItem(key);
            clearedSession++;
            console.log(`✅ Cleared sessionStorage: ${key}`);
        } catch (e) {
            console.log(`❌ Could not clear sessionStorage: ${key}`);
        }
    });

    console.log(`🎉 LUXE STORAGE RESET COMPLETE!`);
    console.log(`Cleared ${clearedLocal} Luxe localStorage items`);
    console.log(`Cleared ${clearedSession} Luxe sessionStorage items`);
}

// Show options
console.log('\n📋 OPTIONS:');
console.log('1. Run resetLuxeStorageOnly() - Clear only Luxe data (SAFER)');
console.log('2. Run resetAllStorage() - Clear ALL storage data (NUCLEAR OPTION)');
console.log('\n💡 RECOMMENDATION: Try option 1 first, then option 2 if needed');

// Auto-run the safer option
console.log('\n🔄 Auto-running safer option...');
resetLuxeStorageOnly();

