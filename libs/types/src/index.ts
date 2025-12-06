
export enum Role {
  GUEST = 'GUEST',
  USER = 'USER',
  HOST = 'HOST',
  ADMIN = 'ADMIN'
}

// Space Type Categories - Fiilar Spaces
export enum SpaceType {
  // Work & Productivity Spaces
  CO_WORKING = 'Co-working Space',
  PRIVATE_OFFICE = 'Private Office',
  MEETING_ROOM = 'Meeting Room',
  TRAINING_ROOM = 'Training Room',
  CONFERENCE = 'Conference Room',  // Legacy - maps to Meeting Room category
  
  // Event & Social Spaces
  EVENT_HALL = 'Event Hall',
  BANQUET_HALL = 'Banquet Hall',
  OUTDOOR_VENUE = 'Outdoor Venue',
  LOUNGE_ROOFTOP = 'Lounge & Rooftop',
  EVENT_CENTER = 'Event Center',  // Legacy - maps to Event Hall
  OPEN_SPACE = 'Open Space',      // Legacy - maps to Outdoor Venue
  
  // Creative & Production Spaces
  PHOTO_STUDIO = 'Photo Studio',
  RECORDING_STUDIO = 'Recording Studio',
  FILM_STUDIO = 'Film Studio',
  STUDIO = 'Studio',              // Legacy - maps to Photo Studio
  
  // Stay & Accommodation
  BOUTIQUE_HOTEL = 'Boutique Hotel',
  SERVICED_APARTMENT = 'Serviced Apartment',
  SHORT_TERM_RENTAL = 'Short-term Rental',
  APARTMENT = 'Apartment',        // Legacy - maps to Serviced Apartment
  
  // Specialty Spaces
  POP_UP_RETAIL = 'Pop-up & Retail Space',
  SHOWROOM = 'Showroom',
  KITCHEN_CULINARY = 'Kitchen & Culinary Space',
  WAREHOUSE = 'Warehouse',
  ART_GALLERY = 'Art Gallery',
  DANCE_STUDIO = 'Dance Studio',
  GYM_FITNESS = 'Gym & Fitness Space',
  PRAYER_MEDITATION = 'Prayer & Meditation Room',
  TECH_HUB = 'Tech Hub & Innovation Lab',
  GAMING_LOUNGE = 'Gaming Lounge',
  CONFERENCE_CENTER = 'Conference Center'
}

// Space Category Groups for UI
export enum SpaceCategory {
  WORK_PRODUCTIVITY = 'Work & Productivity',
  EVENT_SOCIAL = 'Event & Social',
  CREATIVE_PRODUCTION = 'Creative & Production',
  STAY_ACCOMMODATION = 'Stay & Accommodation',
  SPECIALTY = 'Specialty Spaces'
}

