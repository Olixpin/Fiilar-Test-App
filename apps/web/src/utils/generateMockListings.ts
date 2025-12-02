/**
 * Mock Listing Generator
 * Generates 200+ realistic listings for testing infinite scroll/pagination
 * 
 * Usage: 
 *   import { generateMockListings, injectMockListings } from './generateMockListings';
 *   injectMockListings(200); // Adds 200 listings to localStorage
 */

import { Listing, SpaceType, SpaceCategory, SPACE_TYPE_CATEGORIES, BookingType, ListingStatus, CancellationPolicy } from '@fiilar/types';

// Nigerian locations with coordinates
const LOCATIONS = [
  { name: 'Lekki Phase 1, Lagos', lat: 6.4478, lng: 3.4723 },
  { name: 'Victoria Island, Lagos', lat: 6.4281, lng: 3.4219 },
  { name: 'Ikoyi, Lagos', lat: 6.4549, lng: 3.4369 },
  { name: 'Ikeja GRA, Lagos', lat: 6.5833, lng: 3.3500 },
  { name: 'Yaba, Lagos', lat: 6.5095, lng: 3.3711 },
  { name: 'Surulere, Lagos', lat: 6.4969, lng: 3.3481 },
  { name: 'Ajah, Lagos', lat: 6.4667, lng: 3.5833 },
  { name: 'Banana Island, Lagos', lat: 6.4600, lng: 3.4300 },
  { name: 'Maryland, Lagos', lat: 6.5667, lng: 3.3667 },
  { name: 'Magodo, Lagos', lat: 6.6167, lng: 3.3833 },
  { name: 'Gbagada, Lagos', lat: 6.5500, lng: 3.3833 },
  { name: 'Wuse 2, Abuja', lat: 9.0667, lng: 7.4833 },
  { name: 'Maitama, Abuja', lat: 9.0833, lng: 7.5000 },
  { name: 'Garki, Abuja', lat: 9.0333, lng: 7.4833 },
  { name: 'Asokoro, Abuja', lat: 9.0167, lng: 7.5333 },
  { name: 'Gwarimpa, Abuja', lat: 9.1167, lng: 7.4000 },
  { name: 'Jabi, Abuja', lat: 9.0667, lng: 7.4333 },
  { name: 'Port Harcourt GRA', lat: 4.8156, lng: 7.0498 },
  { name: 'Trans Amadi, PH', lat: 4.8000, lng: 7.0333 },
  { name: 'Bodija, Ibadan', lat: 7.4167, lng: 3.9000 },
];

// All new space types for mock data generation
const SPACE_TYPES: SpaceType[] = [
  // Work & Productivity
  SpaceType.CO_WORKING,
  SpaceType.PRIVATE_OFFICE,
  SpaceType.MEETING_ROOM,
  SpaceType.TRAINING_ROOM,
  // Event & Social
  SpaceType.EVENT_HALL,
  SpaceType.BANQUET_HALL,
  SpaceType.OUTDOOR_VENUE,
  SpaceType.LOUNGE_ROOFTOP,
  // Creative & Production
  SpaceType.PHOTO_STUDIO,
  SpaceType.RECORDING_STUDIO,
  SpaceType.FILM_STUDIO,
  // Stay & Accommodation
  SpaceType.BOUTIQUE_HOTEL,
  SpaceType.SERVICED_APARTMENT,
  SpaceType.SHORT_TERM_RENTAL,
  // Specialty - ALL types
  SpaceType.POP_UP_RETAIL,
  SpaceType.SHOWROOM,
  SpaceType.KITCHEN_CULINARY,
  SpaceType.WAREHOUSE,
  SpaceType.ART_GALLERY,
  SpaceType.DANCE_STUDIO,
  SpaceType.GYM_FITNESS,
  SpaceType.PRAYER_MEDITATION,
  SpaceType.TECH_HUB,
  SpaceType.GAMING_LOUNGE,
  SpaceType.CONFERENCE_CENTER,
];

