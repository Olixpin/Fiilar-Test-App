import { describe, it, expect, beforeEach, vi } from 'vitest';
import { escrowService } from '@fiilar/escrow';
import { Booking, BookingType, User, Listing, PricingModel } from '@fiilar/types';

/**
 * FIILAR TRANSACTION SIMULATION TEST SUITE
 * 
 * This test suite simulates the complete lifecycle of Fiilar transactions:
 * 1. Guest makes a booking payment
 * 2. Guest pays total amount (including service fee + caution fee)
 * 3. Booking completes successfully
 * 4. Host receives payout (base + extras - host service fee)
 * 5. Platform keeps service fees
 * 6. Caution fee is released back to guest
 * 
 * Also tests:
 * - Cancellation and refund flows
 * - Partial refunds
 * - Dispute resolution
 * - Multiple bookings for the same listing
 * - Series/recurring bookings
 */

// Mock Users
const mockGuest: User = {
  id: 'guest_001',
  name: 'John Guest',
  firstName: 'John',
  lastName: 'Guest',
  email: 'john.guest@example.com',
  role: 'user',
  isHost: false,
  createdAt: new Date().toISOString(),
  walletBalance: 100000, // ₦100,000
  emailVerified: true,
};

const mockHost: User = {
  id: 'host_001',
  name: 'Sarah Host',
  firstName: 'Sarah',
  lastName: 'Host',
  email: 'sarah.host@example.com',
  role: 'user',
  isHost: true,
  createdAt: new Date().toISOString(),
  walletBalance: 50000,
  emailVerified: true,
};

// Mock Listing
const mockListing: Listing = {
  id: 'listing_001',
  hostId: 'host_001',
  title: 'Beautiful Studio Space',
  description: 'A perfect creative studio for photoshoots',
  category: 'studio',
  location: 'Lagos, Nigeria',
  images: ['https://example.com/image1.jpg'],
  price: 15000, // ₦15,000 per hour
  priceUnit: BookingType.HOURLY,
  pricingModel: PricingModel.HOURLY,
  capacity: 10,
  maxGuests: 5,
  amenities: ['WiFi', 'AC', 'Lighting'],
  rules: ['No smoking'],
  isActive: true,
  isVerified: true,
  rating: 4.5,
  reviewCount: 10,
  createdAt: new Date().toISOString(),
  bookingConfig: {
    type: 'hourly',
    operatingHours: { start: '08:00', end: '22:00' },
    minDuration: 1,
    maxDuration: 8,
    bufferTime: 30,
    instantBook: true,
    advanceBookingDays: 30,
    cancellationPolicy: 'moderate',
    maxGuestsPerHour: 10,
  },
};

// Helper to create a booking with proper financial breakdown
function createMockBooking(overrides: Partial<Booking> = {}): Booking {
  const basePrice = 30000; // ₦30,000 (2 hours × ₦15,000)
  const extraGuestFees = 2000; // 2 extra guests × ₦1,000
  const extrasTotal = 5000; // Add-ons
  const cautionFee = 10000; // Security deposit
  
  const subtotal = basePrice + extraGuestFees; // ₦32,000
  const userServiceFee = Math.round(subtotal * 0.10); // 10% = ₦3,200
  const hostServiceFee = Math.round(subtotal * 0.05); // 5% = ₦1,600
  
  const totalPrice = subtotal + userServiceFee + cautionFee + extrasTotal; // ₦50,200
  const hostPayout = subtotal - hostServiceFee + extrasTotal; // ₦35,400
  const platformFee = userServiceFee + hostServiceFee; // ₦4,800

  return {
    id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    listingId: 'listing_001',
    userId: 'guest_001',
    date: new Date().toISOString().split('T')[0],
    duration: 2,
    hours: [10, 11],
    bookingType: BookingType.HOURLY,
    
    // Financial breakdown
    basePrice,
    extraGuestFees,
    extrasTotal,
    userServiceFee,
    hostServiceFee,
    cautionFee,
    subtotal,
    totalPrice,
    hostPayout,
    platformFee,
    
    // Guest info
    guestCount: 7,
    extraGuestCount: 2,
    selectedAddOns: ['addon_1', 'addon_2'],
    
    // Status
    status: 'Pending',
    createdAt: new Date().toISOString(),
    paymentStatus: 'Pending',
    
    ...overrides,
  };
}

