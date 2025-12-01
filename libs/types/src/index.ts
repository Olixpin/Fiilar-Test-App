
export enum Role {
  GUEST = 'GUEST',
  USER = 'USER',
  HOST = 'HOST',
  ADMIN = 'ADMIN'
}

export enum SpaceType {
  APARTMENT = 'Apartment',
  STUDIO = 'Studio',
  CONFERENCE = 'Conference Room',
  EVENT_CENTER = 'Event Center',
  CO_WORKING = 'Co-working Space',
  OPEN_SPACE = 'Open Space'
}

export enum BookingType {
  HOURLY = 'Hourly',
  DAILY = 'Daily'
}

// NEW: Three-model pricing system
export enum PricingModel {
  NIGHTLY = 'NIGHTLY',  // Overnight stays (Airbnb-style)
  DAILY = 'DAILY',      // Full-day events (Wedding halls, venues)
  HOURLY = 'HOURLY'     // By-the-hour (Studios, meeting rooms)
}

// Booking config types for each model
export interface NightlyConfig {
  checkInTime: string;      // "15:00" (3:00 PM)
  checkOutTime: string;     // "11:00" (11:00 AM)
  allowLateCheckout?: boolean;
}

export interface DailyConfig {
  accessStartTime: string;  // "08:00" (8:00 AM)
  accessEndTime: string;    // "23:00" (11:00 PM)
  overnightAllowed: boolean;
}

export interface HourlyConfig {
  operatingHours: {
    start: string;          // "09:00"
    end: string;            // "18:00"
  };
  bufferMinutes: number;    // 30
  minHoursBooking: number;  // 2
}

export type BookingConfig = NightlyConfig | DailyConfig | HourlyConfig;


export enum ListingStatus {
  DRAFT = 'Draft',
  PENDING_KYC = 'Pending KYC',
  PENDING_APPROVAL = 'Pending Approval',
  LIVE = 'Live',
  REJECTED = 'Rejected',
  DELETED = 'Deleted'
}

export enum CancellationPolicy {
  FLEXIBLE = 'Flexible', // Full refund 24h prior
  MODERATE = 'Moderate', // Full refund 5 days prior
  STRICT = 'Strict',      // No refund
  NON_REFUNDABLE = 'Non-refundable' // No refunds allowed
}

export type View = 'home' | 'browse' | 'login' | 'login-host' | 'dashboard-host' | 'dashboard-user' | 'dashboard-admin' | 'kyc-upload' | 'listing-details';

export type KYCStatus = 'pending' | 'verified' | 'rejected' | 'none';

export interface User {
  id: string;

  // Name fields (NEW: split into first/last)
  firstName?: string;      // Required for dashboard access
  lastName?: string;       // Required for dashboard access
  name: string;            // DEPRECATED: Keep for backward compatibility

  email: string;
  password?: string;
  role: Role;
  isHost: boolean;
  createdAt: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  walletBalance: number;
  emailVerified: boolean;
  phoneVerified?: boolean;
  authProvider?: 'email' | 'google' | 'phone';
  verificationToken?: string;
  verificationTokenExpiry?: string;
  verificationOtp?: string; // 6-digit code
  verificationOtpExpiry?: string;
  kycVerified?: boolean;
  kycStatus?: KYCStatus;
  kycDocument?: string;
  livenessVerified?: boolean; // New: Liveness check status
  badgeStatus?: 'standard' | 'super_host' | 'premium'; // Admin-assigned host badge
  identityDocument?: string;
  bankDetails?: BankDetails;
  favorites?: string[]; // List of Listing IDs
  rating?: number;
  reviewCount?: number;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  subaccountCode?: string; // Paystack Subaccount Code
  isVerified: boolean;
}

export interface ListingSettings {
  allowRecurring: boolean;
  minDuration: number; // in hours or days
  instantBook: boolean;
}

export interface ListingAddOn {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
}

export interface Amenity {
  name: string;
  icon: string;
}

export interface Listing {
  id: string;
  hostId: string;
  title: string;
  description: string;
  type: SpaceType;
  price: number;
  priceUnit: BookingType;
  images: string[];
  location: string; // Public (e.g. "Lekki Phase 1")
  address?: string; // Private (e.g. "123 Admiralty Way")
  coordinates?: {
    lat: number;
    lng: number;
  };
  status: ListingStatus;
  tags: string[];
  availability?: Record<string, number[]>; // Format: "YYYY-MM-DD": [9, 10, 11] (hours)
  requiresIdentityVerification?: boolean; // New flag for host preference
  proofOfAddress?: string; // URL for listing specific verification (Utility Bill)
  rejectionReason?: string; // Reason if rejected by admin
  settings?: ListingSettings; // New configuration object

  // Capacity & Pricing Fields
  capacity?: number;
  includedGuests?: number; // How many guests are covered by the base price
  pricePerExtraGuest?: number; // Cost per guest above includedGuests
  cautionFee?: number; // Refundable security deposit

  // New: Optional Extras
  addOns?: ListingAddOn[];
  amenities?: Amenity[];

  // New: Policies & Safety
  cancellationPolicy?: CancellationPolicy;
  houseRules?: string[];
  safetyItems?: string[];
  approvalTime?: string; // e.g. "0-15 mins", "1-2 hours"

  // NEW: Pricing Model System (Phase 1: Optional for migration)
  pricingModel?: PricingModel;  // NIGHTLY, DAILY, or HOURLY
  bookingConfig?: BookingConfig; // Model-specific configuration