const TITLE_PREFIXES = [
  'Modern', 'Luxury', 'Cozy', 'Spacious', 'Premium', 'Executive', 
  'Elegant', 'Stylish', 'Beautiful', 'Stunning', 'Contemporary',
  'Chic', 'Serene', 'Bright', 'Charming', 'Sophisticated'
];

const TITLE_SUFFIXES: Record<SpaceType, string[]> = {
  // Work & Productivity
  [SpaceType.CO_WORKING]: ['Co-working Hub', 'Shared Workspace', 'Work Space', 'Business Hub', 'Flex Office'],
  [SpaceType.PRIVATE_OFFICE]: ['Private Office', 'Executive Office', 'Office Suite', 'Business Office', 'Serviced Office'],
  [SpaceType.MEETING_ROOM]: ['Meeting Room', 'Boardroom', 'Conference Room', 'Discussion Room', 'Strategy Room'],
  [SpaceType.TRAINING_ROOM]: ['Training Center', 'Seminar Room', 'Workshop Space', 'Learning Center', 'Classroom'],
  [SpaceType.CONFERENCE]: ['Conference Room', 'Meeting Room', 'Boardroom', 'Training Room', 'Seminar Hall'], // Legacy
  
  // Event & Social
  [SpaceType.EVENT_HALL]: ['Event Hall', 'Celebration Venue', 'Grand Hall', 'Function Hall', 'Party Venue'],
  [SpaceType.BANQUET_HALL]: ['Banquet Hall', 'Wedding Venue', 'Reception Hall', 'Gala Venue', 'Ballroom'],
  [SpaceType.OUTDOOR_VENUE]: ['Garden Venue', 'Outdoor Space', 'Lawn Area', 'Open Air Venue', 'Terrace'],
  [SpaceType.LOUNGE_ROOFTOP]: ['Rooftop Lounge', 'Sky Lounge', 'Rooftop Bar', 'Terrace Lounge', 'Sunset Deck'],
  [SpaceType.EVENT_CENTER]: ['Event Hall', 'Banquet Hall', 'Party Venue', 'Wedding Venue', 'Celebration Center'], // Legacy
  [SpaceType.OPEN_SPACE]: ['Rooftop Space', 'Garden Venue', 'Outdoor Area', 'Terrace', 'Lawn Space'], // Legacy
  
  // Creative & Production
  [SpaceType.PHOTO_STUDIO]: ['Photo Studio', 'Photography Space', 'Shoot Location', 'Portrait Studio', 'Fashion Studio'],
  [SpaceType.RECORDING_STUDIO]: ['Recording Studio', 'Music Studio', 'Podcast Studio', 'Audio Lab', 'Sound Room'],
  [SpaceType.FILM_STUDIO]: ['Film Studio', 'Video Production Set', 'Content Studio', 'Production Space', 'Media Studio'],
  [SpaceType.STUDIO]: ['Photography Studio', 'Creative Studio', 'Art Studio', 'Recording Studio', 'Dance Studio'], // Legacy
  
  // Stay & Accommodation
  [SpaceType.BOUTIQUE_HOTEL]: ['Boutique Hotel', 'Designer Hotel', 'Luxury Stay', 'Unique Hotel', 'Art Hotel'],
  [SpaceType.SERVICED_APARTMENT]: ['Serviced Apartment', 'Luxury Flat', 'Executive Suite', 'Premium Apartment', 'Furnished Apartment'],
  [SpaceType.SHORT_TERM_RENTAL]: ['Short Stay', 'Vacation Rental', 'Holiday Home', 'Guest House', 'Airbnb-style Stay'],
  [SpaceType.APARTMENT]: ['Apartment', 'Flat', 'Suite', 'Residence', 'Loft'], // Legacy
  
  // Specialty
  [SpaceType.POP_UP_RETAIL]: ['Pop-up Shop', 'Retail Space', 'Flash Store', 'Temporary Shop', 'Pop-up Location'],
  [SpaceType.SHOWROOM]: ['Showroom', 'Display Space', 'Exhibition Room', 'Product Gallery', 'Demo Room'],
  [SpaceType.KITCHEN_CULINARY]: ['Commercial Kitchen', 'Shared Kitchen', 'Cloud Kitchen', 'Culinary Space', 'Test Kitchen'],
  [SpaceType.WAREHOUSE]: ['Warehouse', 'Storage Space', 'Industrial Loft', 'Distribution Center', 'Depot'],
  [SpaceType.ART_GALLERY]: ['Art Gallery', 'Exhibition Space', 'Art Space', 'Gallery Venue', 'Creative Gallery'],
  [SpaceType.DANCE_STUDIO]: ['Dance Studio', 'Movement Space', 'Rehearsal Room', 'Dance Hall', 'Practice Studio'],
  [SpaceType.GYM_FITNESS]: ['Fitness Studio', 'Private Gym', 'Workout Space', 'Training Studio', 'Wellness Center'],
  [SpaceType.PRAYER_MEDITATION]: ['Meditation Room', 'Prayer Space', 'Quiet Room', 'Spiritual Center', 'Zen Space'],
  [SpaceType.TECH_HUB]: ['Tech Hub', 'Innovation Lab', 'Startup Space', 'Maker Space', 'Tech Campus'],
  [SpaceType.GAMING_LOUNGE]: ['Gaming Lounge', 'Esports Arena', 'Game Room', 'VR Arcade', 'Gaming Center'],
  [SpaceType.CONFERENCE_CENTER]: ['Conference Center', 'Convention Center', 'Summit Venue', 'Congress Hall', 'Large Venue'],
};

