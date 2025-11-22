
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

export enum ListingStatus {
  DRAFT = 'Draft',
  PENDING_KYC = 'Pending KYC',
  PENDING_APPROVAL = 'Pending Approval',
  LIVE = 'Live',
  REJECTED = 'Rejected'
}

export enum CancellationPolicy {
  FLEXIBLE = 'Flexible', // Full refund 24h prior
  MODERATE = 'Moderate', // Full refund 5 days prior
  STRICT = 'Strict'      // No refund
}

export type View = 'home' | 'browse' | 'login' | 'login-host' | 'dashboard-host' | 'dashboard-user' | 'dashboard-admin' | 'kyc-upload' | 'listing-details';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  kycVerified: boolean;
  identityDocument?: string; // Renamed from proofOfAddress to be distinct
  avatar?: string;
  walletBalance: number;
  bankDetails?: BankDetails;
  favorites?: string[]; // List of Listing IDs
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
  location: string;
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

  // New: Policies & Safety
  cancellationPolicy?: CancellationPolicy;
  houseRules?: string[];
  safetyItems?: string[];
}

export interface Booking {
  id: string;
  listingId: string;
  userId: string;
  date: string;
  duration: number; // hours or days
  hours?: number[]; // Specific hours booked (e.g. [9, 10]) for collision detection

  // Financials
  totalPrice: number; // The final amount paid
  serviceFee: number; // Platform fee
  cautionFee: number; // Security deposit included in total

  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Reserved';
  groupId?: string; // ID to group recurring bookings together
  guestCount?: number; // Number of guests for this booking
  selectedAddOns?: string[]; // IDs of selected add-ons
  paymentStatus?: 'Paid - Escrow' | 'Released' | 'Refunded';
  escrowReleaseDate?: string; // ISO string - when funds will be released
  transactionIds?: string[]; // Link to all related transactions
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
  participants: string[]; // [userId, hostId]
  listingId?: string;
  lastMessage?: Message;
  updatedAt: string; // ISO string for sorting
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
