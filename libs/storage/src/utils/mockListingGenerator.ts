import { Listing, SpaceType, ListingStatus, BookingType, CancellationPolicy, PricingModel, Review } from '@fiilar/types';

/**
 * Mock Listing Generator
 * Generates 200+ realistic listings for testing infinite scroll
 */

// Helper to get today's date string
const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const dayAfterTomorrow = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

// Image pools for different space types
const IMAGES = {
  STUDIO: [
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=2080',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=2071',
  ],
  APARTMENT: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=2080',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=2053',
  ],
  CONFERENCE: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&q=80&w=2070',
  ],
  EVENT_CENTER: [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=2098',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=2012',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=2069',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=2069',
  ],
  CO_WORKING: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069',
    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=2069',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&q=80&w=2070',
  ],
  OPEN_SPACE: [
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=2074',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=2232',
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1585229260439-73c31e5e9162?auto=format&fit=crop&q=80&w=2070',
  ],
};

// Location pools
const LAGOS_LOCATIONS = [
  'Lekki Phase 1, Lagos',
  'Victoria Island, Lagos',
  'Ikoyi, Lagos',
  'Yaba, Lagos',
  'Surulere, Lagos',
  'Ikeja, Lagos',
  'Maryland, Lagos',
  'Magodo, Lagos',
  'Ajah, Lagos',
  'Eko Atlantic, Lagos',
  'Banana Island, Lagos',
  'Gbagada, Lagos',
  'Ogudu, Lagos',
  'Ogba, Lagos',
  'Festac Town, Lagos',
  'Anthony, Lagos',
  'Ojodu, Lagos',
  'Agege, Lagos',
  'Apapa, Lagos',
  'Mushin, Lagos',
];

const ABUJA_LOCATIONS = [
  'Wuse 2, Abuja',
  'Maitama, Abuja',
  'Garki, Abuja',
  'Asokoro, Abuja',
  'Gwarinpa, Abuja',
  'Jabi, Abuja',
  'Utako, Abuja',
  'Life Camp, Abuja',
  'Katampe, Abuja',
  'Central Business District, Abuja',
];

const PH_LOCATIONS = [
  'GRA Phase 1, Port Harcourt',
  'Trans Amadi, Port Harcourt',
  'Rumuola, Port Harcourt',
  'Diobu, Port Harcourt',
  'Eleme Junction, Port Harcourt',
];

const INTERNATIONAL_LOCATIONS = [
  'SoHo, New York',
  'Financial District, New York',
  'Tribeca, New York',
  'Shoreditch, London',
  'Canary Wharf, London',
  'Downtown, Dubai',
  'Business Bay, Dubai',
];

const ALL_LOCATIONS = [...LAGOS_LOCATIONS, ...ABUJA_LOCATIONS, ...PH_LOCATIONS, ...INTERNATIONAL_LOCATIONS];

// Title templates by space type (only defining supported types)
const TITLE_TEMPLATES: Partial<Record<SpaceType, string[]>> = {
  [SpaceType.STUDIO]: [
    'Daylight Photo Studio',
    'Creative Photography Space',
    'Professional Recording Studio',
    'Art & Design Studio',
    'Podcast Recording Studio',
    'Film Production Studio',
    'Dance Rehearsal Studio',
    'Music Practice Room',
    'Content Creation Studio',
    'Video Production Loft',
    'Portrait Photography Studio',
    'Commercial Shoot Space',
  ],
  [SpaceType.APARTMENT]: [
    'Modern Minimalist Apartment',
    'Luxury Penthouse Suite',
    'Cozy Urban Flat',
    'Designer Loft Space',
    'Stylish City Apartment',
    'Premium Serviced Apartment',
    'Boutique Studio Apartment',
    'Executive Living Space',
    'Contemporary 2BR Apartment',
    'Chic Lifestyle Apartment',
    'Ocean View Residence',
    'Garden Terrace Flat',
  ],
  [SpaceType.CONFERENCE]: [
    'Executive Boardroom',
    'Tech Conference Room',
    'Glass Meeting Room',
    'Corporate Presentation Suite',
    'Innovation Hub Meeting Space',
    'Skyline Boardroom',
    'Private Meeting Room',
    'Training & Workshop Room',
    'Team Collaboration Space',
    'Client Presentation Room',
    'VIP Conference Suite',
    'Modern Business Lounge',
  ],
  [SpaceType.EVENT_CENTER]: [
    'Grand Event Hall',
    'Rooftop Event Venue',
    'Intimate Garden Venue',
    'Celebration Hall',
    'Wedding Reception Hall',
    'Corporate Event Space',
    'Party Venue',
    'Exhibition Hall',
    'Banquet Hall',
    'Multi-Purpose Event Center',
    'Outdoor Event Space',
    'Premium Function Room',
  ],
  [SpaceType.CO_WORKING]: [
    'Premium Co-working Desk',
    'Shared Creative Hub',
    'Executive Co-working Space',
    'Tech Startup Hub',
    'Freelancer Workspace',
    'Hot Desk Space',
    'Innovation Lab Desk',
    'Community Workspace',
    'Professional Office Share',
    'Digital Nomad Space',
    'Collaborative Work Hub',
    'Startup Accelerator Desk',
  ],
  [SpaceType.OPEN_SPACE]: [
    'Sunny Garden Space',
    'Rooftop Terrace',
    'Urban Park Area',
    'Landscaped Garden',
    'Outdoor Yoga Space',
    'Picnic Garden',
    'Event Lawn',
    'Courtyard Space',
    'Nature Retreat',
    'Open Air Venue',
    'Beach Side Space',
    'Mountain View Terrace',
  ],
};

