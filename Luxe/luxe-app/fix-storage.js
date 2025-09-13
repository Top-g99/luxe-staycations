// Comprehensive localStorage fix script
console.log('🔧 Fixing localStorage quota issues...');

// Function to clear all Luxe data
function clearAllLuxeData() {
    const allKeys = Object.keys(localStorage);
    const luxeKeys = allKeys.filter(key => key.startsWith('luxe-'));

    console.log(`Found ${luxeKeys.length} Luxe keys in localStorage`);

    luxeKeys.forEach(key => {
        try {
            localStorage.removeItem(key);
            console.log(`✅ Cleared: ${key}`);
        } catch (e) {
            console.log(`❌ Could not clear: ${key}`);
        }
    });

    // Also clear sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    const sessionLuxeKeys = sessionKeys.filter(key => key.startsWith('luxe-'));

    sessionLuxeKeys.forEach(key => {
        try {
            sessionStorage.removeItem(key);
            console.log(`✅ Cleared sessionStorage: ${key}`);
        } catch (e) {
            console.log(`❌ Could not clear sessionStorage: ${key}`);
        }
    });
}

// Function to test storage capacity
function testStorageCapacity() {
    try {
        const testKey = 'luxe-test-capacity';
        const testData = 'x'.repeat(1000000); // 1MB test

        localStorage.setItem(testKey, testData);
        console.log('✅ localStorage can store at least 1MB');
        localStorage.removeItem(testKey);

        sessionStorage.setItem(testKey, testData);
        console.log('✅ sessionStorage can store at least 1MB');
        sessionStorage.removeItem(testKey);

    } catch (error) {
        console.error('❌ Storage capacity test failed:', error);
    }
}

// Execute the fix
clearAllLuxeData();
testStorageCapacity();

console.log('🎉 localStorage fix completed!');
console.log('Now try updating destinations again.');