const AMENITIES = [
  { name: 'WiFi', icon: 'wifi' },
  { name: 'Parking', icon: 'car' },
  { name: 'Air Conditioning', icon: 'snowflake' },
  { name: 'Kitchen', icon: 'utensils' },
  { name: 'Security', icon: 'shield' },
  { name: 'CCTV', icon: 'video' },
  { name: 'Generator', icon: 'zap' },
  { name: 'Pool', icon: 'waves' },
  { name: 'Gym', icon: 'dumbbell' },
  { name: 'Projector', icon: 'monitor' },
  { name: 'Whiteboard', icon: 'edit' },
  { name: 'Sound System', icon: 'speaker' },
  { name: 'Catering', icon: 'coffee' },
  { name: 'Reception', icon: 'user' },
];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
  'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
  'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800',
  'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800',
  'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800',
  'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?w=800',
  'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=800',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  'https://images.unsplash.com/photo-1478720568477-152d9bc98cbd?w=800',
];

const HOUSE_RULES = [
  'No smoking',
  'No pets allowed',
  'No loud music after 10 PM',
  'Remove shoes indoors',
  'No parties without permission',
  'Clean up after use',
  'Respect neighbors',
  'No illegal activities',
];

const SAFETY_ITEMS = [
  'Fire extinguisher',
  'First aid kit',
  'Smoke detector',
  'Carbon monoxide detector',
  'Emergency exit',
  'Security personnel',
  'CCTV surveillance',
];

// Helper functions
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomItems = <T>(arr: T[], min: number, max: number): T[] => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const randomNumber = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomPrice = (min: number, max: number): number => 
  Math.round((Math.random() * (max - min) + min) / 1000) * 1000;

// Generate available hours for a date (for hourly listings)
const generateAvailability = (): Record<string, number[]> => {
  const availability: Record<string, number[]> = {};
  const today = new Date();
  
  // Generate availability for next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Random available hours between 8 AM and 10 PM
    const hours: number[] = [];
    for (let h = 8; h <= 22; h++) {
      if (Math.random() > 0.3) { // 70% chance of being available
        hours.push(h);
      }
    }
    availability[dateStr] = hours;
  }
  
  return availability;
};