// Description templates
const DESCRIPTION_PARTS = {
  intro: [
    'A stunning space perfect for',
    'An exceptional venue ideal for',
    'A beautifully designed space suited for',
    'A premium location tailored for',
    'An inspiring environment designed for',
    'A professional space equipped for',
  ],
  features: [
    'Features high ceilings, natural light, and modern amenities.',
    'Includes state-of-the-art equipment and comfortable furnishings.',
    'Boasts premium finishes and thoughtful design details.',
    'Offers a blend of style and functionality.',
    'Equipped with everything you need for a productive session.',
    'Provides a serene atmosphere perfect for focus and creativity.',
  ],
  closing: [
    'Perfect for professionals seeking quality.',
    'Ideal for discerning clients.',
    'The ultimate choice for your needs.',
    'Book now for an unforgettable experience.',
    'Your perfect space awaits.',
    'Experience the difference.',
  ],
};

// Amenities by type (only defining supported types)
const AMENITIES_BY_TYPE: Partial<Record<SpaceType, Array<{ name: string; icon: string }>>> = {
  [SpaceType.STUDIO]: [
    { name: 'Wifi', icon: 'Wifi' },
    { name: 'Lighting Kit', icon: 'Sun' },
    { name: 'Backdrop', icon: 'Layout' },
    { name: 'AC', icon: 'Wind' },
    { name: 'Sound System', icon: 'Speaker' },
    { name: 'Makeup Station', icon: 'User' },
  ],
  [SpaceType.APARTMENT]: [
    { name: 'Wifi', icon: 'Wifi' },
    { name: 'Kitchen', icon: 'Coffee' },
    { name: 'AC', icon: 'Wind' },
    { name: 'Parking', icon: 'Car' },
    { name: 'TV', icon: 'Monitor' },
    { name: 'Balcony', icon: 'Sun' },
  ],
  [SpaceType.CONFERENCE]: [
    { name: 'Wifi', icon: 'Wifi' },
    { name: 'Projector', icon: 'Monitor' },
    { name: 'Whiteboard', icon: 'Edit3' },
    { name: 'Video Conf', icon: 'Video' },
    { name: 'AC', icon: 'Wind' },
    { name: 'Coffee', icon: 'Coffee' },
  ],
  [SpaceType.EVENT_CENTER]: [
    { name: 'Sound System', icon: 'Speaker' },
    { name: 'Stage', icon: 'Layout' },
    { name: 'Lighting', icon: 'Sun' },
    { name: 'Parking', icon: 'Car' },
    { name: 'Catering Area', icon: 'Coffee' },
    { name: 'AC', icon: 'Wind' },
  ],
  [SpaceType.CO_WORKING]: [
    { name: 'Wifi', icon: 'Wifi' },
    { name: 'Coffee', icon: 'Coffee' },
    { name: 'Printer', icon: 'Printer' },
    { name: 'Lounge', icon: 'Armchair' },
    { name: 'Meeting Room', icon: 'Users' },
    { name: 'AC', icon: 'Wind' },
  ],
  [SpaceType.OPEN_SPACE]: [
    { name: 'Restroom', icon: 'Home' },
    { name: 'Power Outlet', icon: 'Zap' },
    { name: 'Shade', icon: 'Cloud' },
    { name: 'Seating', icon: 'Layout' },
    { name: 'Parking', icon: 'Car' },
    { name: 'Water', icon: 'Droplet' },
  ],
};

