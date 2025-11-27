import { Booking, EscrowTransaction, PlatformFinancials } from '@fiilar/types';
import { BOOKING_CONFIG } from '@fiilar/storage';

const STORAGE_KEYS = {
    ESCROW_TRANSACTIONS: 'fiilar_escrow_transactions',
};

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate mock Paystack reference
const generatePaystackRef = () => `PAYSTACK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Escrow Service - Handles all financial transactions and escrow management
 * In production, this would integrate with Paystack APIs
 * 
 * API ENDPOINTS (for backend implementation):
 * - POST /api/escrow/payment - Process guest payment
 * - POST /api/escrow/release - Release funds to host
 * - POST /api/escrow/refund - Process refund to guest
 * - GET  /api/escrow/transactions - Get all transactions
 * - GET  /api/escrow/financials - Get platform financial overview
 * - POST /api/escrow/dispute/resolve - Resolve a dispute
 */
export const escrowService = {

    /**
     * Process guest payment when booking is created
     * Creates transaction records for payment and service fee
     * 
     * API: POST /api/escrow/payment
     * Body: { bookingId, guestId, amount, serviceFee }
     * Response: { success, transactionIds, paystackReference }
     */
    processGuestPayment: async (booking: Booking, guestId: string): Promise<{ success: boolean; transactionIds: string[] }> => {
        console.log('📤 API CALL: POST /api/escrow/payment', {
            bookingId: booking.id,
            guestId,
            amount: booking.totalPrice,
            serviceFee: booking.serviceFee,
            cautionFee: booking.cautionFee
        });
        
        await delay(1000);

        const transactions: EscrowTransaction[] = [];
        const transactionIds: string[] = [];

        // 1. Guest Payment Transaction (goes to escrow)
        const paymentTx: EscrowTransaction = {
            id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_payment`,
            bookingId: booking.id,
            type: 'GUEST_PAYMENT',
            amount: booking.totalPrice,
            status: 'COMPLETED',
            paystackReference: generatePaystackRef(),
            timestamp: new Date().toISOString(),
            fromUserId: guestId,
            metadata: {
                listingId: booking.listingId,
                guestCount: booking.guestCount,
            }
        };
        transactions.push(paymentTx);
        transactionIds.push(paymentTx.id);

        // 2. Service Fee Transaction (platform revenue)
        const serviceTx: EscrowTransaction = {
            id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_service`,
            bookingId: booking.id,
            type: 'SERVICE_FEE',
            amount: booking.serviceFee,
            status: 'COMPLETED',
            paystackReference: generatePaystackRef(),
            timestamp: new Date().toISOString(),
            fromUserId: guestId,
            metadata: {
                listingId: booking.listingId,
            }
        };
        transactions.push(serviceTx);
        transactionIds.push(serviceTx.id);

        // Save transactions
        const existing = await escrowService.getEscrowTransactions();
        localStorage.setItem(STORAGE_KEYS.ESCROW_TRANSACTIONS, JSON.stringify([...existing, ...transactions]));

        console.log('✅ API RESPONSE: Payment processed', { 
            success: true, 
            transactionIds,
            paystackReferences: transactions.map(t => t.paystackReference)
        });
        
        return { success: true, transactionIds };
    },

    /**
     * Calculate when funds should be released
     * Production: 48 hours after booking END time
     */
    calculateReleaseDate: (bookingDate: string, bookingHours?: number[], duration?: number): string => {
        const bookingStart = new Date(bookingDate);
        let bookingEnd = new Date(bookingStart);

        // If hourly booking
        if (bookingHours && bookingHours.length > 0) {
            // Find the latest hour to determine end time
            const maxHour = Math.max(...bookingHours);
            // End time is the end of the last hour booked
            bookingEnd.setHours(maxHour + 1, 0, 0, 0);
        } else {
            // Daily booking
            // End time is check-out time (usually next day or after duration)
            // If duration is not provided, default to 1 day
            const days = duration || 1;
            bookingEnd.setDate(bookingStart.getDate() + days);
            // Assume check-out at 11:00 AM
            bookingEnd.setHours(11, 0, 0, 0);
        }

        // Add escrow release period (configurable)
        const releaseDate = new Date(bookingEnd.getTime() + (BOOKING_CONFIG.ESCROW_RELEASE_HOURS * 60 * 60 * 1000));
        return releaseDate.toISOString();
    },

    /**
     * Release funds from escrow to host
     * Creates payout transaction
     * 
     * API: POST /api/escrow/release
     * Body: { bookingId, hostId, amount, notes }
     * Response: { success, transactionId, paystackReference }
     */
    releaseFundsToHost: async (booking: Booking, hostId: string, notes?: string): Promise<{ success: boolean; transactionId: string }> => {
        const hostPayout = booking.totalPrice - booking.serviceFee - booking.cautionFee;
        
        console.log('📤 API CALL: POST /api/escrow/release', {
            bookingId: booking.id,
            hostId,
            amount: hostPayout,
            notes: notes || 'Standard release'
        });
        
        await delay(1500);

        const payoutTx: EscrowTransaction = {
            id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_payout`,
            bookingId: booking.id,
            type: 'HOST_PAYOUT',
            amount: hostPayout,
            status: 'COMPLETED',
            paystackReference: generatePaystackRef(),
            timestamp: new Date().toISOString(),
            toUserId: hostId,
            metadata: {
                listingId: booking.listingId,
                cautionFeeHeld: booking.cautionFee,
                notes: notes || 'Standard release',
            }
        };

        const existing = await escrowService.getEscrowTransactions();
        localStorage.setItem(STORAGE_KEYS.ESCROW_TRANSACTIONS, JSON.stringify([...existing, payoutTx]));

        console.log('✅ API RESPONSE: Funds released to host', {
            success: true,
            transactionId: payoutTx.id,
            hostPayout,
            paystackReference: payoutTx.paystackReference
        });
        
        return { success: true, transactionId: payoutTx.id };
    },

    /**
     * Process refund when booking is cancelled
     * 
     * API: POST /api/escrow/refund
     * Body: { bookingId, guestId, refundAmount, notes }
     * Response: { success, transactionId, paystackReference }
     */
    processRefund: async (booking: Booking, guestId: string, refundAmount: number, notes?: string): Promise<{ success: boolean; transactionId: string }> => {
        console.log('📤 API CALL: POST /api/escrow/refund', {
            bookingId: booking.id,
            guestId,
            refundAmount,
            originalAmount: booking.totalPrice,
            notes: notes || 'Refund'
        });
        
        await delay(1000);

        const refundTx: EscrowTransaction = {
            id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_refund`,
            bookingId: booking.id,
            type: 'REFUND',
            amount: refundAmount,
            status: 'COMPLETED',
            paystackReference: generatePaystackRef(),
            timestamp: new Date().toISOString(),
            toUserId: guestId,
            metadata: {
                listingId: booking.listingId,
                originalAmount: booking.totalPrice,
                notes: notes || 'Refund',
            }
        };

        const existing = await escrowService.getEscrowTransactions();
        localStorage.setItem(STORAGE_KEYS.ESCROW_TRANSACTIONS, JSON.stringify([...existing, refundTx]));

        console.log('✅ API RESPONSE: Refund processed', {
            success: true,
            transactionId: refundTx.id,
            refundAmount,
            paystackReference: refundTx.paystackReference
        });
        
        return { success: true, transactionId: refundTx.id };
    },

    /**
     * Get all escrow transactions
     * 
     * API: GET /api/escrow/transactions
     * Response: EscrowTransaction[]
     */
    getEscrowTransactions: async (): Promise<EscrowTransaction[]> => {
        console.log('📤 API CALL: GET /api/escrow/transactions');
        await delay(300);
        const txs = localStorage.getItem(STORAGE_KEYS.ESCROW_TRANSACTIONS);
        const result = txs ? JSON.parse(txs) : [];
        console.log('✅ API RESPONSE: Retrieved', result.length, 'transactions');
        return result;
    },

    /**
     * Get platform financial overview
     * Calculates totals from all transactions
     * 
     * API: GET /api/escrow/financials
     * Response: PlatformFinancials
     */
    getPlatformFinancials: async (bookings: Booking[]): Promise<PlatformFinancials> => {
        console.log('📤 API CALL: GET /api/escrow/financials');
        await delay(500);
        const transactions = await escrowService.getEscrowTransactions();

        // Calculate totals
        const totalRevenue = transactions
            .filter(tx => tx.type === 'SERVICE_FEE' && tx.status === 'COMPLETED')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const totalReleased = transactions
            .filter(tx => tx.type === 'HOST_PAYOUT' && tx.status === 'COMPLETED')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const totalRefunded = transactions
            .filter(tx => tx.type === 'REFUND' && tx.status === 'COMPLETED')
            .reduce((sum, tx) => sum + tx.amount, 0);

        // Calculate escrow (payments - payouts - refunds)
        const totalPayments = transactions
            .filter(tx => tx.type === 'GUEST_PAYMENT' && tx.status === 'COMPLETED')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const totalEscrow = totalPayments - totalReleased - totalRefunded;

        // Count pending payouts
        const pendingPayouts = bookings.filter(b => b.paymentStatus === 'Paid - Escrow').length;

        const financials = {
            totalEscrow,
            totalReleased,
            totalRevenue,
            pendingPayouts,
            totalRefunded,
        };
        
        console.log('✅ API RESPONSE: Platform financials', financials);
        
        return financials;
    },

    /**
     * Simulate automated release check
     * In production, this would be a cron job/scheduled task
     */
    checkAndReleaseEligibleBookings: async (bookings: Booking[], onRelease: (bookingId: string) => void): Promise<number> => {
        const now = new Date();
        let releasedCount = 0;

        for (const booking of bookings) {
            if (
                booking.paymentStatus === 'Paid - Escrow' &&
                booking.handshakeStatus === 'VERIFIED' &&
                booking.escrowReleaseDate &&
                new Date(booking.escrowReleaseDate) <= now
            ) {
                // Eligible for release
                onRelease(booking.id);
                releasedCount++;
            }
        }

        return releasedCount;
    },
    /**
     * Resolve a dispute
     * Admin intervention to either refund guest or release to host
     * 
     * API: POST /api/escrow/dispute/resolve
     * Body: { bookingId, decision: 'REFUND_GUEST' | 'RELEASE_TO_HOST', adminNotes }
     * Response: { success }
     */
    resolveDispute: async (booking: Booking, decision: 'REFUND_GUEST' | 'RELEASE_TO_HOST', adminNotes: string): Promise<{ success: boolean }> => {
        console.log('📤 API CALL: POST /api/escrow/dispute/resolve', {
            bookingId: booking.id,
            decision,
            adminNotes,
            amount: booking.totalPrice
        });
        
        await delay(1000);

        if (decision === 'REFUND_GUEST') {
            // Process full refund
            await escrowService.processRefund(booking, booking.userId, booking.totalPrice, adminNotes);
        } else {
            // Release funds to host
            // We need the host ID. Booking has listingId, we need to fetch listing to get hostId?
            // Or we can pass it in. But wait, processGuestPayment took guestId.
            // releaseFundsToHost takes hostId.
            // We can assume we have the hostId available or fetch it.
            // For this mock, we'll try to get it from the booking if we had it, but booking only has listingId.
            // In a real app we'd fetch the listing.
            // Let's assume the caller passes the hostId or we fetch it.
            // Actually, releaseFundsToHost needs hostId.
            // Let's fetch the listing from storage to get hostId.
            const listingsStr = localStorage.getItem('fiilar_listings');
            const listings: any[] = listingsStr ? JSON.parse(listingsStr) : [];
            const listing = listings.find(l => l.id === booking.listingId);

            if (listing) {
                await escrowService.releaseFundsToHost(booking, listing.hostId, adminNotes);
            } else {
                console.error('Listing not found for booking', booking.id);
                return { success: false };
            }
        }

        console.log('✅ API RESPONSE: Dispute resolved', { success: true, decision });
        return { success: true };
    },
};
