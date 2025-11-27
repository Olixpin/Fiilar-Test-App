/**
 * Mock Listing Generator
 * Generates 200+ realistic listings for testing infinite scroll/pagination
 * 
 * Usage: 
 *   import { generateMockListings, injectMockListings } from './generateMockListings';
 *   injectMockListings(200); // Adds 200 listings to localStorage
 */

import { Listing, SpaceType, BookingType, ListingStatus, CancellationPolicy } from '@fiilar/types';

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

const SPACE_TYPES: SpaceType[] = [
  SpaceType.APARTMENT,
  SpaceType.STUDIO,
  SpaceType.CONFERENCE,
  SpaceType.EVENT_CENTER,
  SpaceType.CO_WORKING,
  SpaceType.OPEN_SPACE,
];

const TITLE_PREFIXES = [
  'Modern', 'Luxury', 'Cozy', 'Spacious', 'Premium', 'Executive', 
  'Elegant', 'Stylish', 'Beautiful', 'Stunning', 'Contemporary',
  'Chic', 'Serene', 'Bright', 'Charming', 'Sophisticated'
];

const TITLE_SUFFIXES: Record<SpaceType, string[]> = {
  [SpaceType.APARTMENT]: ['Apartment', 'Flat', 'Suite', 'Residence', 'Loft'],
  [SpaceType.STUDIO]: ['Photography Studio', 'Creative Studio', 'Art Studio', 'Recording Studio', 'Dance Studio'],
  [SpaceType.CONFERENCE]: ['Conference Room', 'Meeting Room', 'Boardroom', 'Training Room', 'Seminar Hall'],
  [SpaceType.EVENT_CENTER]: ['Event Hall', 'Banquet Hall', 'Party Venue', 'Wedding Venue', 'Celebration Center'],
  [SpaceType.CO_WORKING]: ['Co-working Space', 'Shared Office', 'Work Hub', 'Business Center', 'Desk Space'],
  [SpaceType.OPEN_SPACE]: ['Rooftop Space', 'Garden Venue', 'Outdoor Area', 'Terrace', 'Lawn Space'],
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
  const isHourly = spaceType === SpaceType.STUDIO || 
                   spaceType === SpaceType.CONFERENCE || 
                   spaceType === SpaceType.CO_WORKING ||
                   Math.random() > 0.5;
  
  const prefix = randomItem(TITLE_PREFIXES);
  const suffix = randomItem(TITLE_SUFFIXES[spaceType]);
  
  // Price ranges based on type
  const priceRanges: Record<SpaceType, [number, number]> = {
    [SpaceType.APARTMENT]: isHourly ? [5000, 25000] : [50000, 300000],
    [SpaceType.STUDIO]: [10000, 50000],
    [SpaceType.CONFERENCE]: [15000, 100000],
    [SpaceType.EVENT_CENTER]: [100000, 1000000],
    [SpaceType.CO_WORKING]: [3000, 15000],
    [SpaceType.OPEN_SPACE]: [50000, 500000],
  };
  
  const [minPrice, maxPrice] = priceRanges[spaceType];
  const basePrice = randomPrice(minPrice, maxPrice);
  
  const capacity = randomNumber(2, 100);
  const includedGuests = Math.min(randomNumber(1, 5), capacity);
  
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
    rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
    reviewCount: randomNumber(0, 150),
  };
};

/**
 * Generate an array of mock listings
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
  
  for (let i = 0; i < count; i++) {
    const hostId = randomItem(hostIds);
    listings.push(generateListing(i, hostId));
  }
  
  return listings;
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