// Add-ons by type (only defining supported types)
const ADDONS_BY_TYPE: Partial<Record<SpaceType, Array<{ id: string; name: string; price: number; description: string }>>> = {
  [SpaceType.STUDIO]: [
    { id: 'studio1', name: 'Lighting Kit', price: 5000, description: 'Professional lights' },
    { id: 'studio2', name: 'Backdrop Setup', price: 3000, description: 'Various colors available' },
    { id: 'studio3', name: 'Props Collection', price: 2000, description: 'Furniture and accessories' },
  ],
  [SpaceType.APARTMENT]: [
    { id: 'apt1', name: 'Early Check-in', price: 10000, description: 'Check in from 9am' },
    { id: 'apt2', name: 'Late Check-out', price: 10000, description: 'Check out by 3pm' },
    { id: 'apt3', name: 'Airport Pickup', price: 15000, description: 'Round trip transfer' },
  ],
  [SpaceType.CONFERENCE]: [
    { id: 'conf1', name: 'Catering Package', price: 20000, description: 'Coffee and snacks' },
    { id: 'conf2', name: 'Recording Setup', price: 10000, description: 'Audio/video recording' },
    { id: 'conf3', name: 'Extra Hour', price: 8000, description: 'Extend your booking' },
  ],
  [SpaceType.EVENT_CENTER]: [
    { id: 'event1', name: 'DJ Setup', price: 50000, description: 'Sound and lights' },
    { id: 'event2', name: 'Decoration', price: 30000, description: 'Basic setup' },
    { id: 'event3', name: 'Security', price: 25000, description: '2 guards for event' },
  ],
  [SpaceType.CO_WORKING]: [
    { id: 'cw1', name: 'Private Phone Booth', price: 2000, description: 'For calls' },
    { id: 'cw2', name: 'Meeting Room Hour', price: 5000, description: '1 hour access' },
    { id: 'cw3', name: 'Printing Credits', price: 1000, description: '50 pages' },
  ],
  [SpaceType.OPEN_SPACE]: [
    { id: 'os1', name: 'Tent Setup', price: 15000, description: 'Canopy tent' },
    { id: 'os2', name: 'Chair Rental', price: 5000, description: '20 chairs' },
    { id: 'os3', name: 'Generator', price: 10000, description: '5KVA backup' },
  ],
};

// Price ranges by type (in local currency - Naira for Nigeria)
const PRICE_RANGES: Partial<Record<SpaceType, { min: number; max: number; isHourly: boolean }>> = {
  [SpaceType.STUDIO]: { min: 5000, max: 50000, isHourly: true },
  [SpaceType.APARTMENT]: { min: 30000, max: 300000, isHourly: false },
  [SpaceType.CONFERENCE]: { min: 10000, max: 80000, isHourly: true },
  [SpaceType.EVENT_CENTER]: { min: 100000, max: 1000000, isHourly: false },
  [SpaceType.CO_WORKING]: { min: 3000, max: 20000, isHourly: true },
  [SpaceType.OPEN_SPACE]: { min: 10000, max: 100000, isHourly: true },
};

// Capacity ranges by type (only defining supported types)
const CAPACITY_RANGES: Partial<Record<SpaceType, { min: number; max: number }>> = {
  [SpaceType.STUDIO]: { min: 4, max: 20 },
  [SpaceType.APARTMENT]: { min: 2, max: 12 },
  [SpaceType.CONFERENCE]: { min: 6, max: 30 },
  [SpaceType.EVENT_CENTER]: { min: 50, max: 500 },
  [SpaceType.CO_WORKING]: { min: 1, max: 5 },
  [SpaceType.OPEN_SPACE]: { min: 10, max: 100 },
};

// Helper functions
const randomFromArray = <T>(arr: T[] | undefined): T | undefined => {
  if (!arr || arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
};
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals: number = 1): number => {
  const multiplier = Math.pow(10, decimals);
  return Math.round((Math.random() * (max - min) + min) * multiplier) / multiplier;
};