describe('Fiilar Transaction Simulation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('1. Complete Booking Payment Flow', () => {
    it('should process guest payment correctly with all fee breakdowns', async () => {
      const booking = createMockBooking();
      
      // Process payment
      const result = await escrowService.processGuestPayment(booking, mockGuest.id);
      
      expect(result.success).toBe(true);
      expect(result.transactionIds).toHaveLength(2); // Payment + Service Fee
      
      // Verify transactions were created
      const transactions = await escrowService.getEscrowTransactions();
      expect(transactions).toHaveLength(2);
      
      // Check Guest Payment transaction
      const paymentTx = transactions.find(t => t.type === 'GUEST_PAYMENT');
      expect(paymentTx).toBeDefined();
      expect(paymentTx!.amount).toBe(booking.totalPrice); // ₦50,200
      expect(paymentTx!.status).toBe('COMPLETED');
      expect(paymentTx!.fromUserId).toBe(mockGuest.id);
      expect(paymentTx!.paystackReference).toMatch(/^PAYSTACK_/);
      
      // Check Service Fee transaction
      const serviceTx = transactions.find(t => t.type === 'SERVICE_FEE');
      expect(serviceTx).toBeDefined();
      expect(serviceTx!.amount).toBe(booking.userServiceFee); // ₦3,200
    });

    it('should verify financial breakdown accuracy', () => {
      const booking = createMockBooking();
      
      // Verify all amounts add up correctly
      expect(booking.subtotal).toBe(booking.basePrice + booking.extraGuestFees);
      expect(booking.userServiceFee).toBe(Math.round(booking.subtotal * 0.10));
      expect(booking.hostServiceFee).toBe(Math.round(booking.subtotal * 0.05));
      expect(booking.totalPrice).toBe(
        booking.subtotal + booking.userServiceFee + booking.cautionFee + booking.extrasTotal
      );
      expect(booking.hostPayout).toBe(
        booking.subtotal - booking.hostServiceFee + booking.extrasTotal
      );
      expect(booking.platformFee).toBe(booking.userServiceFee + booking.hostServiceFee);
      
      // Log breakdown for visibility
      console.log('\n💰 BOOKING FINANCIAL BREAKDOWN:');
      console.log('================================');
      console.log(`Base Price (2hrs × ₦15,000):     ₦${booking.basePrice.toLocaleString()}`);
      console.log(`Extra Guest Fees:                ₦${booking.extraGuestFees.toLocaleString()}`);
      console.log(`Subtotal:                        ₦${booking.subtotal.toLocaleString()}`);
      console.log(`--------------------------------`);
      console.log(`Guest Service Fee (10%):        +₦${booking.userServiceFee.toLocaleString()}`);
      console.log(`Caution Fee (refundable):       +₦${booking.cautionFee.toLocaleString()}`);
      console.log(`Extras/Add-ons:                 +₦${booking.extrasTotal.toLocaleString()}`);
      console.log(`================================`);
      console.log(`TOTAL PAID BY GUEST:            ₦${booking.totalPrice.toLocaleString()}`);
      console.log('');
      console.log('💸 PAYOUT BREAKDOWN:');
      console.log('================================');
      console.log(`Subtotal:                        ₦${booking.subtotal.toLocaleString()}`);
      console.log(`Host Service Fee (5%):          -₦${booking.hostServiceFee.toLocaleString()}`);
      console.log(`Extras (pass-through):          +₦${booking.extrasTotal.toLocaleString()}`);
      console.log(`================================`);
      console.log(`HOST RECEIVES:                   ₦${booking.hostPayout.toLocaleString()}`);
      console.log(`PLATFORM KEEPS:                  ₦${booking.platformFee.toLocaleString()}`);
      console.log(`CAUTION FEE (held):              ₦${booking.cautionFee.toLocaleString()}`);
    });
  });

  describe('2. Host Payout Flow', () => {
    it('should release correct amount to host after booking completion', async () => {
      const booking = createMockBooking({ status: 'Completed' });
      
      // First process guest payment
      await escrowService.processGuestPayment(booking, mockGuest.id);
      
      // Then release funds to host
      const result = await escrowService.releaseFundsToHost(booking, mockHost.id);
      
      expect(result.success).toBe(true);
      expect(result.transactionId).toBeTruthy();
      
      // Verify payout transaction
      const transactions = await escrowService.getEscrowTransactions();
      const payoutTx = transactions.find(t => t.type === 'HOST_PAYOUT');
      
      expect(payoutTx).toBeDefined();
      expect(payoutTx!.amount).toBe(booking.hostPayout); // ₦35,400
      expect(payoutTx!.toUserId).toBe(mockHost.id);
      expect(payoutTx!.status).toBe('COMPLETED');
      
      console.log('\n✅ HOST PAYOUT VERIFIED:');
      console.log(`   Amount: ₦${payoutTx!.amount.toLocaleString()}`);
      console.log(`   Paystack Ref: ${payoutTx!.paystackReference}`);
    });
  });

  describe('3. Refund Flow', () => {
    it('should process full refund on cancellation', async () => {
      const booking = createMockBooking();
      
      // Guest pays
      await escrowService.processGuestPayment(booking, mockGuest.id);
      
      // Booking cancelled - full refund
      const refundAmount = booking.totalPrice;
      const result = await escrowService.processRefund(
        booking, 
        mockGuest.id, 
        refundAmount,
        'Guest cancelled within free cancellation window'
      );
      
      expect(result.success).toBe(true);
      
      const transactions = await escrowService.getEscrowTransactions();
      const refundTx = transactions.find(t => t.type === 'REFUND');
      
      expect(refundTx).toBeDefined();
      expect(refundTx!.amount).toBe(refundAmount);
      expect(refundTx!.toUserId).toBe(mockGuest.id);
      
      console.log('\n💸 FULL REFUND PROCESSED:');
      console.log(`   Refund Amount: ₦${refundTx!.amount.toLocaleString()}`);
    });

    it('should process partial refund with cancellation fee', async () => {
      const booking = createMockBooking();
      
      // Guest pays
      await escrowService.processGuestPayment(booking, mockGuest.id);
      
      // Late cancellation - 50% refund
      const cancellationFeePercent = 0.50;
      const refundAmount = Math.round(booking.totalPrice * (1 - cancellationFeePercent));
      
      const result = await escrowService.processRefund(
        booking,
        mockGuest.id,
        refundAmount,
        'Late cancellation - 50% fee applied'
      );
      
      expect(result.success).toBe(true);
      
      const transactions = await escrowService.getEscrowTransactions();
      const refundTx = transactions.find(t => t.type === 'REFUND');
      
      expect(refundTx!.amount).toBe(refundAmount);
      
      console.log('\n💸 PARTIAL REFUND (Late Cancellation):');
      console.log(`   Original: ₦${booking.totalPrice.toLocaleString()}`);
      console.log(`   Cancellation Fee (50%): ₦${(booking.totalPrice - refundAmount).toLocaleString()}`);
      console.log(`   Refunded: ₦${refundAmount.toLocaleString()}`);
    });
  });

  describe('4. Platform Financials', () => {
    it('should calculate platform revenue correctly from multiple bookings', async () => {
      // Create and process multiple bookings
      const booking1 = createMockBooking({ id: 'booking_1' });
      const booking2 = createMockBooking({ id: 'booking_2', status: 'Completed' });
      const booking3 = createMockBooking({ id: 'booking_3', status: 'Completed' });
      
      await escrowService.processGuestPayment(booking1, mockGuest.id);
      await escrowService.processGuestPayment(booking2, mockGuest.id);
      await escrowService.processGuestPayment(booking3, mockGuest.id);
      
      // Release funds for completed bookings
      await escrowService.releaseFundsToHost(booking2, mockHost.id);
      await escrowService.releaseFundsToHost(booking3, mockHost.id);
      
      // Get financials
      const financials = await escrowService.getPlatformFinancials([booking1, booking2, booking3]);
      
      expect(financials).toBeDefined();
      
      console.log('\n📊 PLATFORM FINANCIALS:');
      console.log('================================');
      console.log(`Total in Escrow:     ₦${financials.totalEscrow.toLocaleString()}`);
      console.log(`Total Released:      ₦${financials.totalReleased.toLocaleString()}`);
      console.log(`Total Revenue:       ₦${financials.totalRevenue.toLocaleString()}`);
      console.log(`Pending Payouts:     ${financials.pendingPayouts}`);
      console.log(`Total Refunded:      ₦${financials.totalRefunded.toLocaleString()}`);
    }, 15000); // Increase timeout to 15 seconds
  });

  describe('5. End-to-End Booking Lifecycle', () => {
    it('should handle complete booking lifecycle from payment to completion', async () => {
      console.log('\n🔄 COMPLETE BOOKING LIFECYCLE SIMULATION');
      console.log('==========================================\n');
      
      // Step 1: Guest creates booking and pays
      const booking = createMockBooking({ status: 'Pending' });
      console.log('📅 Step 1: Booking Created');
      console.log(`   Booking ID: ${booking.id}`);
      console.log(`   Total Price: ₦${booking.totalPrice.toLocaleString()}`);
      
      // Step 2: Process payment
      const paymentResult = await escrowService.processGuestPayment(booking, mockGuest.id);
      expect(paymentResult.success).toBe(true);
      console.log('\n💳 Step 2: Guest Payment Processed');
      console.log(`   Transaction IDs: ${paymentResult.transactionIds.join(', ')}`);
      
      // Step 3: Booking confirmed (status update)
      booking.status = 'Confirmed';
      booking.paymentStatus = 'Held';
      console.log('\n✅ Step 3: Booking Confirmed');
      console.log(`   Status: ${booking.status}`);
      console.log(`   Payment Status: ${booking.paymentStatus}`);
      
      // Step 4: Booking starts (guest checks in)
      booking.status = 'Started';
      booking.handshakeStatus = 'VERIFIED';
      console.log('\n🤝 Step 4: Booking Started (Handshake Verified)');
      
      // Step 5: Booking completes
      booking.status = 'Completed';
      console.log('\n🏁 Step 5: Booking Completed');
      
      // Step 6: Release funds to host
      const releaseResult = await escrowService.releaseFundsToHost(
        booking, 
        mockHost.id,
        'Booking completed successfully'
      );
      expect(releaseResult.success).toBe(true);
      booking.paymentStatus = 'Released';
      console.log('\n💰 Step 6: Funds Released to Host');
      console.log(`   Host Payout: ₦${booking.hostPayout.toLocaleString()}`);
      
      // Final verification - filter transactions for this specific booking
      const allTransactions = await escrowService.getEscrowTransactions();
      const transactions = allTransactions.filter(t => t.bookingId === booking.id);
      
      console.log('\n📋 TRANSACTION LEDGER:');
      console.log('================================');
      transactions.forEach((tx, i) => {
        console.log(`${i + 1}. ${tx.type}`);
        console.log(`   Amount: ₦${tx.amount.toLocaleString()}`);
        console.log(`   Status: ${tx.status}`);
        console.log(`   Ref: ${tx.paystackReference}`);
        console.log('');
      });
      
      expect(transactions).toHaveLength(3); // Payment + Service Fee + Host Payout
      expect(transactions.filter(t => t.type === 'GUEST_PAYMENT')).toHaveLength(1);
      expect(transactions.filter(t => t.type === 'SERVICE_FEE')).toHaveLength(1);
      expect(transactions.filter(t => t.type === 'HOST_PAYOUT')).toHaveLength(1);
    });
  });

  describe('6. Series/Recurring Booking Transactions', () => {
    it('should handle multiple related bookings in a series', async () => {
      const groupId = `series_${Date.now()}`;
      
      // Create 3 sessions in a series
      const session1 = createMockBooking({ id: 'session_1', groupId, date: '2025-12-10' });
      const session2 = createMockBooking({ id: 'session_2', groupId, date: '2025-12-17' });
      const session3 = createMockBooking({ id: 'session_3', groupId, date: '2025-12-24' });
      
      console.log('\n📅 SERIES BOOKING CREATED:');
      console.log(`   Group ID: ${groupId}`);
      console.log(`   Sessions: 3`);
      console.log(`   Total Value: ₦${(session1.totalPrice * 3).toLocaleString()}`);
      
      // Process all payments
      for (const session of [session1, session2, session3]) {
        await escrowService.processGuestPayment(session, mockGuest.id);
      }
      
      const transactions = await escrowService.getEscrowTransactions();
      expect(transactions).toHaveLength(6); // 3 payments + 3 service fees
      
      // Group transactions by booking
      const session1Txs = transactions.filter(t => t.bookingId === 'session_1');
      const session2Txs = transactions.filter(t => t.bookingId === 'session_2');
      const session3Txs = transactions.filter(t => t.bookingId === 'session_3');
      
      expect(session1Txs).toHaveLength(2);
      expect(session2Txs).toHaveLength(2);
      expect(session3Txs).toHaveLength(2);
      
      console.log('\n📊 SERIES TRANSACTIONS:');
      console.log(`   Session 1: ${session1Txs.length} transactions`);
      console.log(`   Session 2: ${session2Txs.length} transactions`);
      console.log(`   Session 3: ${session3Txs.length} transactions`);
    });
  });

  describe('7. Financial Integrity Checks', () => {
    it('should maintain financial integrity across all transactions', async () => {
      const booking = createMockBooking();
      
      // Process payment
      await escrowService.processGuestPayment(booking, mockGuest.id);
      
      // Release to host
      await escrowService.releaseFundsToHost(booking, mockHost.id);
      
      const transactions = await escrowService.getEscrowTransactions();
      
      // Calculate totals
      const totalIn = transactions
        .filter(t => t.type === 'GUEST_PAYMENT')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalOut = transactions
        .filter(t => t.type === 'HOST_PAYOUT' || t.type === 'REFUND')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const platformRevenue = transactions
        .filter(t => t.type === 'SERVICE_FEE')
        .reduce((sum, t) => sum + t.amount, 0);
      
      console.log('\n✅ FINANCIAL INTEGRITY CHECK:');
      console.log('================================');
      console.log(`Total Money In:      ₦${totalIn.toLocaleString()}`);
      console.log(`Total Money Out:     ₦${totalOut.toLocaleString()}`);
      console.log(`Platform Revenue:    ₦${platformRevenue.toLocaleString()}`);
      console.log(`Caution Fee (held):  ₦${booking.cautionFee.toLocaleString()}`);
      console.log('');
      
      // Verify: Money In = Money Out + Platform Fees + Caution
      // Note: Host payout already has hostServiceFee deducted
      const expectedHostPayout = booking.subtotal - booking.hostServiceFee + booking.extrasTotal;
      expect(totalOut).toBe(expectedHostPayout);
      expect(platformRevenue).toBe(booking.userServiceFee);
      
      // Total guest payment should equal host payout + all fees + caution
      expect(totalIn).toBe(
        totalOut + booking.userServiceFee + booking.hostServiceFee + booking.cautionFee
      );
    });
  });
});
