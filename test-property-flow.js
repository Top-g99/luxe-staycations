// Test script for property flow
console.log('=== Property Flow Test ===');
console.log('1. Checking localStorage...');
const stored = localStorage.getItem('luxeProperties');
console.log('Stored properties:', stored ? JSON.parse(stored).length : 'None');
if (stored) {
  const props = JSON.parse(stored);
  props.forEach((p, i) => console.log(`${i+1}. ${p.name} - Featured: ${p.featured}`));
}
console.log('2. Checking API...');
fetch('/api/villas').then(r => r.json()).then(data => {
  console.log('API properties:', data.data ? data.data.length : 'None');
  if (data.data) {
    data.data.forEach((p, i) => console.log(`${i+1}. ${p.name || p.title} - Featured: ${p.featured}`));
  }
}).catch(err => console.log('API error:', err));