// Generate a single listing
const generateListing = (index: number, hostId: string): Listing => {
  const spaceType = randomItem(SPACE_TYPES);
  const location = randomItem(LOCATIONS);
  const category = SPACE_TYPE_CATEGORIES[spaceType];
  
  // Determine pricing model based on category
  const isHourly = category === SpaceCategory.WORK_PRODUCTIVITY || 
                   category === SpaceCategory.CREATIVE_PRODUCTION ||
                   spaceType === SpaceType.LOUNGE_ROOFTOP ||
                   spaceType === SpaceType.DANCE_STUDIO ||
                   spaceType === SpaceType.GYM_FITNESS ||
                   spaceType === SpaceType.KITCHEN_CULINARY ||
                   spaceType === SpaceType.GAMING_LOUNGE;
  
  const prefix = randomItem(TITLE_PREFIXES);
  const suffix = randomItem(TITLE_SUFFIXES[spaceType] || ['Space']);
  
  // Price ranges based on type
  const priceRanges: Partial<Record<SpaceType, [number, number]>> = {
    // Work & Productivity (hourly)
    [SpaceType.CO_WORKING]: [3000, 15000],
    [SpaceType.PRIVATE_OFFICE]: [10000, 50000],
    [SpaceType.MEETING_ROOM]: [15000, 80000],
    [SpaceType.TRAINING_ROOM]: [20000, 100000],
    // Event & Social (daily)
    [SpaceType.EVENT_HALL]: [200000, 2000000],
    [SpaceType.BANQUET_HALL]: [300000, 3000000],
    [SpaceType.OUTDOOR_VENUE]: [100000, 1000000],
    [SpaceType.LOUNGE_ROOFTOP]: [50000, 300000],
    // Creative & Production (hourly)
    [SpaceType.PHOTO_STUDIO]: [15000, 80000],
    [SpaceType.RECORDING_STUDIO]: [20000, 100000],
    [SpaceType.FILM_STUDIO]: [50000, 200000],
    // Stay & Accommodation (nightly)
    [SpaceType.BOUTIQUE_HOTEL]: [50000, 500000],
    [SpaceType.SERVICED_APARTMENT]: [30000, 300000],
    [SpaceType.SHORT_TERM_RENTAL]: [20000, 150000],
    // Specialty (varies)
    [SpaceType.POP_UP_RETAIL]: [50000, 500000],
    [SpaceType.SHOWROOM]: [100000, 800000],
    [SpaceType.KITCHEN_CULINARY]: [20000, 100000],
    [SpaceType.WAREHOUSE]: [100000, 1000000],
    [SpaceType.ART_GALLERY]: [50000, 500000],
    [SpaceType.DANCE_STUDIO]: [10000, 50000],
    [SpaceType.GYM_FITNESS]: [15000, 80000],
    [SpaceType.PRAYER_MEDITATION]: [5000, 30000],
    [SpaceType.TECH_HUB]: [10000, 60000],
    [SpaceType.GAMING_LOUNGE]: [10000, 50000],
    [SpaceType.CONFERENCE_CENTER]: [500000, 5000000],
  };
  
  const [minPrice, maxPrice] = priceRanges[spaceType] || [10000, 100000];
  const basePrice = randomPrice(minPrice, maxPrice);
  
  const capacity = randomNumber(2, 100);
  const includedGuests = Math.min(randomNumber(1, 5), capacity);
  
  // Generate trending/analytics data
  const popularity = Math.random(); // 0-1 factor
  const viewCount = Math.floor(popularity * 500 + randomNumber(10, 100));
  const bookingCount = Math.floor(popularity * viewCount * 0.05 + randomNumber(0, 10));
  const favoriteCount = Math.floor(popularity * 30 + randomNumber(0, 10));
  const rating = Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
  const reviewCount = randomNumber(0, 150);
  
  // Calculate trending score
  const trendingScore = Math.round(
    (bookingCount * 10) + 
    (viewCount * 0.1) + 
    (favoriteCount * 2) + 
    (rating * reviewCount * 0.5) +
    (popularity * 20) // Random boost
  );
  
  return {
    id: `listing_gen_${index}_${Date.now()}`,
    hostId,
    title: `${prefix} ${suffix} in ${location.name.split(',')[0]}`,
    description: `Welcome to this ${prefix.toLowerCase()} ${suffix.toLowerCase()} located in the heart of ${location.name}. Perfect for ${spaceType === SpaceType.CONFERENCE ? 'meetings and workshops' : spaceType === SpaceType.EVENT_CENTER ? 'weddings, parties, and corporate events' : spaceType === SpaceType.STUDIO ? 'photo shoots and creative sessions' : 'short stays and relaxation'}. The space features modern amenities and is professionally maintained. Book now for an unforgettable experience!`,
    type: spaceType,
    price: basePrice,
    priceUnit: isHourly ? BookingType.HOURLY : BookingType.DAILY,
    images: randomItems(SAMPLE_IMAGES, 3, 6),
    location: location.name,
    address: `${randomNumber(1, 50)} ${['Admiralty Way', 'Adeola Odeku', 'Ozumba Mbadiwe', 'Akin Adesola', 'Awolowo Road'][randomNumber(0, 4)]}, ${location.name}`,
    coordinates: {
      lat: location.lat + (Math.random() - 0.5) * 0.02,
      lng: location.lng + (Math.random() - 0.5) * 0.02,
    },
    status: ListingStatus.LIVE,
    tags: [spaceType, location.name.split(',')[0], isHourly ? 'hourly' : 'daily'],
    availability: isHourly ? generateAvailability() : undefined,
    capacity,
    includedGuests,
    pricePerExtraGuest: Math.round(basePrice * 0.1),
    cautionFee: Math.round(basePrice * 0.2),
    addOns: Math.random() > 0.5 ? [
      { id: `addon_${index}_1`, name: 'Catering', price: randomPrice(5000, 30000), description: 'Full catering service' },
      { id: `addon_${index}_2`, name: 'Photography', price: randomPrice(20000, 50000), description: 'Professional photographer' },
      { id: `addon_${index}_3`, name: 'Decoration', price: randomPrice(10000, 50000), description: 'Event decoration' },
    ] : undefined,
    amenities: randomItems(AMENITIES, 4, 10),
    cancellationPolicy: randomItem([
      CancellationPolicy.FLEXIBLE,
      CancellationPolicy.MODERATE,
      CancellationPolicy.STRICT,
    ]),
    houseRules: randomItems(HOUSE_RULES, 3, 6),
    safetyItems: randomItems(SAFETY_ITEMS, 2, 5),
    approvalTime: randomItem(['0-15 mins', '15-30 mins', '1-2 hours', 'Within 24 hours']),
    settings: {
      allowRecurring: Math.random() > 0.3,
      minDuration: isHourly ? randomNumber(1, 3) : 1,
      instantBook: Math.random() > 0.7,
    },
    // Ratings & Analytics
    rating,
    reviewCount,
    viewCount,
    bookingCount,
    favoriteCount,
    trendingScore,
    lastBookedAt: Math.random() > 0.3 
      ? new Date(Date.now() - randomNumber(1, 30) * 24 * 60 * 60 * 1000).toISOString()
      : undefined,
  };
};

