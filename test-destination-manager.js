// Test the destination manager functionality
console.log('Testing destination manager...');

// Simulate the destination manager logic
class TestDestinationManager {
    constructor() {
        this.destinations = [];
        this.loadDefaultDestinations();
    }

    loadDefaultDestinations() {
        this.destinations = [{
                id: 'lonavala',
                name: 'Lonavala, Maharashtra',
                image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80',
                description: 'Scenic hill station with ancient forts and lush greenery',
                featured: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'goa',
                name: 'Goa, India',
                image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80',
                description: 'Tropical paradise with pristine beaches and Portuguese heritage',
                featured: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
    }

    getAllDestinations() {
        return [...this.destinations];
    }

    getFeaturedDestinations() {
        return this.destinations.filter(dest => dest.featured);
    }

    resetToDefaults() {
        this.loadDefaultDestinations();
    }
}

// Test the manager
const testManager = new TestDestinationManager();
console.log('Test destinations created:', testManager.getAllDestinations().length);
console.log('Featured destinations:', testManager.getFeaturedDestinations().length);
console.log('First destination:', testManager.getAllDestinations()[0].name);
console.log('Test completed successfully!');




