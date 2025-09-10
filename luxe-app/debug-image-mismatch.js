// Debug property image mismatch
console.log('=== Debugging Image Mismatch ===');
const stored = localStorage.getItem('luxeProperties');
if (stored) {
  const props = JSON.parse(stored);
  props.forEach((p, i) => {
    console.log(`Property ${i+1}: ${p.name}`);
    console.log(`  - Image URL: ${p.image}`);
    console.log(`  - Images Array: ${JSON.stringify(p.images)}`);
    console.log(`  - Type: ${p.type}`);
    console.log('---');
  });
} else {
  console.log('No properties found in localStorage');
}