const shuffleArray = <T>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generateAvailability = (): Record<string, number[]> => {
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const availability: Record<string, number[]> = {};
  
  // Today - random subset of hours
  const todayHours = shuffleArray(hours).slice(0, randomInt(3, 10));
  availability[today] = todayHours.sort((a, b) => a - b);
  
  // Tomorrow - more availability
  const tomorrowHours = shuffleArray(hours).slice(0, randomInt(5, 12));
  availability[tomorrow] = tomorrowHours.sort((a, b) => a - b);
  
  // Day after tomorrow
  const dayAfterHours = shuffleArray(hours).slice(0, randomInt(4, 11));
  availability[dayAfterTomorrow] = dayAfterHours.sort((a, b) => a - b);
  
  return availability;
};

const generateDescription = (type: SpaceType): string => {
  const intro = randomFromArray(DESCRIPTION_PARTS.intro) || 'A stunning space perfect for';
  const features = randomFromArray(DESCRIPTION_PARTS.features) || 'Features modern amenities.';
  const closing = randomFromArray(DESCRIPTION_PARTS.closing) || 'Book now.';
  
  const typeDescriptions: Partial<Record<SpaceType, string>> = {
    [SpaceType.STUDIO]: 'photography, video production, and creative sessions',
    [SpaceType.APARTMENT]: 'lifestyle shoots, short stays, and content creation',
    [SpaceType.CONFERENCE]: 'meetings, presentations, and corporate events',
    [SpaceType.EVENT_CENTER]: 'weddings, parties, and large gatherings',
    [SpaceType.CO_WORKING]: 'freelancers, remote workers, and startups',
    [SpaceType.OPEN_SPACE]: 'outdoor events, yoga, and intimate gatherings',
  };
  
  const typeDesc = typeDescriptions[type] || 'various activities';
  return `${intro} ${typeDesc}. ${features} ${closing}`;
};

/**
 * Generate a single mock listing
 */
