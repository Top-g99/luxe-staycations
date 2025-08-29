// Simple local data store for destinations and properties
// This works completely offline without any external dependencies

// Destinations data
export let destinations: any[] = [
  {
    id: '1',
    name: 'Lonavala',
    description: 'A beautiful hill station in Maharashtra, perfect for weekend getaways with stunning views of the Western Ghats.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fit=crop&crop=center',
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Khandala',
    description: 'Scenic mountain destination with breathtaking views and lush greenery.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80&fit=crop&crop=center',
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Mahabaleshwar',
    description: 'Famous hill station known for its strawberries and scenic beauty.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fit=crop&crop=center',
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Panchgani',
    description: 'Peaceful hill station with panoramic views and pleasant weather.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fit=crop&crop=center',
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Matheran',
    description: 'Asia\'s only automobile-free hill station with pristine nature.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80&fit=crop&crop=center',
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Properties data
export let properties: any[] = [
  {
    id: '1',
    name: 'Casa Alphonso',
    description: 'Luxurious villa with stunning mountain views',
    location: 'Lonavala',
    type: 'Villa',
    price: 15000,
    bedrooms: 3,
    bathrooms: 2,
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'],
    featured: true,
    amenities: ['WiFi', 'Pool', 'Kitchen', 'Parking'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Mountain View Retreat',
    description: 'Peaceful retreat with panoramic views',
    location: 'Khandala',
    type: 'Cottage',
    price: 12000,
    bedrooms: 2,
    bathrooms: 1,
    images: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80'],
    featured: true,
    amenities: ['WiFi', 'Garden', 'Kitchen'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Strawberry Villa',
    description: 'Charming villa in the heart of Mahabaleshwar',
    location: 'Mahabaleshwar',
    type: 'Villa',
    price: 18000,
    bedrooms: 4,
    bathrooms: 3,
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'],
    featured: false,
    amenities: ['WiFi', 'Pool', 'Kitchen', 'Parking', 'Garden'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Helper functions for destinations
export const destinationStore = {
  getAll: () => destinations,
  getById: (id: string) => destinations.find(d => d.id === id),
  create: (data: any) => {
    const newDestination = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    destinations.push(newDestination);
    return newDestination;
  },
  update: (id: string, data: any) => {
    const index = destinations.findIndex(d => d.id === id);
    if (index !== -1) {
      destinations[index] = {
        ...destinations[index],
        ...data,
        updated_at: new Date().toISOString()
      };
      return destinations[index];
    }
    return null;
  },
  delete: (id: string) => {
    const index = destinations.findIndex(d => d.id === id);
    if (index !== -1) {
      destinations.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Helper functions for properties
export const propertyStore = {
  getAll: () => properties,
  getById: (id: string) => properties.find(p => p.id === id),
  create: (data: any) => {
    const newProperty = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    properties.push(newProperty);
    return newProperty;
  },
  update: (id: string, data: any) => {
    const index = properties.findIndex(p => p.id === id);
    if (index !== -1) {
      properties[index] = {
        ...properties[index],
        ...data,
        updated_at: new Date().toISOString()
      };
      return properties[index];
    }
    return null;
  },
  delete: (id: string) => {
    const index = properties.findIndex(p => p.id === id);
    if (index !== -1) {
      properties.splice(index, 1);
      return true;
    }
    return false;
  }
};

