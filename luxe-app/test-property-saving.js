// Test property saving functionality
const testPropertySaving = async() => {
    console.log('Testing property saving...');

    // Test data
    const testProperty = {
        name: 'Test Villa',
        location: 'Test Location',
        description: 'A beautiful test villa for testing purposes',
        price: 5000,
        type: 'Villa',
        amenities: ['WiFi', 'Pool', 'Kitchen'],
        featured: false,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        hostName: 'Test Host',
        hostImage: '',
        propertySize: '2000',
        yearBuilt: '2020',
        floorLevel: 'Ground Floor',
        totalFloors: 1,
        parkingSpaces: 2,
        petFriendly: false,
        smokingAllowed: false,
        wheelchairAccessible: false,
        neighborhood: 'Test Neighborhood',
        distanceFromAirport: '10',
        distanceFromCityCenter: '5',
        distanceFromBeach: '2',
        publicTransport: 'Bus stop nearby',
        checkInTime: '15:00',
        checkOutTime: '11:00',
        earlyCheckIn: false,
        lateCheckOut: false,
        cancellationPolicy: 'Flexible',
        cleaningFee: 500,
        serviceFee: 200,
        securityDeposit: 1000,
        weeklyDiscount: 10,
        monthlyDiscount: 20
    };

    try {
        // Test localStorage saving
        console.log('Testing localStorage saving...');
        const existingProperties = JSON.parse(localStorage.getItem('luxe_properties') || '[]');
        console.log('Existing properties:', existingProperties.length);

        // Add test property
        const newProperty = {
            ...testProperty,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            rating: 0,
            reviews: 0,
            image: ''
        };

        existingProperties.unshift(newProperty);
        localStorage.setItem('luxe_properties', JSON.stringify(existingProperties));

        console.log('Property saved successfully!');
        console.log('New property:', newProperty);
        console.log('Total properties:', existingProperties.length);

        return { success: true, property: newProperty };
    } catch (error) {
        console.error('Error saving property:', error);
        return { success: false, error: error.message };
    }
};

// Run the test
testPropertySaving();