
import { SpaceType, Listing, ListingStatus, BookingType, CancellationPolicy } from '@fiilar/types';

// Helper to get today's date string
const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export const SERVICE_FEE_PERCENTAGE = 0.10; // 10% Platform Fee

export const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    hostId: 'host1',
    title: 'Minimalist Downtown Studio',
    description: 'Perfect for photo shoots and focused work. High ceilings, natural light.',
    type: SpaceType.STUDIO,
    price: 50,
    priceUnit: BookingType.HOURLY,
    images: [
      'https://picsum.photos/800/600?random=1',
      'https://picsum.photos/800/600?random=2',
      'https://picsum.photos/800/600?random=11',
      'https://picsum.photos/800/600?random=12',
      'https://picsum.photos/800/600?random=13'
    ],
    location: 'Downtown, Metro City',
    status: ListingStatus.LIVE,
    tags: ['photography', 'light', 'quiet'],
    requiresIdentityVerification: false, // Allows instant booking
    availability: {
      [today]: [9, 10, 11, 13, 14, 15],
      [tomorrow]: [9, 10, 11, 12, 13, 14, 15, 16]
    },
    settings: {
      allowRecurring: true,
      minDuration: 1,
      instantBook: true
    },
    capacity: 5,
    includedGuests: 2,
    pricePerExtraGuest: 10,
    cautionFee: 100, // ₦100 Security Deposit
    addOns: [
      { id: 'a1', name: 'Pro Lighting Kit', price: 30, description: '3x Godox Softboxes + Triggers' },
      { id: 'a2', name: 'Backdrop Stand', price: 10 },
      { id: 'a3', name: 'Assistant (1hr)', price: 25 }
    ],
    cancellationPolicy: CancellationPolicy.FLEXIBLE,
    houseRules: ['No smoking', 'No pets', 'Clean up after yourself'],
    safetyItems: ['First aid kit', 'Fire extinguisher']
  },
  {
    id: '2',
    hostId: 'host2',
    title: 'Executive Conference Suite',
    description: 'Glass-walled conference room for up to 12 people. Screen included.',
    type: SpaceType.CONFERENCE,
    price: 120,
    priceUnit: BookingType.HOURLY,
    images: [
      'https://picsum.photos/800/600?random=3',
      'https://picsum.photos/800/600?random=5',
      'https://picsum.photos/800/600?random=6',
      'https://picsum.photos/800/600?random=14',
      'https://picsum.photos/800/600?random=15'
    ],
    location: 'Financial District',
    status: ListingStatus.LIVE,
    tags: ['business', 'meeting', 'screen'],
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
    capacity: 12,
    includedGuests: 12,
    pricePerExtraGuest: 0,
    cautionFee: 0, // No deposit
    addOns: [
      { id: 'b1', name: 'Premium Coffee Service', price: 40, description: 'Unlimited coffee & pastries for team' },
      { id: 'b2', name: '4K Projector', price: 25 }
    ],
    amenities: [
      { name: 'Wifi', icon: 'Wifi' },
      { name: 'Coffee', icon: 'Coffee' },
      { name: 'Video', icon: 'Video' },
      { name: 'Air Conditioning', icon: 'Wind' }
    ],
    cancellationPolicy: CancellationPolicy.MODERATE,
    houseRules: ['No food in conference room', 'Keep noise levels professional'],
    safetyItems: ['Smoke alarm', 'Security cameras']
  },
  {
    id: '3',
    hostId: 'host1',
    title: 'Luxury Penthouse Event Space',
    description: 'Panoramic views for evening events and mixers.',
    type: SpaceType.EVENT_CENTER,
    price: 1500,
    priceUnit: BookingType.DAILY,
    images: [
      'https://picsum.photos/800/600?random=4',
      'https://picsum.photos/800/600?random=7',
      'https://picsum.photos/800/600?random=8',
      'https://picsum.photos/800/600?random=9',
      'https://picsum.photos/800/600?random=10'
    ],
    location: 'Uptown',
    status: ListingStatus.LIVE,
    requiresIdentityVerification: true,
    tags: ['party', 'view', 'luxury'],
    settings: {
      allowRecurring: true,
      minDuration: 1,
      instantBook: false
    },
    capacity: 50,
    includedGuests: 20,
    pricePerExtraGuest: 25,
    cautionFee: 500, // High deposit for luxury space
    addOns: [
      { id: 'c1', name: 'Cleaning Fee', price: 100, description: 'Post-event deep clean' },
      { id: 'c2', name: 'DJ Sound System', price: 200 }
    ],
    cancellationPolicy: CancellationPolicy.STRICT,
    houseRules: ['No loud music after 10pm', 'No glitter or confetti', 'Guests must be approved list'],
    safetyItems: ['Fire suppression system', 'First aid kit', 'Doorman', 'Security cameras']
  }
];

export const MOCK_USER_ID = 'user_123';
export const MOCK_HOST_ID = 'host_123';