// Mapping of SpaceTypes to their parent category
export const SPACE_TYPE_CATEGORIES: Record<SpaceType, SpaceCategory> = {
  // Work & Productivity
  [SpaceType.CO_WORKING]: SpaceCategory.WORK_PRODUCTIVITY,
  [SpaceType.PRIVATE_OFFICE]: SpaceCategory.WORK_PRODUCTIVITY,
  [SpaceType.MEETING_ROOM]: SpaceCategory.WORK_PRODUCTIVITY,
  [SpaceType.TRAINING_ROOM]: SpaceCategory.WORK_PRODUCTIVITY,
  [SpaceType.CONFERENCE]: SpaceCategory.WORK_PRODUCTIVITY,
  
  // Event & Social
  [SpaceType.EVENT_HALL]: SpaceCategory.EVENT_SOCIAL,
  [SpaceType.BANQUET_HALL]: SpaceCategory.EVENT_SOCIAL,
  [SpaceType.OUTDOOR_VENUE]: SpaceCategory.EVENT_SOCIAL,
  [SpaceType.LOUNGE_ROOFTOP]: SpaceCategory.EVENT_SOCIAL,
  [SpaceType.EVENT_CENTER]: SpaceCategory.EVENT_SOCIAL,
  [SpaceType.OPEN_SPACE]: SpaceCategory.EVENT_SOCIAL,
  
  // Creative & Production
  [SpaceType.PHOTO_STUDIO]: SpaceCategory.CREATIVE_PRODUCTION,
  [SpaceType.RECORDING_STUDIO]: SpaceCategory.CREATIVE_PRODUCTION,
  [SpaceType.FILM_STUDIO]: SpaceCategory.CREATIVE_PRODUCTION,
  [SpaceType.STUDIO]: SpaceCategory.CREATIVE_PRODUCTION,
  
  // Stay & Accommodation
  [SpaceType.BOUTIQUE_HOTEL]: SpaceCategory.STAY_ACCOMMODATION,
  [SpaceType.SERVICED_APARTMENT]: SpaceCategory.STAY_ACCOMMODATION,
  [SpaceType.SHORT_TERM_RENTAL]: SpaceCategory.STAY_ACCOMMODATION,
  [SpaceType.APARTMENT]: SpaceCategory.STAY_ACCOMMODATION,
  
  // Specialty
  [SpaceType.POP_UP_RETAIL]: SpaceCategory.SPECIALTY,
  [SpaceType.SHOWROOM]: SpaceCategory.SPECIALTY,
  [SpaceType.KITCHEN_CULINARY]: SpaceCategory.SPECIALTY,
  [SpaceType.WAREHOUSE]: SpaceCategory.SPECIALTY,
  [SpaceType.ART_GALLERY]: SpaceCategory.SPECIALTY,
  [SpaceType.DANCE_STUDIO]: SpaceCategory.SPECIALTY,
  [SpaceType.GYM_FITNESS]: SpaceCategory.SPECIALTY,
  [SpaceType.PRAYER_MEDITATION]: SpaceCategory.SPECIALTY,
  [SpaceType.TECH_HUB]: SpaceCategory.SPECIALTY,
  [SpaceType.GAMING_LOUNGE]: SpaceCategory.SPECIALTY,
  [SpaceType.CONFERENCE_CENTER]: SpaceCategory.SPECIALTY,
};

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

  // Capacity & Pricing Fields (NEW MODEL - v1.1)
  maxGuests?: number;              // Base max guests (all included in base price)
  allowExtraGuests?: boolean;      // Toggle: allow overflow beyond maxGuests?
  extraGuestLimit?: number;        // How many extra guests allowed (max 50% of maxGuests)
  extraGuestFee?: number;          // Price per extra guest
  
  // DEPRECATED - kept for migration compatibility
  capacity?: number;               // Use maxGuests instead
  includedGuests?: number;         // No longer needed - maxGuests = included
  pricePerExtraGuest?: number;     // Use extraGuestFee instead
  
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

  // ============================================
  // FINANCIAL BREAKDOWN (All amounts explicit)
  // ============================================
  
  // Base charges
  basePrice: number;           // Listing price × duration (includes maxGuests)
  extraGuestFees: number;      // extraGuestFee × number of extra guests
  extrasTotal: number;         // Sum of selected add-ons (no platform fee)
  
  // Fees
  userServiceFee: number;      // 10% of (basePrice + extraGuestFees) - charged to guest
  hostServiceFee: number;      // 3-5% of (basePrice + extraGuestFees) - deducted from host
  cautionFee: number;          // Security deposit (fully refundable)
  
  // Totals
  subtotal: number;            // basePrice + extraGuestFees (fee-able amount)
  totalPrice: number;          // What guest pays: subtotal + userServiceFee + cautionFee + extrasTotal
  hostPayout: number;          // What host receives: subtotal - hostServiceFee + extrasTotal
  platformFee: number;         // What platform keeps: userServiceFee + hostServiceFee

  // Guest info
  guestCount?: number;         // Total guests (base + extra)
  extraGuestCount?: number;    // Number of guests beyond maxGuests
  selectedAddOns?: string[];   // IDs of selected add-ons

  // Caution tracking
  cautionStatus?: 'HELD' | 'RELEASED' | 'CLAIMED' | 'PARTIAL_CLAIM';
  cautionReleasedAt?: string;  // ISO timestamp
  cautionClaimAmount?: number; // If partial claim

  status: 'Pending' | 'Confirmed' | 'Started' | 'Completed' | 'Cancelled' | 'Reserved';
  createdAt?: string; // ISO timestamp when booking was created
  groupId?: string; // ID to group recurring bookings together
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

// ============================================================================
// FINANCIAL LEDGER SYSTEM - Enterprise-Grade Double-Entry Bookkeeping
// ============================================================================

