import { SpaceType, Listing, ListingStatus, BookingType, CancellationPolicy, PricingModel } from '@fiilar/types';

/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
  USER: 'fiilar_user',
  USERS_DB: 'fiilar_users',
  LISTINGS: 'fiilar_listings',
  BOOKINGS: 'fiilar_bookings',
  REVIEWS: 'fiilar_reviews',
  DAMAGE_REPORTS: 'fiilar_damage_reports',
  ANALYTICS_EVENTS: 'fiilar_analytics_events',
  LISTING_ANALYTICS: 'fiilar_listing_analytics',
};


// Helper to get today's date string
const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

// SERVICE_FEE_PERCENTAGE is now in config/appConfig.ts
// Re-export for backward compatibility
export { BOOKING_CONFIG } from './config/appConfig';
export const SERVICE_FEE_PERCENTAGE = 0.10; // @deprecated - Use BOOKING_CONFIG.SERVICE_FEE_PERCENTAGE

export const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    hostId: 'host1',
    title: 'The White Loft - Daylight Studio',
    description: 'A stunning 1,500 sq ft daylight studio located in the heart of SoHo. Features 14ft ceilings, original hardwood floors, and south-facing windows that flood the space with natural light all day. Perfect for fashion editorials, portraiture, and commercial shoots. Includes a private styling area, hair & makeup station, and high-speed fiber internet.',
    type: SpaceType.STUDIO,
    price: 150,
    priceUnit: BookingType.HOURLY,
    pricingModel: PricingModel.HOURLY,
    bookingConfig: {
      operatingHours: { start: '09:00', end: '18:00' },
      bufferMinutes: 30,
      minHoursBooking: 2
    },
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=2080',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069',
      'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&q=80&w=2070'
    ],
    location: 'SoHo, New York',
    status: ListingStatus.LIVE,
    tags: ['daylight', 'loft', 'fashion', 'high ceilings'],
    requiresIdentityVerification: false,
    availability: {
      [today]: [9, 10, 11, 13, 14, 15],
      [tomorrow]: [9, 10, 11, 12, 13, 14, 15, 16]
    },
    settings: {
      allowRecurring: true,
      minDuration: 2,
      instantBook: true
    },
    capacity: 15,
    includedGuests: 5,
    pricePerExtraGuest: 20,
    cautionFee: 200,
    addOns: [
      { id: 'a1', name: 'Profoto Lighting Kit', price: 150, description: '2x D2 500 AirTTL, Air Remote, Stands' },
      { id: 'a2', name: 'Seamless Paper (Per Pull)', price: 25, description: 'White, Black, Grey available' },
      { id: 'a3', name: 'Digital Tech Station', price: 75, description: 'Tether tools, EIZO monitor' },
      { id: 'a4', name: 'Steamer & Rack', price: 15 }
    ],
    amenities: [
      { name: 'Wifi', icon: 'Wifi' },
      { name: 'Makeup Station', icon: 'User' },
      { name: 'Freight Elevator', icon: 'Box' },
      { name: 'Air Conditioning', icon: 'Wind' },
      { name: 'Sound System', icon: 'Speaker' }
    ],
    cancellationPolicy: CancellationPolicy.FLEXIBLE,
    houseRules: ['No glitter or confetti', 'Overtime billed at 1.5x', 'Leave space as found'],
    safetyItems: ['First aid kit', 'Fire extinguisher', 'Smoke alarm']
  },
  {
    id: '2',
    hostId: 'host2',
    title: 'Skyline Boardroom - Financial District',
    description: 'Impress your clients in this premium glass-walled boardroom with panoramic city views. Equipped with Herman Miller ergonomic seating, a massive 85" 4K display for presentations, and Polycom conference phone. The adjacent lounge area is perfect for breakouts or catering setup. Concierge service included in the lobby.',
    type: SpaceType.CONFERENCE,
    price: 200,
    priceUnit: BookingType.HOURLY,
    pricingModel: PricingModel.HOURLY,
    bookingConfig: { operatingHours: { start: '09:00', end: '18:00' }, bufferMinutes: 30, minHoursBooking: 1 },
    images: [
      '/assets/listing-2-hero.png',
      '/assets/listing-2-detail-1.png',
      '/assets/listing-2-detail-2.png',
      '/assets/listing-2-detail-3.png',
      '/assets/listing-2-detail-4.png'
    ],
    location: 'Financial District, New York',
    status: ListingStatus.LIVE,
    tags: ['executive', 'views', 'corporate', 'premium'],
    requiresIdentityVerification: true, // Requires verified user
    availability: {
      [today]: [14, 15, 16],
      [tomorrow]: [9, 10, 11, 14, 15, 16]
    },
    settings: {
      allowRecurring: true,
      minDuration: 1,
      instantBook: false
    },
    capacity: 14,
    includedGuests: 14,
    pricePerExtraGuest: 0,
    cautionFee: 0, // No deposit for corporate
    addOns: [
      { id: 'b1', name: 'Premium Catering', price: 250, description: 'Continental breakfast & coffee for 12' },
      { id: 'b2', name: 'Video Conferencing Setup', price: 50, description: 'Logitech Rally Plus system' },
      { id: 'b3', name: 'Whiteboard Capture', price: 20 }
    ],
    amenities: [
      { name: 'High-Speed Wifi', icon: 'Wifi' },
      { name: 'Nespresso Machine', icon: 'Coffee' },
      { name: '85" 4K TV', icon: 'Monitor' },
      { name: 'Conference Phone', icon: 'Phone' },
      { name: 'Whiteboard', icon: 'Edit3' }
    ],
    cancellationPolicy: CancellationPolicy.MODERATE,
    houseRules: ['No outside catering without approval', 'Building ID required for entry'],
    safetyItems: ['Smoke alarm', 'Security cameras', '24/7 Security']
  },
  {
    id: '3',
    hostId: 'host1',
    title: 'The Glass House - Rooftop Event Venue',
    description: 'An unforgettable rooftop venue featuring a retractable glass roof and 360-degree skyline views. This 3,000 sq ft space is the ultimate setting for product launches, cocktail parties, and exclusive dinners. Includes a fully equipped marble bar, state-of-the-art sound system, and customizable LED lighting. Heated for year-round use.',
    type: SpaceType.EVENT_CENTER,
    price: 2500,
    priceUnit: BookingType.DAILY,
    pricingModel: PricingModel.NIGHTLY,
    bookingConfig: { checkInTime: '15:00', checkOutTime: '11:00', allowLateCheckout: false },
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=2053',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2074',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80&w=2074'
    ],
    location: 'Tribeca, New York',
    status: ListingStatus.LIVE,
    requiresIdentityVerification: true,
    tags: ['rooftop', 'luxury', 'event', 'views'],
    settings: {
      allowRecurring: true,
      minDuration: 1,
      instantBook: false
    },
    capacity: 150,
    includedGuests: 50,
    pricePerExtraGuest: 35,
    cautionFee: 1000, // High deposit for luxury space
    addOns: [
      { id: 'c1', name: 'Post-Event Cleaning', price: 350, description: 'Mandatory for events > 50 ppl' },
      { id: 'c2', name: 'DJ Sound & Lighting', price: 500, description: 'Pioneer CDJs + Moving Heads' },
      { id: 'c3', name: 'Bar Staff (2 Pax)', price: 400, description: 'For 4 hours' },
      { id: 'c4', name: 'Security Detail', price: 300 }
    ],
    amenities: [
      { name: 'Full Bar', icon: 'Wine' },
      { name: 'DJ Booth', icon: 'Music' },
      { name: 'Retractable Roof', icon: 'Sun' },
      { name: 'Private Elevator', icon: 'ArrowUpCircle' },
      { name: 'Valet Parking', icon: 'Car' }
    ],
    cancellationPolicy: CancellationPolicy.STRICT,
    houseRules: ['No loud music after 11pm (City Ordinance)', 'No smoking indoors', 'Approved vendors only'],
    safetyItems: ['Fire suppression system', 'First aid kit', 'Doorman', 'Security cameras', 'AED']
  },
  {
    id: '4',
    hostId: 'host2',
    title: 'Modern Minimalist Apartment - Lekki Phase 1',
    description: 'A serene and stylish 2-bedroom apartment perfect for photoshoots and small video productions. Features neutral tones, contemporary furniture, and abundant natural light. Includes a fully equipped kitchen and a cozy balcony.',
    type: SpaceType.APARTMENT,
    price: 50000,
    priceUnit: BookingType.DAILY,
    pricingModel: PricingModel.NIGHTLY,
    bookingConfig: { checkInTime: '15:00', checkOutTime: '11:00', allowLateCheckout: false },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=2080',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&q=80&w=2070'
    ],
    location: 'Lekki Phase 1, Lagos',
    status: ListingStatus.LIVE,
    tags: ['apartment', 'minimalist', 'lifestyle'],
    requiresIdentityVerification: true,
    availability: {
      [today]: [9, 10, 11, 12, 13, 14, 15, 16, 17],
      [tomorrow]: [9, 10, 11, 12, 13, 14, 15, 16, 17]
    },
    settings: {
      allowRecurring: true,
      minDuration: 1,
      instantBook: false
    },
    approvalTime: '0-15 mins',
    capacity: 6,
    includedGuests: 4,
    pricePerExtraGuest: 5000,
    cautionFee: 20000,
    amenities: [
      { name: 'Wifi', icon: 'Wifi' },
      { name: 'Kitchen', icon: 'Coffee' },
      { name: 'Air Conditioning', icon: 'Wind' }
    ],
    cancellationPolicy: CancellationPolicy.MODERATE,
    houseRules: ['No parties', 'No smoking'],
    safetyItems: ['Smoke alarm', 'Fire extinguisher']
  },
  {
    id: '5',
    hostId: 'host1',
    title: 'Creative Art Studio - Yaba',
    description: 'An inspiring art studio space in the heart of Yaba. High ceilings, industrial vibes, and plenty of space for messy projects. Ideal for workshops, art classes, and creative brainstorming sessions.',
    type: SpaceType.STUDIO,
    price: 15000,
    priceUnit: BookingType.HOURLY,
    pricingModel: PricingModel.NIGHTLY,
    bookingConfig: { checkInTime: '15:00', checkOutTime: '11:00', allowLateCheckout: false },
    images: [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=2071',
      'https://images.unsplash.com/photo-1520466809213-7b9a56adcd45?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=2080',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=2070'
    ],
    location: 'Yaba, Lagos',
    status: ListingStatus.LIVE,
    tags: ['art', 'studio', 'workshop', 'industrial'],
    requiresIdentityVerification: false,
    availability: {
      [today]: [10, 11, 12, 13, 14, 15, 16],
      [tomorrow]: [10, 11, 12, 13, 14, 15, 16]
    },
    settings: {
      allowRecurring: false,
      minDuration: 2,
      instantBook: false
    },
    approvalTime: '15-30 mins',
    capacity: 20,
    includedGuests: 10,
    pricePerExtraGuest: 1000,
    cautionFee: 5000,
    amenities: [
      { name: 'Wifi', icon: 'Wifi' },
      { name: 'Easels', icon: 'Edit3' },
      { name: 'Sink', icon: 'Droplet' }
    ],
    cancellationPolicy: CancellationPolicy.FLEXIBLE,
    houseRules: ['Clean up after yourself', 'No loud music'],
    safetyItems: ['First aid kit']
  },
  {
    id: '6',
    hostId: 'host3',
    title: 'Executive Co-working Space - Victoria Island',
    description: 'Premium co-working desk in a shared executive office. Access to meeting rooms, high-speed internet, and free coffee. Perfect for freelancers and remote workers looking for a professional environment.',
    type: SpaceType.CO_WORKING,
    price: 10000,
    priceUnit: BookingType.HOURLY,
    pricingModel: PricingModel.DAILY,
    bookingConfig: { accessStartTime: '08:00', accessEndTime: '23:00', overnightAllowed: false },
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069',
      'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=2069',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&q=80&w=2069'
    ],
    location: 'Victoria Island, Lagos',
    status: ListingStatus.LIVE,
    tags: ['coworking', 'office', 'professional'],
    requiresIdentityVerification: true,
    availability: {
      [today]: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
      [tomorrow]: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
    },
    settings: {
      allowRecurring: true,
      minDuration: 4,
      instantBook: false
    },
    approvalTime: '30-60 mins',
    capacity: 1,
    includedGuests: 1,
    pricePerExtraGuest: 0,
    cautionFee: 0,
    amenities: [
      { name: 'High-Speed Wifi', icon: 'Wifi' },
      { name: 'Coffee Machine', icon: 'Coffee' },
      { name: 'Printer', icon: 'Printer' }
    ],
    cancellationPolicy: CancellationPolicy.FLEXIBLE,
    houseRules: ['Quiet zone', 'No calls in open area'],
    safetyItems: ['Security', 'Fire extinguisher']
  },
  {
    id: '7',
    hostId: 'host2',
    title: 'Grand Event Hall - Ikeja',
    description: 'Spacious event hall suitable for weddings, conferences, and large gatherings. Features a stage, lighting rig, and ample parking. Catering services available upon request.',
    type: SpaceType.EVENT_CENTER,
    price: 500000,
    priceUnit: BookingType.DAILY,
    pricingModel: PricingModel.DAILY,
    bookingConfig: { accessStartTime: '08:00', accessEndTime: '23:00', overnightAllowed: false },
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=2098',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=2012',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=2069',
      'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&q=80&w=2070'
    ],
    location: 'Ikeja, Lagos',
    status: ListingStatus.LIVE,
    tags: ['event', 'wedding', 'hall', 'large capacity'],
    requiresIdentityVerification: true,
    availability: {
      [today]: [],
      [tomorrow]: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
    },
    settings: {
      allowRecurring: false,
      minDuration: 1,
      instantBook: true
    },
    capacity: 500,
    includedGuests: 200,
    pricePerExtraGuest: 500,
    cautionFee: 100000,
    amenities: [
      { name: 'Stage', icon: 'Layout' },
      { name: 'Sound System', icon: 'Speaker' },
      { name: 'Parking', icon: 'Car' }
    ],
    cancellationPolicy: CancellationPolicy.STRICT,
    houseRules: ['Event must end by midnight', 'No outside alcohol'],
    safetyItems: ['Fire exits', 'Security guards']
  },
  {
    id: '8',
    hostId: 'host4',
    title: 'Sunny Garden Open Space - Ikoyi',
    description: 'Beautiful landscaped garden perfect for outdoor yoga sessions, picnics, and intimate garden parties. Lush greenery and a peaceful atmosphere.',
    type: SpaceType.OPEN_SPACE,
    price: 20000,
    priceUnit: BookingType.HOURLY,
    pricingModel: PricingModel.DAILY,
    bookingConfig: { accessStartTime: '08:00', accessEndTime: '23:00', overnightAllowed: false },
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=2074',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=2232',
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1585229260439-73c31e5e9162?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&q=80&w=2070'
    ],
    location: 'Ikoyi, Lagos',
    status: ListingStatus.LIVE,
    tags: ['garden', 'outdoor', 'nature', 'yoga'],
    requiresIdentityVerification: false,
    availability: {
      [today]: [7, 8, 9, 10, 16, 17, 18],
      [tomorrow]: [7, 8, 9, 10, 16, 17, 18]
    },
    settings: {
      allowRecurring: true,
      minDuration: 1,
      instantBook: false
    },
    approvalTime: '0-15 mins',
    capacity: 30,
    includedGuests: 10,
    pricePerExtraGuest: 1000,
    cautionFee: 10000,
    amenities: [
      { name: 'Restroom Access', icon: 'Home' },
      { name: 'Power Outlet', icon: 'Zap' }
    ],
    cancellationPolicy: CancellationPolicy.MODERATE,
    houseRules: ['No loud noise', 'Clean up trash'],
    safetyItems: ['First aid kit']
  },
  {
    id: '9',
    hostId: 'host3',
    title: 'Tech Hub Conference Room - Yaba',
    description: 'State-of-the-art conference room equipped with video conferencing tools, smart board, and ergonomic chairs. Ideal for tech demos and board meetings.',
    type: SpaceType.CONFERENCE,
    price: 25000,
    priceUnit: BookingType.HOURLY,
    pricingModel: PricingModel.HOURLY,
    bookingConfig: { operatingHours: { start: '09:00', end: '18:00' }, bufferMinutes: 30, minHoursBooking: 1 },
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&q=80&w=2070'
    ],
    location: 'Yaba, Lagos',
    status: ListingStatus.LIVE,
    tags: ['tech', 'conference', 'meeting', 'modern'],
    requiresIdentityVerification: true,
    availability: {
      [today]: [9, 10, 11, 14, 15],
      [tomorrow]: [9, 10, 11, 12, 13, 14, 15, 16]
    },
    settings: {
      allowRecurring: true,
      minDuration: 1,
      instantBook: false
    },
    approvalTime: '15-30 mins',
    capacity: 12,
    includedGuests: 12,
    pricePerExtraGuest: 0,
    cautionFee: 0,
    amenities: [
      { name: 'Video Conf', icon: 'Video' },
      { name: 'Smart Board', icon: 'Monitor' },
      { name: 'Wifi', icon: 'Wifi' }
    ],
    cancellationPolicy: CancellationPolicy.FLEXIBLE,
    houseRules: ['No food inside', 'Keep door closed'],
    safetyItems: ['Smoke alarm']
  },
  {
    id: '10',
    hostId: 'host5',
    title: 'Luxury Penthouse - Eko Atlantic',
    description: 'Exclusive penthouse with breathtaking ocean views. High-end finishes, private pool, and expansive terrace. The ultimate luxury experience for VIP guests.',
    type: SpaceType.APARTMENT,
    price: 250000,
    priceUnit: BookingType.DAILY,
    pricingModel: PricingModel.NIGHTLY,
    bookingConfig: { checkInTime: '15:00', checkOutTime: '11:00', allowLateCheckout: false },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=2080',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=2053',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2074'
    ],
    location: 'Eko Atlantic, Lagos',
    status: ListingStatus.LIVE,
    tags: ['luxury', 'penthouse', 'ocean view', 'pool'],
    requiresIdentityVerification: true,
    availability: {
      [today]: [],
      [tomorrow]: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
    },
    settings: {
      allowRecurring: true,
      minDuration: 2,
      instantBook: true
    },
    capacity: 10,
    includedGuests: 4,
    pricePerExtraGuest: 20000,
    cautionFee: 500000,
    amenities: [
      { name: 'Private Pool', icon: 'Droplet' },
      { name: 'Terrace', icon: 'Sun' },
      { name: 'Concierge', icon: 'User' },
      { name: 'Wifi', icon: 'Wifi' }
    ],
    cancellationPolicy: CancellationPolicy.STRICT,
    houseRules: ['No parties without prior approval', 'No pets'],
    safetyItems: ['Security system', 'Fire extinguisher', 'Smoke alarm']
  },
  {
    id: '11',
    hostId: 'host1',
    title: 'Podcast Recording Studio - Surulere',
    description: 'Professional podcast studio with soundproofing, high-quality microphones, and mixing console. Ready for audio and video recording.',
    type: SpaceType.STUDIO,
    price: 10000,
    priceUnit: BookingType.HOURLY,
    pricingModel: PricingModel.HOURLY,
    bookingConfig: { operatingHours: { start: '09:00', end: '18:00' }, bufferMinutes: 30, minHoursBooking: 2 },
    images: [
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&q=80&w=2070'
    ],
    location: 'Surulere, Lagos',
    status: ListingStatus.LIVE,
    tags: ['podcast', 'audio', 'recording', 'studio'],
    requiresIdentityVerification: false,
    availability: {
      [today]: [10, 11, 12, 14, 15, 16],
      [tomorrow]: [10, 11, 12, 14, 15, 16]
    },
    settings: {
      allowRecurring: true,
      minDuration: 1,
      instantBook: false
    },
    approvalTime: '30-60 mins',
    capacity: 4,
    includedGuests: 4,
    pricePerExtraGuest: 0,
    cautionFee: 5000,
    amenities: [
      { name: 'Microphones', icon: 'Mic' },
      { name: 'Soundproofing', icon: 'VolumeX' },
      { name: 'Wifi', icon: 'Wifi' }
    ],
    cancellationPolicy: CancellationPolicy.FLEXIBLE,
    houseRules: ['No food or drink near equipment'],
    safetyItems: ['Fire extinguisher']
  },
  {
    id: '12',
    hostId: 'host3',
    title: 'Shared Desk in Creative Hub - Maryland',
    description: 'Affordable shared desk in a vibrant creative hub. Great for networking and meeting other creatives. Includes access to communal kitchen and lounge.',
    type: SpaceType.CO_WORKING,
    price: 5000,
    priceUnit: BookingType.HOURLY,
    pricingModel: PricingModel.HOURLY,
    bookingConfig: { operatingHours: { start: '09:00', end: '18:00' }, bufferMinutes: 30, minHoursBooking: 2 },
    images: [
      'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=2069',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069',
      'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=2070'
    ],
    location: 'Maryland, Lagos',
    status: ListingStatus.LIVE,
    tags: ['coworking', 'creative', 'shared', 'affordable'],
    requiresIdentityVerification: true,
    availability: {
      [today]: [9, 10, 11, 12, 13, 14, 15, 16, 17],
      [tomorrow]: [9, 10, 11, 12, 13, 14, 15, 16, 17]
    },
    settings: {
      allowRecurring: true,
      minDuration: 4,
      instantBook: true
    },
    capacity: 1,
    includedGuests: 1,
    pricePerExtraGuest: 0,
    cautionFee: 0,
    amenities: [
      { name: 'Wifi', icon: 'Wifi' },
      { name: 'Kitchen', icon: 'Coffee' },
      { name: 'Lounge', icon: 'Armchair' }
    ],
    cancellationPolicy: CancellationPolicy.FLEXIBLE,
    houseRules: ['Respect others space', 'Clean up after yourself'],
    safetyItems: ['Fire extinguisher']
  },
  {
    id: '13',
    hostId: 'host2',
    title: 'Intimate Garden Venue - Magodo',
    description: 'A cozy and private garden venue for small gatherings, bridal showers, and birthdays. Beautifully landscaped with a gazebo and seating area.',
    type: SpaceType.EVENT_CENTER,
    price: 80000,
    priceUnit: BookingType.DAILY,
    pricingModel: PricingModel.DAILY,
    bookingConfig: { accessStartTime: '08:00', accessEndTime: '23:00', overnightAllowed: false },
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=2074',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=2069',
      'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=2232',
      'https://images.unsplash.com/photo-1585229260439-73c31e5e9162?auto=format&fit=crop&q=80&w=2070'
    ],
    location: 'Magodo, Lagos',
    status: ListingStatus.LIVE,
    tags: ['garden', 'event', 'intimate', 'private'],
    requiresIdentityVerification: true,
    availability: {
      [today]: [],
      [tomorrow]: [10, 11, 12, 13, 14, 15, 16, 17, 18]
    },
    settings: {
      allowRecurring: false,
      minDuration: 1,
      instantBook: false
    },
    approvalTime: '0-15 mins',
    capacity: 50,
    includedGuests: 30,
    pricePerExtraGuest: 500,
    cautionFee: 20000,
    amenities: [
      { name: 'Gazebo', icon: 'Home' },
      { name: 'Seating', icon: 'Layout' },
      { name: 'Restroom', icon: 'Home' }
    ],
    cancellationPolicy: CancellationPolicy.MODERATE,
    houseRules: ['No loud music', 'End by 8pm'],
    safetyItems: ['First aid kit']
  }
];

/**
 * @deprecated Use DEMO_CONFIG.MOCK_USER_ID from '../config/appConfig' instead
 */
export const MOCK_USER_ID = 'user_123';

/**
 * @deprecated Use DEMO_CONFIG.MOCK_HOST_ID from '../config/appConfig' instead
 */
export const MOCK_HOST_ID = 'host_123';
