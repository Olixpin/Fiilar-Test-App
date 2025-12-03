import { useState, useEffect, useCallback } from 'react';
import { User, Booking, Listing } from '@fiilar/types';
import { updateBooking, getBookings, saveUser, getUserById } from '@fiilar/storage';
import { escrowService } from '@fiilar/escrow';
import { useToast } from '@fiilar/ui';

export const useHostFinancials = (user: User | null, listings: Listing[], onUserUpdate?: () => void) => {
    const toast = useToast();
    const [hostBookings, setHostBookings] = useState<Booking[]>([]);
    const [hostTransactions, setHostTransactions] = useState<any[]>([]);
    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        accountNumber: '',
        accountName: '',
        isVerified: false
    });
    const [isVerifyingBank, setIsVerifyingBank] = useState(false);

    // Sync bankDetails state when user changes or on mount
    // Also sync when user.bankDetails changes (after save + refreshData)
    useEffect(() => {
        if (user?.id) {
            // Get fresh user data from storage to ensure we have latest bank details
            const freshUser = getUserById(user.id);
            console.log('Loading bank details for user:', user.id, 'Fresh data:', freshUser?.bankDetails);
            if (freshUser?.bankDetails) {
                setBankDetails({
                    bankName: freshUser.bankDetails.bankName || '',
                    accountNumber: freshUser.bankDetails.accountNumber || '',
                    accountName: freshUser.bankDetails.accountName || '',
                    isVerified: freshUser.bankDetails.isVerified || false
                });
            } else if (user.bankDetails) {
                setBankDetails({
                    bankName: user.bankDetails.bankName || '',
                    accountNumber: user.bankDetails.accountNumber || '',
                    accountName: user.bankDetails.accountName || '',
                    isVerified: user.bankDetails.isVerified || false
                });
            } else {
                // Reset if no bank details
                setBankDetails({
                    bankName: '',
                    accountNumber: '',
                    accountName: '',
                    isVerified: false
                });
            }
        }
    }, [user?.id, user?.bankDetails?.accountNumber, user?.bankDetails?.isVerified]);

    const fetchFinancials = useCallback(() => {
        if (!user) {
            setHostBookings([]);
            setHostTransactions([]);
            return;
        }

        const all = getBookings();
        const myListingIds = listings.filter(l => l.hostId === user.id).map(l => l.id);
        setHostBookings(all.filter(b => myListingIds.includes(b.listingId)));

        escrowService.getEscrowTransactions().then((txs: any[]) => setHostTransactions(txs));
    }, [user, listings]);

    useEffect(() => {
        fetchFinancials();
    }, [fetchFinancials]);

    const handleVerifyBank = () => {
        if (!bankDetails.accountNumber || !bankDetails.bankName) {
            toast.showToast({ message: "Please enter bank name and account number", type: "info" });
            return;
        }
        if (!user) return;
        
        setIsVerifyingBank(true);
        // Mock Paystack Resolve Account API
        setTimeout(() => {
            const verifiedBankDetails = {
                ...bankDetails,
                accountName: "MOCK USER NAME", // In production, this comes from Paystack
                isVerified: true
            };
            
            // Update local state
            setBankDetails(verifiedBankDetails);
            
            // Auto-save after successful verification
            const updatedUser: User = {
                ...user,
                bankDetails: verifiedBankDetails
            };
            
            console.log('Auto-saving verified bank details:', verifiedBankDetails);
            const result = saveUser(updatedUser);
            
            setIsVerifyingBank(false);
            
            if (result.success) {
                toast.showToast({ message: "Account verified and saved! You can now receive payouts.", type: "success" });
                // Refresh parent state
                if (onUserUpdate) {
                    onUserUpdate();
                }
            } else {
                toast.showToast({ message: "Account verified but failed to save. Please try again.", type: "error" });
            }
        }, 1500);
    };

    const handleSaveBankDetails = () => {
        if (!user) return;

        const updatedUser: User = {
            ...user,
            bankDetails
        };

        console.log('Saving bank details:', bankDetails);
        const result = saveUser(updatedUser);
        console.log('Save result:', result);
        
        if (result.success) {
            toast.showToast({ message: "Bank details saved successfully! You can now receive payouts.", type: "success" });
            
            // Notify parent component to refresh user state from storage
            if (onUserUpdate) {
                onUserUpdate();
            }
        } else {
            toast.showToast({ message: result.error || "Failed to save bank details", type: "error" });
        }
    };

    const handleUpdateBookingStatus = (bookingId: string, updates: Partial<Booking>) => {
        const booking = hostBookings.find(b => b.id === bookingId);
        if (booking) {
            updateBooking({ ...booking, ...updates });
            fetchFinancials();
        }
    };

    return {
        hostBookings,
        hostTransactions,
        bankDetails,
        setBankDetails,
        isVerifyingBank,
        handleVerifyBank,
        handleSaveBankDetails,
        handleUpdateBookingStatus,
        refreshFinancials: fetchFinancials
    };
};
