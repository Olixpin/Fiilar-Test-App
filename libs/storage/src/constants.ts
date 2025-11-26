import { SpaceType, Listing, ListingStatus, BookingType, CancellationPolicy } from '@fiilar/types';

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
};


// Helper to get today's date string
const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export const SERVICE_FEE_PERCENTAGE = 0.10; // 10% Platform Fee

export const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    hostId: 'host1',
    title: 'The White Loft - Daylight Studio',
    description: 'A stunning 1,500 sq ft daylight studio located in the heart of SoHo. Features 14ft ceilings, original hardwood floors, and south-facing windows that flood the space with natural light all day. Perfect for fashion editorials, portraiture, and commercial shoots. Includes a private styling area, hair & makeup station, and high-speed fiber internet.',
    type: SpaceType.STUDIO,
    price: 150,
    priceUnit: BookingType.HOURLY,
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
    requiresIdentityVerification: false, // Allows instant booking
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
  }
];

export const MOCK_USER_ID = 'user_123';
export const MOCK_HOST_ID = 'host_123';
