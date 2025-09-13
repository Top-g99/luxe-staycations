// Script to clear localStorage and test the quota fix
console.log('Clearing localStorage to fix quota exceeded error...');

// Clear all Luxe-related localStorage items
const keysToClear = [
    'luxe-destinations',
    'luxe-properties',
    'luxe-bookings',
    'luxe-payments',
    'luxe-settings',
    'luxe-email-config',
    'luxe-razorpay-config',
    'luxe-callback-requests',
    'luxe-deal-banner'
];

keysToClear.forEach(key => {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`Cleared: ${key}`);
    }
});

console.log('localStorage cleared successfully!');
console.log('Now try updating destinations again.');