const generateListing = (id: string, hostId: string): Listing => {
  // Only use space types that have complete template data
  const supportedSpaceTypes = [
    SpaceType.STUDIO,
    SpaceType.APARTMENT,
    SpaceType.CONFERENCE,
    SpaceType.EVENT_CENTER,
    SpaceType.CO_WORKING,
    SpaceType.OPEN_SPACE,
  ];
  const type = randomFromArray(supportedSpaceTypes) || SpaceType.STUDIO;
  const location = randomFromArray(ALL_LOCATIONS) || 'Lagos, Nigeria';
  const titles = TITLE_TEMPLATES[type] || TITLE_TEMPLATES[SpaceType.STUDIO] || [];
  const title = `${randomFromArray(titles) || 'Premium Space'} - ${location.split(',')[0]}`;
  
  // Provide defaults for configs since Partial<Record> can return undefined
  const defaultPriceConfig = { min: 5000, max: 50000, isHourly: true };
  const defaultCapacityConfig = { min: 4, max: 20 };
  
  const priceConfig = PRICE_RANGES[type] || defaultPriceConfig;
  const price = randomInt(priceConfig.min, priceConfig.max);
  const priceUnit = priceConfig.isHourly ? BookingType.HOURLY : BookingType.DAILY;
  const pricingModel = priceConfig.isHourly ? PricingModel.HOURLY : PricingModel.NIGHTLY;
  
  const capacityConfig = CAPACITY_RANGES[type] || defaultCapacityConfig;
  const capacity = randomInt(capacityConfig.min, capacityConfig.max);
  
  // New "max is max" model: maxGuests = base capacity, all included in price
  const maxGuests = capacity;
  // ~60% of listings allow extra guests for variety
  const allowExtraGuests = Math.random() > 0.4;
  // Extra guest limit is up to 50% of maxGuests
  const extraGuestLimit = allowExtraGuests ? Math.max(1, Math.ceil(maxGuests * randomFloat(0.2, 0.5))) : 0;
  // Extra guest fee: ₦500 minimum, typically 5-15% of base price
  const extraGuestFee = allowExtraGuests ? Math.max(500, Math.round(price * randomFloat(0.05, 0.15))) : 0;
  
  const allAmenities = AMENITIES_BY_TYPE[type] || AMENITIES_BY_TYPE[SpaceType.STUDIO] || [];
  const numAmenities = allAmenities.length > 0 ? randomInt(3, Math.min(6, allAmenities.length)) : 0;
  const amenities = shuffleArray(allAmenities).slice(0, numAmenities);
  
  const allAddons = ADDONS_BY_TYPE[type] || ADDONS_BY_TYPE[SpaceType.STUDIO] || [];
  const numAddons = allAddons.length > 0 ? randomInt(1, allAddons.length) : 0;
  const addOns = shuffleArray(allAddons).slice(0, numAddons).map((addon, idx) => ({
    ...addon,
    id: `${id}-addon-${idx}`,
  }));
  
  const imageKey = type.toUpperCase() as keyof typeof IMAGES;
  const images = shuffleArray(IMAGES[imageKey] || IMAGES.STUDIO);
  
  const cancellationPolicies = [
    CancellationPolicy.FLEXIBLE,
    CancellationPolicy.MODERATE,
    CancellationPolicy.STRICT,
  ];
  
  const approvalTimes = ['0-15 mins', '15-30 mins', '30-60 mins', '1-2 hours'];
  
  const houseRules = [
    'No smoking indoors',
    'No loud music after 10pm',
    'Clean up after use',
    'No outside food allowed',
    'Respect the space',
    'Overtime charged at 1.5x rate',
    'No pets allowed',
    'ID required for entry',
  ];
  
  const safetyItems = [
    'First aid kit',
    'Fire extinguisher',
    'Smoke alarm',
    'Security cameras',
    'Emergency exit',
    '24/7 Security',
  ];
  
  const isInstantBook = Math.random() > 0.6;
  const requiresVerification = Math.random() > 0.5;
  
  const bookingConfig = priceConfig.isHourly
    ? {
        operatingHours: { start: '09:00', end: '18:00' },
        bufferMinutes: randomFromArray([15, 30, 45, 60]) ?? 30,
        minHoursBooking: randomFromArray([1, 2, 3, 4]) ?? 1,
      }
    : {
        checkInTime: randomFromArray(['12:00', '14:00', '15:00', '16:00']) ?? '14:00',
        checkOutTime: randomFromArray(['10:00', '11:00', '12:00']) ?? '11:00',
        allowLateCheckout: Math.random() > 0.7,
      };
  
  return {
    id,
    hostId,
    title,
    description: generateDescription(type),
    type,
    price,
    priceUnit,
    pricingModel,
    bookingConfig,
    images,
    location,
    address: `Plot ${randomInt(1, 100)}, ${location}`,
    coordinates: {
      lat: randomFloat(6.4, 6.6, 4),
      lng: randomFloat(3.3, 3.5, 4),
    },
    status: ListingStatus.LIVE,
    tags: shuffleArray([type.toLowerCase(), location.split(',')[0].toLowerCase(), 'verified', 'premium', 'popular']).slice(0, 3),
    requiresIdentityVerification: requiresVerification,
    availability: generateAvailability(),
    settings: {
      allowRecurring: Math.random() > 0.3,
      minDuration: randomFromArray([1, 2, 3, 4]) ?? 1,
      instantBook: isInstantBook,
    },
    approvalTime: isInstantBook ? undefined : randomFromArray(approvalTimes),
    // New "max is max" guest model
    maxGuests,
    allowExtraGuests,
    extraGuestLimit,
    extraGuestFee,
    // Legacy fields for backward compatibility
    capacity,
    includedGuests: maxGuests, // In new model, all base guests are included
    pricePerExtraGuest: extraGuestFee, // Legacy field name
    cautionFee: Math.round(price * randomFloat(0.1, 0.5)),
    addOns,
    amenities,
    cancellationPolicy: randomFromArray(cancellationPolicies),
    houseRules: shuffleArray(houseRules).slice(0, randomInt(2, 4)),
    safetyItems: shuffleArray(safetyItems).slice(0, randomInt(2, 4)),
    // rating and reviewCount are calculated dynamically from reviews in storage
    // rating: randomFloat(3.5, 5, 1),
    // reviewCount: randomInt(0, 150),
  };
};

