import { NextRequest, NextResponse } from 'next/server';

// AI-like content generation for location-based attractions, activities, and restaurants
const LOCATION_CONTENT_TEMPLATES = {
  attractions: {
    'mumbai': [
      'Gateway of India', 'Marine Drive', 'Juhu Beach', 'Elephanta Caves', 'Siddhivinayak Temple',
      'Haji Ali Dargah', 'Chhatrapati Shivaji Terminus', 'Bandra-Worli Sea Link', 'Sanjay Gandhi National Park',
      'Essel World', 'Water Kingdom', 'Powai Lake', 'Versova Beach', 'Aksa Beach'
    ],
    'goa': [
      'Baga Beach', 'Calangute Beach', 'Anjuna Beach', 'Vagator Beach', 'Chapora Fort',
      'Dudhsagar Falls', 'Basilica of Bom Jesus', 'Se Cathedral', 'Aguada Fort', 'Candolim Beach',
      'Palolem Beach', 'Colva Beach', 'Old Goa', 'Spice Plantations', 'Dona Paula'
    ],
    'pune': [
      'Shaniwar Wada', 'Aga Khan Palace', 'Sinhagad Fort', 'Dagdusheth Halwai Ganpati Temple',
      'Khadakwasla Dam', 'Lal Mahal', 'Raja Dinkar Kelkar Museum', 'Katraj Snake Park',
      'Pashan Lake', 'Mulshi Dam', 'Lavasa', 'Lonavala', 'Khandala', 'Bhimashankar Temple'
    ],
    'maharashtra': [
      'Ajanta Caves', 'Ellora Caves', 'Lonar Crater Lake', 'Mahabaleshwar', 'Matheran',
      'Panchgani', 'Alibaug', 'Murud-Janjira', 'Shirdi', 'Trimbakeshwar', 'Nashik',
      'Aurangabad', 'Kolhapur', 'Ratnagiri', 'Sindhudurg'
    ]
  },
  restaurants: {
    'mumbai': [
      'Leopold Cafe', 'Bade Miya', 'Cafe Mondegar', 'Trishna', 'Mahesh Lunch Home',
      'Gaylord Restaurant', 'Khyber Restaurant', 'Peshawri', 'Indigo', 'The Table',
      'Bastian', 'Masala Library', 'Bombay Canteen', 'The Bombay Brasserie'
    ],
    'goa': [
      'Martin\'s Corner', 'Fisherman\'s Wharf', 'Pousada by the Beach', 'Cafe Chocolatti',
      'Gunpowder', 'Thalassa', 'La Plage', 'Sublime', 'Cafe Bodega', 'Viva Panjim',
      'Ritz Classic', 'Spice Garden', 'Peep Kitchen', 'The Black Sheep Bistro'
    ],
    'pune': [
      'Malaka Spice', 'German Bakery', 'Cafe Goodluck', 'Kayani Bakery', 'Vaishali',
      'Shabree', 'ABC Farm', 'The Place', 'Prem\'s', 'Cafe Peter', 'Suryodaya',
      'Cafe 1730', 'The Urban Foundry', 'High Spirits'
    ],
    'maharashtra': [
      'Hotel Shreyas', 'Hotel Panchratna', 'Hotel Surya', 'Hotel Rajhans', 'Hotel Kohinoor',
      'Hotel Samrat', 'Hotel Heritage', 'Hotel Pride', 'Hotel Ambassador', 'Hotel President'
    ]
  },
  activities: {
    'mumbai': [
      'Boat ride to Elephanta Caves', 'Marine Drive evening walk', 'Street food tour in Crawford Market',
      'Shopping at Colaba Causeway', 'Bollywood studio tour', 'Dharavi slum tour',
      'Sunset at Juhu Beach', 'Heritage walk in Fort area', 'Art gallery hopping',
      'Local train experience', 'Shopping at Linking Road', 'Nightlife in Bandra'
    ],
    'goa': [
      'Beach hopping tour', 'Water sports at Baga Beach', 'Spice plantation tour',
      'Dudhsagar Falls trek', 'Casino cruise', 'Sunset cruise', 'Scuba diving',
      'Parasailing', 'Dolphin watching', 'Flea market shopping', 'Pub crawl',
      'Yoga on the beach', 'Kayaking in backwaters'
    ],
    'pune': [
      'Fort trekking at Sinhagad', 'Lavasa boating', 'Khadakwasla Dam visit',
      'Heritage walk in old Pune', 'Shopping at FC Road', 'Nightlife in Koregaon Park',
      'Adventure sports at Lonavala', 'Temple hopping', 'Museum visits',
      'Local food tour', 'Bike ride to Mulshi', 'Photography walk'
    ],
    'maharashtra': [
      'Ajanta-Ellora caves tour', 'Mahabaleshwar hill station visit', 'Matheran toy train ride',
      'Alibaug beach hopping', 'Shirdi temple visit', 'Nashik wine tasting',
      'Aurangabad heritage tour', 'Kolhapur Mahalaxmi temple', 'Ratnagiri beach visit',
      'Sindhudurg fort exploration', 'Lonar crater visit', 'Panchgani strawberry picking'
    ]
  }
};

function generateLocationContent(location: string, type: 'attractions' | 'restaurants' | 'activities') {
  const locationLower = location.toLowerCase();
  
  // Find matching location
  let matchedLocation = '';
  for (const [key, _] of Object.entries(LOCATION_CONTENT_TEMPLATES[type])) {
    if (locationLower.includes(key)) {
      matchedLocation = key;
      break;
    }
  }
  
  if (!matchedLocation) {
    // Default to Maharashtra if no specific match
    matchedLocation = 'maharashtra';
  }
  
  const content = (LOCATION_CONTENT_TEMPLATES[type] as Record<string, string[]>)[matchedLocation] || [];
  
  // Return 5-8 random items
  const shuffled = content.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(8, Math.max(5, content.length)));
}

export async function POST(request: NextRequest) {
  try {
    const { location, type } = await request.json();
    
    if (!location) {
      return NextResponse.json({
        success: false,
        error: 'Location is required'
      }, { status: 400 });
    }
    
    if (!type || !['attractions', 'restaurants', 'activities'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Type must be one of: attractions, restaurants, activities'
      }, { status: 400 });
    }
    
    const content = generateLocationContent(location, type);
    
    return NextResponse.json({
      success: true,
      data: {
        location,
        type,
        content,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error generating location content:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate location content'
    }, { status: 500 });
  }
}