  // NEW: Booking Settings
  bookingWindow?: number;  // How far ahead guests can book (days: 30, 90, 180, 365)
  minNotice?: number;      // Minimum notice required (days: 0, 1, 2, 3, 7)
  prepTime?: number;       // Time between bookings for prep (days: 0, 1, 2)

  // Ratings
  rating?: number;
  reviewCount?: number;

  // Analytics & Trending
  viewCount?: number;         // Total page views
  bookingCount?: number;      // Total confirmed bookings
  favoriteCount?: number;     // How many users favorited this
  trendingScore?: number;     // Calculated trending score (updated periodically)
  lastBookedAt?: string;      // ISO timestamp of last booking

  // Physical Attributes
  bedrooms?: number;
  bathrooms?: number;
  size?: number; // in sq meters or sq ft

  // Access & Instructions
  accessInfo?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  listingId: string;
  userId: string;
  date: string;
  duration: number; // hours or days
  hours?: number[]; // Specific hours booked (e.g. [9, 10]) for collision detection
  bookingType: BookingType; // HOURLY or DAILY - determines pricing model

  // Financials
  totalPrice: number; // The final amount paid
  serviceFee: number; // Platform fee
  cautionFee: number; // Security deposit included in total

  status: 'Pending' | 'Confirmed' | 'Started' | 'Completed' | 'Cancelled' | 'Reserved';
  createdAt?: string; // ISO timestamp when booking was created
  groupId?: string; // ID to group recurring bookings together
  guestCount?: number; // Number of guests for this booking
  selectedAddOns?: string[]; // IDs of selected add-ons
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  refundAmount?: number;
  refundProcessed?: boolean;
  paymentStatus?: 'Pending' | 'Held' | 'Released' | 'Refunded' | 'Paid - Escrow';
  escrowReleaseDate?: string; // ISO string - when funds will be released
  transactionIds?: string[]; // Link to all related transactions

  // Security & Handshake Protocol
  guestCode?: string; // Code shown by guest to host
  hostCode?: string; // Code used by host to verify guest (or internal match)
  handshakeStatus?: 'PENDING' | 'VERIFIED' | 'FAILED';
  verifiedAt?: string; // ISO timestamp of successful handshake
  disputeStatus?: 'NONE' | 'OPEN' | 'RESOLVED';
  modificationAllowed?: boolean; // Flag to allow guest to modify booking
}


export interface Wallet {
  balance: number;
  currency: string;
}

export type TransactionType = 'DEPOSIT' | 'PAYMENT' | 'REFUND';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO string
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

// Escrow-specific transaction types
export type EscrowTransactionType = 'GUEST_PAYMENT' | 'HOST_PAYOUT' | 'REFUND' | 'SERVICE_FEE';

export interface EscrowTransaction {
  id: string;
  bookingId: string;
  type: EscrowTransactionType;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paystackReference?: string; // Mock Paystack transaction reference
  timestamp: string; // ISO string
  fromUserId?: string; // Guest for payments
  toUserId?: string; // Host for payouts
  metadata?: {
    listingId?: string;
    listingTitle?: string;
    hostName?: string;
    guestName?: string;
    [key: string]: any;
  };
}

export interface PlatformFinancials {
  totalEscrow: number; // Total funds currently held in escrow
  totalReleased: number; // Total paid out to hosts
  totalRevenue: number; // Total service fees collected
  pendingPayouts: number; // Count of bookings awaiting release
  totalRefunded: number; // Total refunded to guests
}

export type PaymentMethodType = 'CARD' | 'PAYPAL';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  last4: string;
  brand: string; // e.g., 'Visa', 'MasterCard'
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface Recommendation {
  listing: Listing;
  reason: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string; // ISO string
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // Array of user IDs
  listingId?: string; // Optional: if conversation is about a specific listing
  lastMessage?: Message;
  lastMessageTime: string; // ISO string for sorting
  updatedAt: string; // ISO string for sorting (same as lastMessageTime usually)
  unreadCount?: number; // Number of unread messages for current user
}

export interface Review {
  id: string;
  listingId: string;
  userId: string;
  bookingId: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: string; // ISO string
}

export interface Notification {
  id: string;
  userId: string; // Recipient
  type: 'damage_report' | 'complaint' | 'platform_update' | 'booking' | 'message' | 'review';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'urgent';
  read: boolean;
  actionRequired: boolean;
  metadata?: {
    bookingId?: string;
    reportId?: string;
    amount?: number;
    images?: string[];
    link?: string;
    senderId?: string;
  };
  createdAt: string;
  expiresAt?: string;
}

// Analytics Types for Trending System
export interface ListingAnalytics {
  listingId: string;
  viewCount: number;
  bookingCount: number;
  favoriteCount: number;
  conversionRate: number;     // bookings / views
  viewsLast7Days: number;
  bookingsLast7Days: number;
  trendingScore: number;
  lastCalculated: string;     // ISO timestamp
}

export interface AnalyticsEvent {
  id: string;
  type: 'VIEW' | 'BOOKING' | 'FAVORITE' | 'UNFAVORITE' | 'SHARE' | 'INQUIRY';
  listingId: string;
  userId?: string;
  timestamp: string;          // ISO string
  metadata?: Record<string, any>;
}

export interface DamageReport {
  id: string;
  bookingId: string;
  reportedBy: string; // hostId
  reportedTo: string; // userId
  description: string;
  images: string[];
  estimatedCost: number;
  status: 'pending' | 'disputed' | 'resolved' | 'escalated';
  userResponse?: string;
  createdAt: string;
  resolvedAt?: string;
}