const REVIEW_COMMENTS = [
  "Great space! Would definitely book again.",
  "The host was very accommodating and the space was exactly as described.",
  "Perfect for our needs. Clean and spacious.",
  "Good location but a bit noisy.",
  "Amazing natural light! Highly recommended for photoshoots.",
  "The equipment provided was top notch.",
  "Easy check-in process and great communication.",
  "A bit smaller than expected but still worked for us.",
  "Fantastic experience. 5 stars!",
  "Clean, modern, and professional.",
  "The wifi was super fast, which was crucial for our meeting.",
  "Beautiful decor and ambiance.",
  "Had a great time hosting our event here.",
  "Value for money is excellent.",
  "Will be coming back for sure."
];

/**
 * Generate mock reviews for a list of listings
 */
export const generateMockReviews = (listings: Listing[]): Review[] => {
  const reviews: Review[] = [];
  const userIds = ['user_123', 'user_456', 'user_789', 'user_abc', 'user_def'];
  
  listings.forEach(listing => {
    // Generate a random number of reviews (0-50)
    // Some listings should have 0 reviews to test that case
    const hasReviews = Math.random() > 0.1;
    const reviewCount = hasReviews ? randomInt(1, 50) : 0;
    
    for (let i = 0; i < reviewCount; i++) {
      reviews.push({
        id: `review-${listing.id}-${i}`,
        listingId: listing.id,
        userId: randomFromArray(userIds) ?? 'user_123',
        bookingId: `booking-${listing.id}-${i}`,
        rating: randomInt(3, 5), // Mostly positive reviews
        comment: randomFromArray(REVIEW_COMMENTS) ?? 'Great space!',
        createdAt: new Date(Date.now() - randomInt(0, 30) * 86400000).toISOString() // Past 30 days
      });
    }
  });
  
  return reviews;
};

/**
 * Generate multiple mock listings
 * @param count Number of listings to generate
 * @param startId Starting ID number (default 100 to avoid conflicts with existing)
 */
export const generateMockListings = (count: number = 200, startId: number = 100): Listing[] => {
  const listings: Listing[] = [];
  const hostIds = ['host1', 'host2', 'host3', 'host4', 'host5', 'host_123'];
  
  for (let i = 0; i < count; i++) {
    const id = `generated-${startId + i}`;
    const hostId = randomFromArray(hostIds) ?? 'host_123';
    listings.push(generateListing(id, hostId));
  }
  
  return listings;
};

/**
 * Seed storage with generated listings
 * @param count Number of additional listings to generate
 * @param clearExisting If true, replaces all listings. If false, adds to existing.
 */
export const seedListingsInStorage = (count: number = 200, clearExisting: boolean = false): void => {
  const STORAGE_KEY_LISTINGS = 'fiilar_listings';
  const STORAGE_KEY_REVIEWS = 'fiilar_reviews';
  
  let existingListings: Listing[] = [];
  let existingReviews: Review[] = [];

  if (!clearExisting) {
    const storedListings = localStorage.getItem(STORAGE_KEY_LISTINGS);
    existingListings = storedListings ? JSON.parse(storedListings) : [];

    const storedReviews = localStorage.getItem(STORAGE_KEY_REVIEWS);
    existingReviews = storedReviews ? JSON.parse(storedReviews) : [];
  }
  
  const newListings = generateMockListings(count);
  const newReviews = generateMockReviews(newListings);

  const allListings = [...existingListings, ...newListings];
  const allReviews = [...existingReviews, ...newReviews];
  
  localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(allListings));
  localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(allReviews));
  
  console.log(`[MockListingGenerator] Seeded ${count} new listings and ${newReviews.length} reviews. Total Listings: ${allListings.length}`);
};

/**
 * Clear generated listings (keeps original mock listings)
 */
export const clearGeneratedListings = (): void => {
  const STORAGE_KEY = 'fiilar_listings';
  const stored = localStorage.getItem(STORAGE_KEY);
  const listings: Listing[] = stored ? JSON.parse(stored) : [];
  
  // Keep only listings with IDs 1-13 (original mock listings)
  const originalListings = listings.filter(l => {
    const numId = parseInt(l.id, 10);
    return !isNaN(numId) && numId >= 1 && numId <= 13;
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(originalListings));
  
  console.log(`[MockListingGenerator] Cleared generated listings. Remaining: ${originalListings.length}`);
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).FiilarMockGenerator = {
    generateMockListings,
    seedListingsInStorage,
    clearGeneratedListings,
  };
}
