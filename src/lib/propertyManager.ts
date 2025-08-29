export interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  type: string;
  amenities: string[];
  featured?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  hostName?: string;
  hostImage?: string;
  images?: string[];
  highlights?: string[];
  squareFootage?: number;
  yearBuilt?: number;
  distanceToBeach?: number;
  distanceToCity?: number;
  primaryView?: string;
  propertyStyle?: string;
  policies?: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
  };
}

class PropertyManager {
  private properties: Property[] = [];
  private subscribers: (() => void)[] = [];
  private initialized = false;

  initialize() {
    if (this.initialized) return;
    
    if (typeof window !== 'undefined') {
      const savedProperties = localStorage.getItem('luxeProperties');
      if (savedProperties) {
        try {
          this.properties = JSON.parse(savedProperties);
          console.log('PropertyManager: Loaded properties from localStorage:', this.properties.length);
        } catch (error) {
          console.error('PropertyManager: Error parsing saved properties, starting fresh');
          this.loadDefaultProperties();
        }
      } else {
        this.loadDefaultProperties();
      }
      
      // Also try to load from API for additional data
      this.loadFromAPI();
    } else {
      // Server-side initialization
      this.loadDefaultProperties();
    }
    
    this.initialized = true;
  }

  private async loadFromAPI() {
    try {
      const response = await fetch('/api/villas');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Merge API data with local data, avoiding duplicates
          const apiProperties = result.data;
          const existingIds = new Set(this.properties.map(p => p.id));
          
          apiProperties.forEach((apiProperty: any) => {
            if (!existingIds.has(apiProperty.id)) {
              // Convert API format to local format if needed
              const localProperty = {
                ...apiProperty,
                name: apiProperty.name || apiProperty.title,
                // Add any other field mappings as needed
              };
              this.properties.push(localProperty);
            }
          });
          
          console.log('PropertyManager: Loaded additional properties from API:', apiProperties.length);
          this.saveToStorage();
          this.notifySubscribers();
        }
      }
    } catch (error) {
      console.error('PropertyManager: Error loading from API:', error);
      // Continue with local data only
    }
  }

  // Force refresh properties from localStorage
  forceRefresh() {
    if (typeof window !== 'undefined') {
      const savedProperties = localStorage.getItem('luxeProperties');
      if (savedProperties) {
        try {
          this.properties = JSON.parse(savedProperties);
          console.log('PropertyManager: Force refreshed properties from localStorage:', this.properties.length);
          this.notifySubscribers();
        } catch (error) {
          console.error('PropertyManager: Error parsing saved properties during force refresh');
        }
      }
    }
  }

  private loadDefaultProperties() {
    this.properties = [
      {
        id: '1',
        name: 'Casa Alphonso',
        location: 'Lonavala, Maharashtra',
        description: 'Luxury villa with panoramic views of the Western Ghats. Perfect for family getaways with modern amenities and private pool.',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
        price: 15000,
        rating: 4.8,
        reviews: 127,
        type: 'Villa',
        amenities: ['Private Pool', 'WiFi', 'Kitchen', 'Parking', 'Garden', 'BBQ'],
        featured: true,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 8,
        hostName: 'Alphonso Family',
        hostImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
        ],
        highlights: ['Mountain View', 'Private Pool', 'Family Friendly'],
        squareFootage: 2500,
        yearBuilt: 2020,
        distanceToBeach: 0,
        distanceToCity: 5,
        primaryView: 'Mountain',
        propertyStyle: 'Modern',
        policies: {
          checkIn: '3:00 PM',
          checkOut: '11:00 AM',
          cancellation: 'Free cancellation up to 7 days before check-in'
        }
      },
      {
        id: '2',
        name: 'Serene Retreat',
        location: 'Mahabaleshwar, Maharashtra',
        description: 'Peaceful cottage surrounded by strawberry farms and scenic valleys. Ideal for romantic getaways and nature lovers.',
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
        price: 12000,
        rating: 4.6,
        reviews: 89,
        type: 'Cottage',
        amenities: ['Fireplace', 'WiFi', 'Kitchen', 'Parking', 'Garden', 'Valley View'],
        featured: true,
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        hostName: 'Nature Escapes',
        hostImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&q=80',
        images: [
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80'
        ],
        highlights: ['Valley View', 'Fireplace', 'Romantic'],
        squareFootage: 1800,
        yearBuilt: 2019,
        distanceToBeach: 0,
        distanceToCity: 3,
        primaryView: 'Valley',
        propertyStyle: 'Rustic',
        policies: {
          checkIn: '2:00 PM',
          checkOut: '10:00 AM',
          cancellation: 'Free cancellation up to 5 days before check-in'
        }
      },
      {
        id: '3',
        name: 'Luxury Haven',
        location: 'Goa, India',
        description: 'Beachfront villa with direct access to pristine beaches. Modern luxury with traditional Goan charm and world-class amenities.',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        price: 25000,
        rating: 4.9,
        reviews: 203,
        type: 'Luxury Villa',
        amenities: ['Private Beach Access', 'Infinity Pool', 'WiFi', 'Kitchen', 'Parking', 'Spa', 'Chef Service'],
        featured: true,
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 10,
        hostName: 'Goa Luxury Stays',
        hostImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
        ],
        highlights: ['Beachfront', 'Infinity Pool', 'Luxury'],
        squareFootage: 3500,
        yearBuilt: 2021,
        distanceToBeach: 0,
        distanceToCity: 8,
        primaryView: 'Ocean',
        propertyStyle: 'Luxury',
        policies: {
          checkIn: '4:00 PM',
          checkOut: '12:00 PM',
          cancellation: 'Free cancellation up to 14 days before check-in'
        }
      }
    ];
    
    this.saveToStorage();
    console.log('PropertyManager: Loaded default properties:', this.properties.length);
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeProperties', JSON.stringify(this.properties));
    }
  }

  getAllProperties(): Property[] {
    if (!this.initialized) {
      this.initialize();
    }
    return [...this.properties];
  }

  getFeaturedProperties(): Property[] {
    if (!this.initialized) {
      this.initialize();
    }
    return this.properties.filter(property => property.featured);
  }

  getPropertyById(id: string): Property | undefined {
    if (!this.initialized) {
      this.initialize();
    }
    return this.properties.find(property => property.id === id);
  }

  addProperty(property: Omit<Property, 'id'>): Property {
    const newProperty: Property = {
      ...property,
      id: Date.now().toString()
    };
    
    this.properties.push(newProperty);
    this.saveToStorage();
    this.notifySubscribers();
    
    console.log('PropertyManager: Added new property:', newProperty.name);
    return newProperty;
  }

  updateProperty(id: string, updates: Partial<Property>): Property | null {
    const index = this.properties.findIndex(property => property.id === id);
    if (index === -1) {
      console.error('PropertyManager: Property not found for update:', id);
      return null;
    }
    
    this.properties[index] = { ...this.properties[index], ...updates };
    this.saveToStorage();
    this.notifySubscribers();
    
    console.log('PropertyManager: Updated property:', this.properties[index].name);
    return this.properties[index];
  }

  deleteProperty(id: string): boolean {
    const index = this.properties.findIndex(property => property.id === id);
    if (index === -1) {
      console.error('PropertyManager: Property not found for deletion:', id);
      return false;
    }
    
    const deletedProperty = this.properties.splice(index, 1)[0];
    this.saveToStorage();
    this.notifySubscribers();
    
    console.log('PropertyManager: Deleted property:', deletedProperty.name);
    return true;
  }

  searchProperties(query: string): Property[] {
    if (!this.initialized) {
      this.initialize();
    }
    
    const lowerQuery = query.toLowerCase();
    return this.properties.filter(property => 
      property.name.toLowerCase().includes(lowerQuery) ||
      property.location.toLowerCase().includes(lowerQuery) ||
      property.description.toLowerCase().includes(lowerQuery) ||
      property.type.toLowerCase().includes(lowerQuery)
    );
  }

  getPropertiesByLocation(location: string): Property[] {
    if (!this.initialized) {
      this.initialize();
    }
    
    const lowerLocation = location.toLowerCase();
    return this.properties.filter(property => 
      property.location.toLowerCase().includes(lowerLocation)
    );
  }

  getPropertiesByType(type: string): Property[] {
    if (!this.initialized) {
      this.initialize();
    }
    
    const lowerType = type.toLowerCase();
    return this.properties.filter(property => 
      property.type.toLowerCase().includes(lowerType)
    );
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }
}

export const propertyManager = new PropertyManager();
