// Image URL test script
console.log('=== Testing Image URLs ===');
const testUrls = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'
];
testUrls.forEach((url, index) => {
  const img = new Image();
  img.onload = () => console.log(`✓ Image ${index + 1} loaded: ${url}`);
  img.onerror = () => console.log(`✗ Image ${index + 1} failed: ${url}`);
  img.src = url;
});
