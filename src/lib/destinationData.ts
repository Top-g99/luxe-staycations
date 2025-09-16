// Shared data store for destinations
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

// Helper function to get random destination images
export function getRandomDestinationImage(): string {
  const destinationImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fit=crop&crop=center'
  ];
  return destinationImages[Math.floor(Math.random() * destinationImages.length)];
}