/**
 * Generate an array of mock listings
 * Ensures ALL space types have at least one listing, then fills remaining with random types
 */
export const generateMockListings = (count: number = 200): Listing[] => {
  const hostIds = [
    'host_jane_123',
    'host_sarah_456',
    'host_michael_789',
    'host_emma_012',
    'host_david_345',
  ];
  
  const listings: Listing[] = [];
  let index = 0;
  
  // First, ensure at least one listing per space type for complete coverage
  for (const spaceType of SPACE_TYPES) {
    const hostId = randomItem(hostIds);
    listings.push(generateListingWithType(index, hostId, spaceType));
    index++;
  }
  
  // Fill remaining count with random space types
  const remaining = Math.max(0, count - SPACE_TYPES.length);
  for (let i = 0; i < remaining; i++) {
    const hostId = randomItem(hostIds);
    listings.push(generateListing(index, hostId));
    index++;
  }
  
  // Shuffle to mix guaranteed types with random ones
  return listings.sort(() => Math.random() - 0.5);
};

/**
 * Generate a listing with a specific space type (for ensuring coverage)
 */
const generateListingWithType = (index: number, hostId: string, spaceType: SpaceType): Listing => {
  const location = randomItem(LOCATIONS);
  const category = SPACE_TYPE_CATEGORIES[spaceType];
  
  // Determine pricing model based on category
  const isHourly = category === SpaceCategory.WORK_PRODUCTIVITY || 
                   category === SpaceCategory.CREATIVE_PRODUCTION ||
                   spaceType === SpaceType.LOUNGE_ROOFTOP ||
                   spaceType === SpaceType.DANCE_STUDIO ||
                   spaceType === SpaceType.GYM_FITNESS ||
                   spaceType === SpaceType.KITCHEN_CULINARY ||
                   spaceType === SpaceType.GAMING_LOUNGE;
  
  const prefix = randomItem(TITLE_PREFIXES);
  const suffix = randomItem(TITLE_SUFFIXES[spaceType] || ['Space']);
  
  // Price ranges based on type
  const priceRanges: Partial<Record<SpaceType, [number, number]>> = {
    // Work & Productivity (hourly)
    [SpaceType.CO_WORKING]: [3000, 15000],
    [SpaceType.PRIVATE_OFFICE]: [10000, 50000],
    [SpaceType.MEETING_ROOM]: [15000, 80000],
    [SpaceType.TRAINING_ROOM]: [20000, 100000],
    // Event & Social (daily)
    [SpaceType.EVENT_HALL]: [200000, 2000000],
    [SpaceType.BANQUET_HALL]: [300000, 3000000],
    [SpaceType.OUTDOOR_VENUE]: [100000, 1000000],
    [SpaceType.LOUNGE_ROOFTOP]: [50000, 300000],
    // Creative & Production (hourly)
    [SpaceType.PHOTO_STUDIO]: [15000, 80000],
    [SpaceType.RECORDING_STUDIO]: [20000, 100000],
    [SpaceType.FILM_STUDIO]: [50000, 200000],
    // Stay & Accommodation (nightly)
    [SpaceType.BOUTIQUE_HOTEL]: [50000, 500000],
    [SpaceType.SERVICED_APARTMENT]: [30000, 300000],
    [SpaceType.SHORT_TERM_RENTAL]: [20000, 150000],
    // Specialty (varies)
    [SpaceType.POP_UP_RETAIL]: [50000, 500000],
    [SpaceType.SHOWROOM]: [100000, 800000],
    [SpaceType.KITCHEN_CULINARY]: [20000, 100000],
    [SpaceType.WAREHOUSE]: [100000, 1000000],
    [SpaceType.ART_GALLERY]: [50000, 500000],
    [SpaceType.DANCE_STUDIO]: [10000, 50000],
    [SpaceType.GYM_FITNESS]: [15000, 80000],
    [SpaceType.PRAYER_MEDITATION]: [5000, 30000],
    [SpaceType.TECH_HUB]: [10000, 60000],
    [SpaceType.GAMING_LOUNGE]: [10000, 50000],
    [SpaceType.CONFERENCE_CENTER]: [500000, 5000000],
  };
  
  const [minPrice, maxPrice] = priceRanges[spaceType] || [10000, 100000];
  const basePrice = randomPrice(minPrice, maxPrice);
  
  const capacity = randomNumber(2, 100);
  const includedGuests = Math.min(randomNumber(1, 5), capacity);
  
  // Generate trending/analytics data
  const popularity = Math.random();
  const viewCount = Math.floor(popularity * 500 + randomNumber(10, 100));
  const bookingCount = Math.floor(popularity * viewCount * 0.05 + randomNumber(0, 10));
  const favoriteCount = Math.floor(popularity * 30 + randomNumber(0, 10));
  const rating = Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
  const reviewCount = randomNumber(0, 150);
  
  const trendingScore = Math.round(
    (bookingCount * 10) + 
    (viewCount * 0.1) + 
    (favoriteCount * 2) + 
    (rating * reviewCount * 0.5) +
    (popularity * 20)
  );
  
  return {
    id: `listing_gen_${index}_${Date.now()}`,
    hostId,
    title: `${prefix} ${suffix} in ${location.name.split(',')[0]}`,
    description: `Beautiful ${suffix.toLowerCase()} in the heart of ${location.name}. Perfect for your needs with modern amenities and a welcoming atmosphere.`,
    type: spaceType,
    price: basePrice,
    priceUnit: isHourly ? BookingType.HOURLY : BookingType.DAILY,
    location: location.name,
    address: `${randomNumber(1, 50)} Example Street, ${location.name}`,
    coordinates: { lat: location.lat + (Math.random() - 0.5) * 0.02, lng: location.lng + (Math.random() - 0.5) * 0.02 },
    images: randomItems(SAMPLE_IMAGES, 3, 6),
    capacity,
    includedGuests,
    pricePerExtraGuest: Math.round(basePrice * 0.1),
    cautionFee: Math.round(basePrice * 0.2),
    status: ListingStatus.LIVE,
    tags: [spaceType, location.name.split(',')[0], isHourly ? 'hourly' : 'daily'],
    availability: isHourly ? generateAvailability() : undefined,
    amenities: randomItems(AMENITIES, 4, 10),
    houseRules: randomItems(HOUSE_RULES, 2, 5),
    safetyItems: randomItems(SAFETY_ITEMS, 2, 5),
    cancellationPolicy: randomItem([CancellationPolicy.FLEXIBLE, CancellationPolicy.MODERATE, CancellationPolicy.STRICT]),
    settings: {
      allowRecurring: Math.random() > 0.3,
      minDuration: isHourly ? randomNumber(1, 3) : 1,
      instantBook: Math.random() > 0.7,
    },
    createdAt: new Date(Date.now() - randomNumber(1, 180) * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - randomNumber(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
    rating,
    reviewCount,
    viewCount,
    bookingCount,
    favoriteCount,
    trendingScore,
    lastBookedAt: Math.random() > 0.3 
      ? new Date(Date.now() - randomNumber(1, 30) * 24 * 60 * 60 * 1000).toISOString()
      : undefined,
  };
};

/**
 * Inject mock listings into localStorage
 */
export const injectMockListings = (count: number = 200): void => {
  const STORAGE_KEY = 'fiilar_listings';
  
  // Get existing listings
  const existing = localStorage.getItem(STORAGE_KEY);
  const existingListings: Listing[] = existing ? JSON.parse(existing) : [];
  
  // Generate new listings
  const newListings = generateMockListings(count);
  
  // Merge (keeping existing, adding new)
  const merged = [...existingListings, ...newListings];
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  
  console.log(`✅ Injected ${count} mock listings. Total: ${merged.length}`);
  console.log('🔄 Refresh the page to see the new listings.');
};

/**
 * Clear all generated listings (keeps original demo data)
 */
export const clearGeneratedListings = (): void => {
  const STORAGE_KEY = 'fiilar_listings';
  
  const existing = localStorage.getItem(STORAGE_KEY);
  const listings: Listing[] = existing ? JSON.parse(existing) : [];
  
  // Keep only listings that don't have 'listing_gen_' prefix
  const original = listings.filter(l => !l.id.startsWith('listing_gen_'));
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(original));
  
  console.log(`🗑️ Cleared generated listings. Remaining: ${original.length}`);
};

/**
 * Quick inject from browser console
 * Run: window.injectListings(200)
 */
if (typeof window !== 'undefined') {
  (window as any).injectListings = injectMockListings;
  (window as any).clearGeneratedListings = clearGeneratedListings;
}

export default generateMockListings;
