// Copy and paste this entire script into your browser console on the Luxe website
// This will immediately update the destinations in localStorage

console.log('🔄 Updating Luxe Destinations...');

const touristDestinations = [{
        id: 'malpe-maharashtra',
        name: 'Malpe, Maharashtra',
        description: 'Pristine beaches and coastal charm await in this serene coastal town. Experience the perfect blend of tranquility and adventure with golden sands, clear waters, and stunning sunsets.',
        image: '/images/destinations/malpe-maharashtra.jpg',
        location: 'Maharashtra, India',
        attractions: ['Malpe Beach', 'St. Mary\'s Island', 'Udupi Temple', 'Water Sports', 'Seafood Delicacies'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'lonavala-maharashtra',
        name: 'Lonavala, Maharashtra',
        description: 'Nestled in the Western Ghats, this hill station offers breathtaking views, ancient caves, and refreshing waterfalls. Perfect for nature lovers and adventure seekers.',
        image: '/images/destinations/lonavala-maharashtra.jpg',
        location: 'Maharashtra, India',
        attractions: ['Tiger\'s Leap', 'Karla Caves', 'Bhaja Caves', 'Lonavala Lake', 'Trekking Trails'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'mahabaleshwar-maharashtra',
        name: 'Mahabaleshwar, Maharashtra',
        description: 'Queen of Hill Stations offers panoramic views, strawberry farms, and colonial charm. Experience the cool mountain air and scenic beauty of the Western Ghats.',
        image: '/images/destinations/mahabaleshwar-maharashtra.jpg',
        location: 'Maharashtra, India',
        attractions: ['Wilson Point', 'Mapro Garden', 'Venna Lake', 'Strawberry Farms', 'Scenic Points'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'goa-beaches',
        name: 'Goa Beaches',
        description: 'Famous for its pristine beaches, vibrant culture, and Portuguese heritage. From party beaches to secluded coves, Goa offers something for every traveler.',
        image: '/images/destinations/goa-beaches.jpg',
        location: 'Goa, India',
        attractions: ['Calangute Beach', 'Baga Beach', 'Anjuna Beach', 'Old Goa Churches', 'Portuguese Architecture'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'kerala-backwaters',
        name: 'Kerala Backwaters',
        description: 'Experience the serene beauty of Kerala\'s backwaters with houseboat cruises, lush greenery, and traditional village life. A perfect escape into nature.',
        image: '/images/destinations/kerala-backwaters.jpg',
        location: 'Kerala, India',
        attractions: ['Alleppey Backwaters', 'Kumarakom', 'Vembanad Lake', 'Houseboat Cruises', 'Ayurvedic Spas'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'udaipur-rajasthan',
        name: 'Udaipur, Rajasthan',
        description: 'The City of Lakes offers royal heritage, stunning palaces, and romantic boat rides. Experience the magic of Rajasthan\'s most beautiful city.',
        image: '/images/destinations/udaipur-rajasthan.jpg',
        location: 'Rajasthan, India',
        attractions: ['Lake Palace', 'City Palace', 'Jag Mandir', 'Fateh Sagar Lake', 'Royal Heritage'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'manali-himachal',
        name: 'Manali, Himachal Pradesh',
        description: 'Adventure capital of India with snow-capped mountains, apple orchards, and thrilling activities. Perfect for both relaxation and adventure.',
        image: '/images/destinations/manali-himachal.jpg',
        location: 'Himachal Pradesh, India',
        attractions: ['Rohtang Pass', 'Solang Valley', 'Hadimba Temple', 'Apple Orchards', 'Adventure Sports'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'shimla-himachal',
        name: 'Shimla, Himachal Pradesh',
        description: 'Queen of Hills offers colonial architecture, scenic beauty, and pleasant weather. Experience the charm of British-era hill stations.',
        image: '/images/destinations/shimla-himachal.jpg',
        location: 'Himachal Pradesh, India',
        attractions: ['The Ridge', 'Christ Church', 'Jakhu Temple', 'Mall Road', 'Colonial Architecture'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'darjeeling-west-bengal',
        name: 'Darjeeling, West Bengal',
        description: 'Famous for its tea gardens, toy train, and views of Kanchenjunga. Experience the charm of the Himalayan foothills.',
        image: '/images/destinations/darjeeling-west-bengal.jpg',
        location: 'West Bengal, India',
        attractions: ['Tiger Hill', 'Darjeeling Toy Train', 'Tea Gardens', 'Kanchenjunga Views', 'Colonial Charm'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'varanasi-uttar-pradesh',
        name: 'Varanasi, Uttar Pradesh',
        description: 'Spiritual capital of India with ancient temples, Ganga ghats, and cultural heritage. Experience the essence of Indian spirituality.',
        image: '/images/destinations/varanasi-uttar-pradesh.jpg',
        location: 'Uttar Pradesh, India',
        attractions: ['Ganga Ghats', 'Kashi Vishwanath Temple', 'Ganga Aarti', 'Ancient Temples', 'Spiritual Heritage'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'agra-uttar-pradesh',
        name: 'Agra, Uttar Pradesh',
        description: 'Home to the iconic Taj Mahal, a symbol of eternal love. Experience the grandeur of Mughal architecture and history.',
        image: '/images/destinations/agra-uttar-pradesh.jpg',
        location: 'Uttar Pradesh, India',
        attractions: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Itmad-ud-Daula', 'Mughal Architecture'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'jaisalmer-rajasthan',
        name: 'Jaisalmer, Rajasthan',
        description: 'Golden City in the Thar Desert offers stunning sand dunes, ancient forts, and camel safaris. Experience the magic of the desert.',
        image: '/images/destinations/jaisalmer-rajasthan.jpg',
        location: 'Rajasthan, India',
        attractions: ['Jaisalmer Fort', 'Sam Sand Dunes', 'Camel Safari', 'Golden Architecture', 'Desert Culture'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

try {
    // Clear existing destinations
    localStorage.removeItem('luxe_destinations');
    console.log('🗑️  Cleared existing destinations');

    // Add new destinations
    localStorage.setItem('luxe_destinations', JSON.stringify(touristDestinations));
    console.log('✅ Added new destinations to localStorage');

    // Verify the update
    const stored = localStorage.getItem('luxe_destinations');
    const parsed = JSON.parse(stored);

    if (parsed && parsed.length === touristDestinations.length) {
        console.log('🎉 Success! Destinations updated successfully!');
        console.log(`📊 Total destinations: ${parsed.length}`);
        console.log('🎯 Malpe, Maharashtra is now available!');
        console.log('🔄 Now refresh your page to see the new destinations');

        // Show the new destinations
        console.log('\n🏖️  New Destinations Added:');
        parsed.forEach((dest, index) => {
            console.log(`${index + 1}. ${dest.name} - ${dest.location}`);
        });

    } else {
        throw new Error('Verification failed');
    }

} catch (error) {
    console.error('❌ Error updating destinations:', error);
}

console.log('\n📋 Next Steps:');
console.log('1. Refresh your Luxe website page');
console.log('2. Check the destination dropdown in hero search');
console.log('3. You should now see Malpe, Maharashtra and other destinations');