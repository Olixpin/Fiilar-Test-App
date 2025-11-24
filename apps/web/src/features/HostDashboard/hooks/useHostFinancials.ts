import { useState, useEffect, useCallback } from 'react';
import { User, Booking, Listing } from '@fiilar/types';
import { updateBooking, getBookings, saveUser } from '../../../services/storage';
import { escrowService } from '../../../services/escrowService';

export const useHostFinancials = (user: User | null, listings: Listing[]) => {
    const [hostBookings, setHostBookings] = useState<Booking[]>([]);
    const [hostTransactions, setHostTransactions] = useState<any[]>([]);
    const [bankDetails, setBankDetails] = useState({
        bankName: user?.bankDetails?.bankName || '',
        accountNumber: user?.bankDetails?.accountNumber || '',
        accountName: user?.bankDetails?.accountName || '',
        isVerified: user?.bankDetails?.isVerified || false
    });
    const [isVerifyingBank, setIsVerifyingBank] = useState(false);

    const fetchFinancials = useCallback(() => {
        if (!user) {
            setHostBookings([]);
            setHostTransactions([]);
            return;
        }

        const all = getBookings();
        const myListingIds = listings.filter(l => l.hostId === user.id).map(l => l.id);
        setHostBookings(all.filter(b => myListingIds.includes(b.listingId)));

        escrowService.getEscrowTransactions().then(txs => setHostTransactions(txs));
    }, [user, listings]);

    useEffect(() => {
        fetchFinancials();
    }, [fetchFinancials]);

    const handleVerifyBank = () => {
        if (!bankDetails.accountNumber || !bankDetails.bankName) {
            alert("Please enter bank name and account number");
            return;
        }
        setIsVerifyingBank(true);
        // Mock Paystack Resolve Account API
        setTimeout(() => {
            setBankDetails(prev => ({
                ...prev,
                accountName: "MOCK USER NAME",
                isVerified: true
            }));
            setIsVerifyingBank(false);
            alert("Account Verified Successfully!");
        }, 1500);
    };

    const handleSaveBankDetails = () => {
        if (!user) return;

        const updatedUser: User = {
            ...user,
            bankDetails
        };

        saveUser(updatedUser);
        alert("Bank details saved successfully! You can now receive payouts.");
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
