import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing, User, BookingType, Booking } from '@fiilar/types';
import { getBookings, toggleFavorite, saveBooking, deleteBooking, getAllUsers } from '@fiilar/storage';
import { startConversation } from '@fiilar/messaging';
import { addNotification } from '@fiilar/notifications';
import { paymentService } from '@fiilar/escrow';
import { SERVICE_FEE_PERCENTAGE } from '@fiilar/storage';

interface UseListingDetailsProps {
    listing: Listing;
    user: User | null;
    onBook: (dates: string[], duration: number, breakdown: { total: number, service: number, caution: number }, selectedHours?: number[], guestCount?: number, selectedAddOns?: string[]) => Promise<Booking[]>;
    onVerify?: () => void;
    onLogin: () => void;
    onRefreshUser?: () => void;
}

export const useListingDetails = ({ listing, user, onBook, onVerify, onLogin, onRefreshUser }: UseListingDetailsProps) => {
    const host = useMemo(() => getAllUsers().find(u => u.id === listing.hostId), [listing.hostId]);
    const navigate = useNavigate();

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'CARD'>('WALLET');
    const [walletBalance, setWalletBalance] = useState(0);

    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Booking State
    const [selectedHours, setSelectedHours] = useState<number[]>([]);
    const [selectedDays, setSelectedDays] = useState<number>(1);
    const [guestCount, setGuestCount] = useState<number>(1);
    const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

    // Gallery State
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Data State
    const [listingBookings, setListingBookings] = useState<Booking[]>([]);

    // Recurrence State
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceFreq, setRecurrenceFreq] = useState<'DAILY' | 'WEEKLY'>('WEEKLY');
    const [recurrenceCount, setRecurrenceCount] = useState(4);

    // Verification & Confirmation Modals
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifiedLocally, setVerifiedLocally] = useState(false);
    const [isBookingLoading, setIsBookingLoading] = useState(false);
    const [pendingBooking, setPendingBooking] = useState<any>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showMobileBookingModal, setShowMobileBookingModal] = useState(false);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSavedForLater, setIsSavedForLater] = useState(false);

    const [isBookingSubmitted, setIsBookingSubmitted] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    useEffect(() => {
        if (user && user.favorites && user.favorites.includes(listing.id)) {
            setIsFavorite(true);
        } else {
            setIsFavorite(false);
        }
    }, [user, listing.id]);

    const handleToggleFavorite = () => {
        if (!user) {
            onLogin();
            return;
        }
        const newFavs = toggleFavorite(user.id, listing.id);
        setIsFavorite(newFavs.includes(listing.id));
        if (onRefreshUser) {
            onRefreshUser();
        }
    };

    const isHourly = listing.priceUnit === BookingType.HOURLY;

    useEffect(() => {
        const allBookings = getBookings();
        setListingBookings(allBookings.filter(b => b.listingId === listing.id && b.status !== 'Cancelled'));
    }, [listing.id]);

    useEffect(() => {
        if (showConfirmModal) {
            paymentService.getWalletBalance().then(setWalletBalance);
        }
    }, [showConfirmModal]);

    useEffect(() => {
        if (!isHourly && isRecurring && recurrenceFreq === 'DAILY') {
            setRecurrenceFreq('WEEKLY');
        }
    }, [isHourly, isRecurring, recurrenceFreq]);

    useEffect(() => {
        if (user) {
            const allBookings = getBookings();
            const savedBooking = allBookings.find(b =>
                b.listingId === listing.id &&
                b.userId === user.id &&
                b.status === 'Reserved'
            );
            setIsSavedForLater(!!savedBooking);
        }
    }, [user, listing.id]);

    // --- Availability Logic ---
    const checkDateAvailability = (dateStr: string) => {
        const today = new Date().toISOString().split('T')[0];
        if (dateStr < today) return 'PAST';

        let hostHours: number[] = [];
        if (listing.availability) {
            if (!listing.availability[dateStr]) {
                return 'BLOCKED_BY_HOST';
            }
            hostHours = listing.availability[dateStr];
        }

        if (!isHourly) {
            const isBooked = listingBookings.some(b => {
                if (b.status === 'Cancelled') return false;
                if (b.date === dateStr) return true;
                const start = new Date(b.date);
                const check = new Date(dateStr);
                const end = new Date(start);
                end.setDate(start.getDate() + (b.duration || 1));
                return check >= start && check < end;
            });

            if (isBooked) return 'ALREADY_BOOKED';
        } else {
            const dayBookings = listingBookings.filter(b => b.date === dateStr && b.status !== 'Cancelled');
            const bookedHours = dayBookings.reduce((acc, curr) => [...acc, ...(curr.hours || [])], [] as number[]);

            if (hostHours.length > 0) {
                const allSlotsTaken = hostHours.every(h => bookedHours.includes(h));
                if (allSlotsTaken) return 'FULLY_BOOKED';
            }
        }

        return 'AVAILABLE';
    };

    const isSlotBooked = (date: string, hour: number) => {
        return listingBookings.some(b => {
            if (b.date !== date) return false;
            if (b.hours && b.hours.length > 0) {
                return b.hours.includes(hour);
            }
            return false;
        });
    };

    const hostOpenHours = listing.availability ? (listing.availability[selectedDate] || []) : [];

    // --- Handlers ---
    const openGallery = (index: number) => {
        setCurrentImageIndex(index);
        setIsGalleryOpen(true);
    };

    const handleHourToggle = (hour: number) => {
        if (selectedHours.includes(hour)) {
            setSelectedHours(selectedHours.filter(h => h !== hour));
        } else {
            setSelectedHours([...selectedHours, hour].sort((a, b) => a - b));
        }
    };

    const toggleAddOn = (id: string) => {
        if (selectedAddOns.includes(id)) {
            setSelectedAddOns(selectedAddOns.filter(a => a !== id));
        } else {
            setSelectedAddOns([...selectedAddOns, id]);
        }
    };

    const bookingSeries = useMemo(() => {
        const series = [{ date: selectedDate, status: checkDateAvailability(selectedDate) }];
        if (!isRecurring) return series;

        const start = new Date(selectedDate);
        for (let i = 1; i < recurrenceCount; i++) {
            const nextDate = new Date(start);
            if (recurrenceFreq === 'DAILY') {
                nextDate.setDate(start.getDate() + i);
            } else {
                nextDate.setDate(start.getDate() + (i * 7));
            }
            const dStr = nextDate.toISOString().split('T')[0];
            series.push({ date: dStr, status: checkDateAvailability(dStr) });
        }
        return series;
    }, [selectedDate, isRecurring, recurrenceFreq, recurrenceCount, listing.availability, listingBookings]);

    const calculateFees = () => {
        const datesCount = isRecurring ? recurrenceCount : 1;
        let basePrice = listing.price;

        const included = listing.includedGuests || 1;
        const extraCost = listing.pricePerExtraGuest || 0;
        if (guestCount > included && extraCost > 0) {
            const extraGuests = guestCount - included;
            basePrice += (extraGuests * extraCost);
        }

        let rentalCost = 0;
        if (isHourly) {
            rentalCost = selectedHours.length * basePrice;
        } else {
            rentalCost = selectedDays * basePrice;
        }

        let addOnsCost = 0;
        if (listing.addOns) {
            selectedAddOns.forEach(id => {
                const addon = listing.addOns?.find(a => a.id === id);
                if (addon) {
                    addOnsCost += addon.price;
                }
            });
        }

        const subtotal = (rentalCost + addOnsCost) * datesCount;
        const serviceFee = subtotal * SERVICE_FEE_PERCENTAGE;
        const cautionFee = listing.cautionFee || 0;
        const total = subtotal + serviceFee + cautionFee;

        return { subtotal, serviceFee, cautionFee, total };
    };

    const fees = calculateFees();

    const stateRef = useRef({
        user,
        listing,
        selectedDate,
        guestCount,
        selectedAddOns,
        selectedHours,
        selectedDays,
        isHourly: false,
        isBookingSubmitted,
        fees: { total: 0, serviceFee: 0, cautionFee: 0, subtotal: 0 }
    });

    useEffect(() => {
        stateRef.current = {
            user,
            listing,
            selectedDate,
            guestCount,
            selectedAddOns,
            selectedHours,
            selectedDays,
            isHourly,
            isBookingSubmitted,
            fees: calculateFees()
        };
    }, [user, listing, selectedDate, guestCount, selectedAddOns, selectedHours, selectedDays, isHourly, isBookingSubmitted, recurrenceFreq, recurrenceCount, isRecurring]);

    useEffect(() => {
        return () => {
            const current = stateRef.current;
            if (current.user && !current.isBookingSubmitted) {
                const today = new Date().toISOString().split('T')[0];
                const dateChanged = current.selectedDate !== today;
                const guestsChanged = current.guestCount > 1;
                const addonsSelected = current.selectedAddOns.length > 0;
                const hoursSelected = current.isHourly && current.selectedHours.length > 0;
                const daysChanged = !current.isHourly && current.selectedDays > 1;

                const hasInteracted = dateChanged || guestsChanged || addonsSelected || hoursSelected || daysChanged;

                if (hasInteracted) {
                    try {
                        const reservedBooking: Booking = {
                            id: Math.random().toString(36).substr(2, 9),
                            listingId: current.listing.id,
                            userId: current.user.id,
                            date: current.selectedDate,
                            duration: current.isHourly ? current.selectedHours.length : current.selectedDays,
                            hours: current.isHourly ? current.selectedHours : undefined,
                            totalPrice: current.fees.total,
                            serviceFee: current.fees.serviceFee,
                            cautionFee: current.fees.cautionFee,
                            status: 'Reserved',
                            createdAt: new Date().toISOString(),
                            guestCount: current.guestCount,
                            selectedAddOns: current.selectedAddOns,
                            paymentStatus: undefined
                        };
                        saveBooking(reservedBooking);
                        console.log('Auto-saved draft on unmount');
                    } catch (error) {
                        console.error('Failed to auto-save draft on unmount:', error);
                    }
                }
            }
        };
    }, []);

    const handleBookClick = (arg?: any) => {
        const bypassVerification = arg === true;
        if (!user) {
            onLogin();
            return;
        }

        if (!user.emailVerified && !user.phoneVerified) {
            alert("Please verify your email address or phone number before booking.");
            return;
        }

        if (isHourly && selectedHours.length === 0) {
            alert("Please scroll up and select at least one hour to continue.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const unavailableDate = bookingSeries.find(d => d.status !== 'AVAILABLE');
        if (unavailableDate) {
            alert(`Unable to book series: ${unavailableDate.date} is unavailable.`);
            return;
        }

        if (isHourly) {
            for (const item of bookingSeries) {
                const dateHours = listing.availability?.[item.date] || [];
                const hostMissingHours = selectedHours.some(h => !dateHours.includes(h));
                if (hostMissingHours) {
                    alert(`The host is closed during some of your selected hours on ${item.date}.`);
                    return;
                }
                const alreadyBooked = selectedHours.some(h => isSlotBooked(item.date, h));
                if (alreadyBooked) {
                    alert(`Some hours on ${item.date} are already booked.`);
                    return;
                }
            }
        }

        const listingRequiresVerification = listing.requiresIdentityVerification;

        if (listingRequiresVerification && !user.kycVerified && !bypassVerification) {
            if (!verifiedLocally) {
                setShowVerificationModal(true);
                return;
            }
        } else {
            setShowVerificationModal(false);
        }

        const fees = calculateFees();
        setPendingBooking({
            dates: bookingSeries.map(s => s.date),
            duration: isHourly ? selectedHours.length : selectedDays,
            fees: fees,
            breakdown: {
                total: fees.total,
                service: fees.serviceFee,
                caution: fees.cautionFee
            },
            hours: isHourly ? selectedHours : undefined,
            guestCount: guestCount,
            selectedAddOns: selectedAddOns
        });
        setShowConfirmModal(true);
        setVerifiedLocally(false);
    };

    const saveDraftBooking = (silent = false) => {
        if (!user) return;
        const fees = calculateFees();
        const reservedBooking: Booking = {
            id: Math.random().toString(36).substr(2, 9),
            listingId: listing.id,
            userId: user.id,
            date: selectedDate,
            duration: isHourly ? selectedHours.length : selectedDays,
            hours: isHourly ? selectedHours : undefined,
            totalPrice: fees.total,
            serviceFee: fees.serviceFee,
            cautionFee: fees.cautionFee,
            status: 'Reserved',
            createdAt: new Date().toISOString(),
            guestCount: guestCount,
            selectedAddOns: selectedAddOns,
            paymentStatus: undefined
        };
        saveBooking(reservedBooking);
        if (!silent) {
            alert("Booking saved to Reserve List! You can complete it later from your dashboard.");
        }
    };

    const handleSaveToReserveList = () => {
        if (!user) {
            onLogin();
            return;
        }
        if (isHourly && selectedHours.length === 0) {
            alert("Please scroll up and select at least one hour to continue.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (isSavedForLater) {
            const allBookings = getBookings();
            const savedBooking = allBookings.find(b =>
                b.listingId === listing.id &&
                b.userId === user.id &&
                b.status === 'Reserved'
            );
            if (savedBooking) {
                deleteBooking(savedBooking.id);
                setIsSavedForLater(false);
            }
        } else {
            saveDraftBooking(false);
            setIsSavedForLater(true);
        }
    };

    const handleContactHost = () => {
        if (!user) {
            onLogin();
            return;
        }
        const conversationId = startConversation(user.id, listing.hostId, listing.id);
        navigate(`/dashboard?tab=messages&conversationId=${conversationId}`);
    };

    const handleConfirmBooking = async () => {
        if (!pendingBooking) return;
        setIsBookingLoading(true);
        try {
            await paymentService.processPayment(
                pendingBooking.fees.total,
                paymentMethod
            );
            setIsBookingSubmitted(true);
            const bookings = await onBook(
                pendingBooking.dates,
                pendingBooking.duration,
                pendingBooking.breakdown,
                pendingBooking.hours,
                pendingBooking.guestCount,
                pendingBooking.selectedAddOns
            );
            setConfirmedBookings(bookings);
            setShowSuccessModal(true);
            if (user) {
                addNotification({
                    userId: user.id,
                    type: 'booking',
                    title: 'Booking Request Sent',
                    message: `Your booking request for "${listing.title}" has been sent to the host`,
                    severity: 'info',
                    read: false,
                    actionRequired: false,
                    metadata: { link: '/dashboard?tab=bookings' }
                });
                addNotification({
                    userId: listing.hostId,
                    type: 'booking',
                    title: 'New Booking Request',
                    message: `${user.name} requested to book "${listing.title}"`,
                    severity: 'warning',
                    read: false,
                    actionRequired: true,
                    metadata: { link: '/dashboard?view=bookings' }
                });
            }
            setShowConfirmModal(false);
            setShowVerificationModal(false);
        } catch (error: any) {
            alert(`Payment Failed: ${error.message}`);
        } finally {
            setIsBookingLoading(false);
        }
    };

    const handleVerificationComplete = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!onVerify) return;
        if (file) {
            setShowVerificationModal(false);
        }
        setIsVerifying(true);
        try {
            await Promise.resolve(onVerify());
            setVerifiedLocally(true);
            setIsVerifying(false);
            handleBookClick(true);
        } catch (err) {
            setIsVerifying(false);
            alert('Verification failed. Please try again.');
        }
    };

    const handleShare = () => {
        setIsShareModalOpen(true);
    };

    return {
        host,
        paymentMethod, setPaymentMethod,
        walletBalance,
        currentMonth, setCurrentMonth,
        selectedDate, setSelectedDate,
        isCalendarOpen, setIsCalendarOpen,
        selectedHours, setSelectedHours,
        selectedDays, setSelectedDays,
        guestCount, setGuestCount,
        selectedAddOns,
        isGalleryOpen, setIsGalleryOpen,
        currentImageIndex, setCurrentImageIndex,
        listingBookings,
        isRecurring, setIsRecurring,
        recurrenceFreq, setRecurrenceFreq,
        recurrenceCount, setRecurrenceCount,
        showVerificationModal, setShowVerificationModal,
        showConfirmModal, setShowConfirmModal,
        isVerifying,
        verifiedLocally,
        isBookingLoading,
        pendingBooking,
        isFavorite,
        showMobileBookingModal, setShowMobileBookingModal,
        showReviewsModal, setShowReviewsModal,
        agreedToTerms, setAgreedToTerms,
        isSavedForLater,
        isBookingSubmitted,
        showSuccessModal, setShowSuccessModal,
        confirmedBookings,
        isShareModalOpen, setIsShareModalOpen,
        handleToggleFavorite,
        isHourly,
        checkDateAvailability,
        isSlotBooked,
        hostOpenHours,
        openGallery,
        handleHourToggle,
        toggleAddOn,
        bookingSeries,
        calculateFees,
        fees,
        handleBookClick,
        handleSaveToReserveList,
        handleContactHost,
        handleConfirmBooking,
        handleVerificationComplete,
        handleShare
    };
};
