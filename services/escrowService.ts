import { Booking, EscrowTransaction, EscrowTransactionType, PlatformFinancials } from '../types';

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
     * Production: 24 hours after booking start time
     */
    calculateReleaseDate: (bookingDate: string, bookingHours?: number[]): string => {
        const bookingStart = new Date(bookingDate);

        // If hourly booking, use first hour
        if (bookingHours && bookingHours.length > 0) {
            bookingStart.setHours(bookingHours[0], 0, 0, 0);
        } else {
            // Daily booking, assume check-in at 3 PM
            bookingStart.setHours(15, 0, 0, 0);
        }

        // Add 24 hours
        const releaseDate = new Date(bookingStart.getTime() + (24 * 60 * 60 * 1000));
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
};
