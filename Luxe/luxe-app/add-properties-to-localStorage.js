// Simple script to add properties to localStorage
// Run this in the browser console on the home page

const properties = [{
        id: 'casa-alphonso-1',
        name: 'Casa Alphonso 1',
        location: 'Goa, India',
        description: 'Luxurious villa with ocean views and private pool',
        price: 25000,
        rating: 4.8,
        reviews: 45,
        maxGuests: 6,
        amenities: ['Private Pool', 'Ocean View', 'WiFi', 'Kitchen', 'Parking'],
        image: '/images/properties/casa-alphonso-1.jpg',
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'casa-alphonso-2',
        name: 'Casa Alphonso 2',
        location: 'Goa, India',
        description: 'Modern villa with garden and mountain views',
        price: 22000,
        rating: 4.6,
        reviews: 32,
        maxGuests: 4,
        amenities: ['Garden View', 'Mountain View', 'WiFi', 'Kitchen', 'Parking'],
        image: '/images/properties/casa-alphonso-2.jpg',
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'luxe-villa-mumbai',
        name: 'Luxe Villa Mumbai',
        location: 'Mumbai, India',
        description: 'Premium villa in the heart of Mumbai with city views',
        price: 35000,
        rating: 4.9,
        reviews: 67,
        maxGuests: 8,
        amenities: ['City View', 'Private Pool', 'WiFi', 'Kitchen', 'Parking', 'Gym'],
        image: '/images/properties/luxe-villa-mumbai.jpg',
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Add to localStorage
localStorage.setItem('luxe_properties', JSON.stringify(properties));

console.log('Properties added to localStorage:', properties.length);
properties.forEach(p => {
    console.log(`- ${p.name} (${p.featured ? 'Featured' : 'Regular'})`);
});

// Refresh the page to see the changes
console.log('Properties added! Refresh the page to see them on the home page.');