/**
 * General Ledger Account Codes (Chart of Accounts)
 * Following standard accounting practices for marketplace platforms
 */
export enum GLAccountCode {
  // ASSETS (1xxx)
  CASH_PAYSTACK = '1001',           // Cash held at Paystack
  ESCROW_HOLDINGS = '1010',         // Funds held in escrow for bookings
  ACCOUNTS_RECEIVABLE = '1020',     // Money owed to platform
  CAUTION_FEE_HOLDINGS = '1030',    // Refundable deposits held
  
  // LIABILITIES (2xxx)
  HOST_PAYABLES = '2001',           // Amount owed to hosts
  GUEST_REFUNDS_PAYABLE = '2010',   // Pending refunds to guests
  CAUTION_FEE_LIABILITY = '2020',   // Obligation to return caution fees
  
  // REVENUE (4xxx)
  GUEST_SERVICE_FEE_REVENUE = '4001',   // 10% guest fee
  HOST_SERVICE_FEE_REVENUE = '4002',    // 5% host fee
  CANCELLATION_FEE_REVENUE = '4010',    // Late cancellation fees retained
  EXTRAS_COMMISSION = '4020',           // Commission on add-ons
  
  // EXPENSES (5xxx)
  PAYMENT_PROCESSING_FEES = '5001',     // Paystack fees (1.5%)
  REFUND_EXPENSES = '5010',             // Costs of processing refunds
  CHARGEBACK_LOSSES = '5020',           // Disputed transactions lost
}

/**
 * Transaction entry types for double-entry bookkeeping
 */
export type LedgerEntryType = 'DEBIT' | 'CREDIT';

/**
 * Transaction categories for reporting and filtering
 */
export enum TransactionCategory {
  BOOKING_PAYMENT = 'BOOKING_PAYMENT',
  SERVICE_FEE = 'SERVICE_FEE',
  HOST_PAYOUT = 'HOST_PAYOUT',
  GUEST_REFUND = 'GUEST_REFUND',
  CAUTION_FEE = 'CAUTION_FEE',
  CAUTION_REFUND = 'CAUTION_REFUND',
  DISPUTE_RESOLUTION = 'DISPUTE_RESOLUTION',
  ADJUSTMENT = 'ADJUSTMENT',
  SETTLEMENT = 'SETTLEMENT',
}

/**
 * Settlement batch status for bank reconciliation
 */
export enum SettlementStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SETTLED = 'SETTLED',
  FAILED = 'FAILED',
  RECONCILED = 'RECONCILED',
}

/**
 * Individual ledger entry (one side of double-entry)
 */
export interface LedgerEntry {
  id: string;
  transactionId: string;           // Links to parent transaction
  accountCode: GLAccountCode;
  entryType: LedgerEntryType;
  amount: number;
  runningBalance?: number;         // Balance after this entry
  timestamp: string;
}

// Legacy escrow transaction type (kept for backward compatibility)
export type EscrowTransactionType = 'GUEST_PAYMENT' | 'HOST_PAYOUT' | 'REFUND' | 'SERVICE_FEE';

/**
 * Enhanced Escrow Transaction with full audit trail
 * Follows Stripe/Square patterns for financial record keeping
 * Note: Many fields are optional for backward compatibility with mock service
 */
export interface EscrowTransaction {
  // Core identification
  id: string;
  bookingId: string;
  type: EscrowTransactionType;
  category?: TransactionCategory;  // Optional for backward compatibility
  
  // Financial data
  amount: number;                   // Gross amount
  netAmount?: number;               // After fees (optional)
  currency?: string;                // ISO currency code (NGN) - optional
  exchangeRate?: number;            // For multi-currency support
  
  // Status tracking
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVERSED' | 'DISPUTED';
  
  // Payment gateway references
  paystackReference?: string;
  paystackTransferId?: string;      // For payouts
  paystackSettlementId?: string;    // For reconciliation
  
  // Double-entry ledger entries (optional for mock service)
  ledgerEntries?: LedgerEntry[];
  
  // Parties involved
  fromUserId?: string;
  fromUserName?: string;
  fromUserEmail?: string;
  toUserId?: string;
  toUserName?: string;
  toUserEmail?: string;
  
  // Timestamps
  timestamp: string;
  processedAt?: string;
  settledAt?: string;
  
