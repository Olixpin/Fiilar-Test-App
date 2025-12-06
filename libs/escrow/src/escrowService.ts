import { Booking, EscrowTransaction, PlatformFinancials, PricingModel, Listing, NightlyConfig, DailyConfig } from '@fiilar/types';
import { BOOKING_CONFIG } from '@fiilar/storage';
import { safeJSONParse } from '@fiilar/utils';

// Type for the listing info needed for release calculation
interface ListingReleaseInfo {
    pricingModel?: PricingModel;
    bookingConfig?: Listing['bookingConfig'];
}

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
     * Body: { bookingId, guestId, amount, userServiceFee }
     * Response: { success, transactionIds, paystackReference }
     */
    processGuestPayment: async (booking: Booking, guestId: string): Promise<{ success: boolean; transactionIds: string[] }> => {
        console.log('📤 API CALL: POST /api/escrow/payment', {
            bookingId: booking.id,
            guestId,
            amount: booking.totalPrice,
            userServiceFee: booking.userServiceFee,
            hostServiceFee: booking.hostServiceFee,
            cautionFee: booking.cautionFee
        });

        await delay(1000);

        const transactionIds: string[] = [];

        // Single Guest Payment Transaction with full breakdown in metadata
        // This represents ONE payment from the guest that goes to escrow
        // The breakdown shows how the money will be distributed
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
                // Payment breakdown (per PAYMENT_STRUCTURE.md)
                breakdown: {
                    basePrice: booking.basePrice || 0,
                    extraGuestFees: booking.extraGuestFees || 0,
                    subtotal: booking.subtotal || (booking.basePrice || 0) + (booking.extraGuestFees || 0),
                    userServiceFee: booking.userServiceFee || 0,  // 10% of subtotal - goes to platform
                    hostServiceFee: booking.hostServiceFee || 0,  // 3-5% of subtotal - deducted from host payout
                    cautionFee: booking.cautionFee || 0,          // Security deposit - refundable
                    extrasTotal: booking.extrasTotal || 0,        // Add-ons - no platform fee
                    totalPrice: booking.totalPrice,               // What guest paid
                    hostPayout: booking.hostPayout || 0,          // What host will receive
                    platformFee: (booking.userServiceFee || 0) + (booking.hostServiceFee || 0), // Platform revenue
                }
            }
        };
        transactionIds.push(paymentTx.id);

        // Save single transaction
        const existing = await escrowService.getEscrowTransactions();
        localStorage.setItem(STORAGE_KEYS.ESCROW_TRANSACTIONS, JSON.stringify([...existing, paymentTx]));
        
        // Dispatch event for real-time updates
        window.dispatchEvent(new CustomEvent('fiilar:escrow-updated', { detail: { transaction: paymentTx } }));

        console.log('✅ API RESPONSE: Payment processed', {
            success: true,
            transactionIds,
            paystackReference: paymentTx.paystackReference
        });

        return { success: true, transactionIds };
    },

    /**
     * Calculate when funds should be released
     * Release timing varies by pricing model (industry standard):
     * - HOURLY: 24 hours after session ends (short sessions, lower risk)
     * - DAILY: 24 hours after access ends (event spaces, supervised)
     * - NIGHTLY: 48 hours after checkout (overnight stays, higher risk)
     * 
     * Industry Standard End Times:
     * - NIGHTLY: checkOutTime on the checkout day (start + duration nights)
     * - DAILY: accessEndTime on the last booked day
     * - HOURLY: End of the last booked hour
     */
    calculateReleaseDate: (bookingDate: string, bookingHours?: number[], duration?: number, listingInfo?: ListingReleaseInfo): string => {
        const bookingStart = new Date(bookingDate);
        let bookingEnd = new Date(bookingStart);
        const pricingModel = listingInfo?.pricingModel || PricingModel.DAILY;

        if (pricingModel === PricingModel.HOURLY && bookingHours && bookingHours.length > 0) {
            // HOURLY: End of the last booked hour
            const maxHour = Math.max(...bookingHours);
            bookingEnd.setHours(maxHour + 1, 0, 0, 0);
            
        } else if (pricingModel === PricingModel.NIGHTLY) {
            // NIGHTLY: Use checkOutTime from listing config on checkout day
            // Checkout day = start date + duration (nights)
            const config = listingInfo?.bookingConfig as NightlyConfig | undefined;
            const checkOutTime = config?.checkOutTime || '11:00'; // Default 11:00 AM
            const [checkOutHour, checkOutMinute] = checkOutTime.split(':').map(Number);
            
            const days = duration || 1;
            bookingEnd.setDate(bookingStart.getDate() + days);
            bookingEnd.setHours(checkOutHour, checkOutMinute, 0, 0);
            
        } else {
            // DAILY: Use accessEndTime from listing config on the last day
            const config = listingInfo?.bookingConfig as DailyConfig | undefined;
            const accessEndTime = config?.accessEndTime || '23:00'; // Default 11:00 PM
            const [endHour, endMinute] = accessEndTime.split(':').map(Number);
            
            const days = duration || 1;
            bookingEnd.setDate(bookingStart.getDate() + days - 1); // Last day of booking
            bookingEnd.setHours(endHour, endMinute, 0, 0);
        }

        // Get escrow release hours based on pricing model
        const releaseHoursConfig = BOOKING_CONFIG.ESCROW_RELEASE_HOURS;
        let escrowHours: number;
        
        if (typeof releaseHoursConfig === 'number') {
            // Legacy support: single number config
            escrowHours = releaseHoursConfig;
        } else {
            // New config: per pricing model
            switch (pricingModel) {
                case PricingModel.HOURLY:
                    escrowHours = releaseHoursConfig.HOURLY;
                    break;
                case PricingModel.NIGHTLY:
                    escrowHours = releaseHoursConfig.NIGHTLY;
                    break;
                case PricingModel.DAILY:
                default:
                    escrowHours = releaseHoursConfig.DAILY || releaseHoursConfig.DEFAULT;
                    break;
            }
        }

        // Add escrow release period
        const releaseDate = new Date(bookingEnd.getTime() + (escrowHours * 60 * 60 * 1000));
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
        // Use explicit hostPayout field if available, otherwise calculate
        const hostPayout = booking.hostPayout || (booking.totalPrice - booking.userServiceFee - booking.cautionFee);

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

        // Dispatch event for real-time updates
        window.dispatchEvent(new CustomEvent('fiilar:escrow-updated', { 
            detail: { 
                transaction: refundTx,
                action: 'refund'
            } 
        }));

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
        const result = safeJSONParse(txs, []);
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

        // Calculate totals from transactions
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

        // Count pending payouts from bookings
        const pendingPayouts = bookings.filter(b => b.paymentStatus === 'Paid - Escrow').length;

        // Calculate caution fees from active bookings (in escrow, not yet released)
        const activeEscrowBookings = bookings.filter(b => 
            b.paymentStatus === 'Paid - Escrow' && 
            b.status !== 'Cancelled'
        );
        
        const heldCautionFees = activeEscrowBookings.reduce((sum, b) => sum + (b.cautionFee || 0), 0);
        
        // Calculate pending release - bookings that are ready for payout but not yet released
        const pendingReleaseBookings = bookings.filter(b => 
            b.paymentStatus === 'Paid - Escrow' &&
            b.handshakeStatus === 'VERIFIED' &&
            (b.status === 'Completed' || b.status === 'Confirmed')
        );
        const pendingRelease = pendingReleaseBookings.reduce((sum, b) => sum + (b.hostPayout || 0), 0);

        // Calculate held for active bookings (excluding caution fees)
        const heldForBookings = activeEscrowBookings.reduce((sum, b) => {
            const bookingAmount = (b.totalPrice || 0) - (b.cautionFee || 0);
            return sum + bookingAmount;
        }, 0);

        // Calculate revenue breakdown from booking data
        const guestServiceFees = bookings
            .filter(b => b.paymentStatus === 'Paid - Escrow' || b.paymentStatus === 'Released')
            .reduce((sum, b) => sum + (b.userServiceFee || 0), 0);
        
        const hostServiceFees = bookings
            .filter(b => b.paymentStatus === 'Released')
            .reduce((sum, b) => sum + (b.hostServiceFee || 0), 0);

        const financials: PlatformFinancials = {
            totalEscrow,
            totalReleased,
            totalRevenue: totalRevenue || (guestServiceFees + hostServiceFees), // Use transaction total or calculated
            pendingPayouts,
            totalRefunded,
            // Detailed escrow breakdown
            escrow: {
                heldForBookings,
                heldCautionFees,
                pendingRelease,
                totalHeld: heldForBookings + heldCautionFees,
            },
            // Revenue breakdown
            revenue: {
                guestServiceFees,
                hostServiceFees,
                cancellationFees: 0,
                extrasCommission: 0,
                totalGross: guestServiceFees + hostServiceFees,
                processingFees: 0,
                netRevenue: guestServiceFees + hostServiceFees,
            },
            // Payables
            payables: {
                dueToHosts: pendingRelease,
                pendingRefunds: 0,
                cautionFeesToReturn: heldCautionFees,
                totalPayables: pendingRelease + heldCautionFees,
            },
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
            const listings: any[] = safeJSONParse(listingsStr, []);
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
