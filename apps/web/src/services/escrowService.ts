import { Booking, EscrowTransaction, PlatformFinancials } from '@fiilar/types';

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
 */
export const escrowService = {

    /**
     * Process guest payment when booking is created
     * Creates transaction records for payment and service fee
     */
    processGuestPayment: async (booking: Booking, guestId: string): Promise<{ success: boolean; transactionIds: string[] }> => {
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

        // Add 48 hours cooling off period
        const releaseDate = new Date(bookingEnd.getTime() + (48 * 60 * 60 * 1000));
        return releaseDate.toISOString();
    },

    /**
     * Release funds from escrow to host
     * Creates payout transaction
     */
    releaseFundsToHost: async (booking: Booking, hostId: string): Promise<{ success: boolean; transactionId: string }> => {
        await delay(1500);

        // Calculate host payout (total - service fee - caution fee)
        const hostPayout = booking.totalPrice - booking.serviceFee - booking.cautionFee;

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
            }
        };

        const existing = await escrowService.getEscrowTransactions();
        localStorage.setItem(STORAGE_KEYS.ESCROW_TRANSACTIONS, JSON.stringify([...existing, payoutTx]));

        return { success: true, transactionId: payoutTx.id };
    },

    /**
     * Process refund when booking is cancelled
     */
    processRefund: async (booking: Booking, guestId: string, refundAmount: number): Promise<{ success: boolean; transactionId: string }> => {
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
            }
        };

        const existing = await escrowService.getEscrowTransactions();
        localStorage.setItem(STORAGE_KEYS.ESCROW_TRANSACTIONS, JSON.stringify([...existing, refundTx]));

        return { success: true, transactionId: refundTx.id };
    },

    /**
     * Get all escrow transactions
     */
    getEscrowTransactions: async (): Promise<EscrowTransaction[]> => {
        await delay(300);
        const txs = localStorage.getItem(STORAGE_KEYS.ESCROW_TRANSACTIONS);
        return txs ? JSON.parse(txs) : [];
    },

    /**
     * Get platform financial overview
     * Calculates totals from all transactions
     */
    getPlatformFinancials: async (bookings: Booking[]): Promise<PlatformFinancials> => {
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

        return {
            totalEscrow,
            totalReleased,
            totalRevenue,
            pendingPayouts,
            totalRefunded,
        };
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
     */
    resolveDispute: async (booking: Booking, decision: 'REFUND_GUEST' | 'RELEASE_TO_HOST', adminNotes: string): Promise<{ success: boolean }> => {
        await delay(1000);

        if (decision === 'REFUND_GUEST') {
            // Process full refund
            await escrowService.processRefund(booking, booking.userId, booking.totalPrice);
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
                await escrowService.releaseFundsToHost(booking, listing.hostId);
            } else {
                console.error('Listing not found for booking', booking.id);
                return { success: false };
            }
        }

        return { success: true };
    },
};