  // Audit trail (optional for mock service)
  createdBy?: string;                // User or system that initiated
  createdByType?: 'USER' | 'SYSTEM' | 'ADMIN' | 'SCHEDULER';
  ipAddress?: string;
  userAgent?: string;
  
  // Related transactions
  parentTransactionId?: string;     // For refunds, adjustments
  relatedTransactionIds?: string[]; // Linked transactions
  
  // Settlement batch
  settlementBatchId?: string;
  settlementStatus?: SettlementStatus;
  
  // Detailed breakdown (optional for mock service)
  breakdown?: {
    baseAmount: number;
    guestServiceFee: number;
    hostServiceFee: number;
    cautionFee: number;
    extraGuestFees: number;
    extrasTotal: number;
    processingFee: number;          // Paystack fee
    netToHost: number;
    platformRevenue: number;
  };
  
  // Metadata for flexibility
  metadata?: {
    listingId?: string;
    listingTitle?: string;
    bookingDate?: string;
    bookingDuration?: number;
    guestCount?: number;
    cancellationReason?: string;
    disputeId?: string;
    adminNotes?: string;
    [key: string]: any;
  };
  
  // Reconciliation (optional)
  reconciled?: boolean;
  reconciledAt?: string;
  reconciledBy?: string;
  bankReference?: string;
  
  // Compliance
  taxInvoiceId?: string;
  vatAmount?: number;
}

/**
 * Settlement batch for bank reconciliation
 * Groups transactions settled together
 */
export interface SettlementBatch {
  id: string;
  batchDate: string;
  status: SettlementStatus;
  
  // Totals
  totalTransactions: number;
  grossAmount: number;
  processingFees: number;
  netAmount: number;
  
  // Transaction references
  transactionIds: string[];
  
  // Bank details
  bankReference?: string;
  settledAt?: string;
  
  // Reconciliation
  reconciled: boolean;
  reconciledAt?: string;
  reconciledBy?: string;
  discrepancyAmount?: number;
  discrepancyNotes?: string;
}

/**
 * Enhanced Platform Financials with comprehensive metrics
 * Note: Extended fields are optional for backward compatibility
 */
export interface PlatformFinancials {
  // Summary balances (required - basic fields)
  totalEscrow: number;
  totalReleased: number;
  totalRevenue: number;
  pendingPayouts: number;
  totalRefunded: number;
  
  // Detailed revenue breakdown (optional for backward compatibility)
  revenue?: {
    guestServiceFees: number;
    hostServiceFees: number;
    cancellationFees: number;
    extrasCommission: number;
    totalGross: number;
    processingFees: number;         // Cost
    netRevenue: number;
  };
  
  // Cash flow (optional)
  cashFlow?: {
    inflows: number;                // Guest payments
    outflows: number;               // Host payouts + refunds
    netFlow: number;
    processingCosts: number;
  };
  
  // Escrow details (optional)
  escrow?: {
    heldForBookings: number;
    heldCautionFees: number;
    pendingRelease: number;
    totalHeld: number;
  };
  
  // Payables (optional)
  payables?: {
    dueToHosts: number;
    pendingRefunds: number;
    cautionFeesToReturn: number;
    totalPayables: number;
  };
  
  // Period metrics (optional)
  period?: {
    startDate: string;
    endDate: string;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    disputedBookings: number;
    averageBookingValue: number;
    conversionRate: number;
  };
  
  // Settlement summary (optional)
  settlements?: {
    pendingSettlement: number;
    settledThisPeriod: number;
    reconciledAmount: number;
    unreconciledAmount: number;
  };
}

/**
 * Financial report for export/audit
 */
export interface FinancialReport {
  id: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  generatedBy: string;
  
  // Summary data
  summary: PlatformFinancials;
  
  // Transaction list
  transactions: EscrowTransaction[];
  
  // Export info
  exportFormat?: 'JSON' | 'CSV' | 'PDF' | 'XLSX';
  fileUrl?: string;
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
    reviewId?: string;
    listingId?: string;
    amount?: number;
    images?: string[];
    link?: string;
    senderId?: string;
    guestId?: string;
    transactionId?: string;
    rating?: number;
    reviewerName?: string;
    reviewType?: string;
    reason?: string;
    refunded?: boolean;
    reportedBy?: string;
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
