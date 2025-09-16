// Clear hardcoded properties from localStorage
// Run this in the browser console to remove the old data

console.log('🧹 Clearing hardcoded properties from localStorage...');

// Clear the properties
localStorage.removeItem('luxeProperties');

// Also clear any other related data
localStorage.removeItem('luxePropertyInfo');
localStorage.removeItem('luxePropertyCache');

console.log('✅ Properties cleared from localStorage!');
console.log('🔄 Please refresh the page to see the changes.');

// Verify the data is cleared
const remainingProperties = localStorage.getItem('luxeProperties');
if (!remainingProperties) {
    console.log('✅ Confirmed: No properties found in localStorage');
} else {
    console.log('⚠️ Properties still found in localStorage');
}