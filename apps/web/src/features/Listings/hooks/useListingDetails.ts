import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing, User, BookingType, Booking } from '@fiilar/types';
import { getBookings, toggleFavorite, saveBooking, deleteBooking, getAllUsers, trackListingView, trackFavorite, getBookingDraft, saveBookingDraft, deleteBookingDraft, formatDraftAge, BookingDraft } from '@fiilar/storage';
import { startConversation } from '@fiilar/messaging';
import { addNotification } from '@fiilar/notifications';
import { paymentService } from '@fiilar/escrow';
import { SERVICE_FEE_PERCENTAGE } from '@fiilar/storage';
import { useToast } from '@fiilar/ui';

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
    const toast = useToast();

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

    // Booking Draft Restore State
    const [draftRestoreDialog, setDraftRestoreDialog] = useState<{
        isOpen: boolean;
        draft: BookingDraft | null;
    }>({ isOpen: false, draft: null });
    const draftCheckedRef = useRef(false);

    useEffect(() => {
        if (user && user.favorites && user.favorites.includes(listing.id)) {
            setIsFavorite(true);
        } else {
            setIsFavorite(false);
        }
    }, [user, listing.id]);

    // Check for existing booking draft on mount
    useEffect(() => {
        if (user && !draftCheckedRef.current) {
            draftCheckedRef.current = true;
            const existingDraft = getBookingDraft(user.id, listing.id);
            if (existingDraft) {
                setDraftRestoreDialog({ isOpen: true, draft: existingDraft });
            }
        }
    }, [user, listing.id]);

    // Track listing view on mount
    useEffect(() => {
        trackListingView(listing.id, user?.id);
    }, [listing.id, user?.id]);

    const handleToggleFavorite = () => {
        if (!user) {
            onLogin();
            return;
        }
        const newFavs = toggleFavorite(user.id, listing.id);
        const nowFavorite = newFavs.includes(listing.id);
        setIsFavorite(nowFavorite);

        // Track favorite/unfavorite for analytics
        trackFavorite(listing.id, user.id, nowFavorite);

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

        // Filter out current user's Reserved bookings (saved for later) - they shouldn't block availability
        const activeBookings = listingBookings.filter(b => {
            if (b.status === 'Cancelled') return false;
            // User's own Reserved bookings shouldn't block availability for them
            if (b.status === 'Reserved' && user && b.userId === user.id) return false;
            return true;
        });

        // For non-hourly (per-day / nightly) listings, any overlapping booking blocks the day
        if (!isHourly) {
            const isBooked = activeBookings.some(b => {
                if (b.date === dateStr) return true;
                const start = new Date(b.date);
                const check = new Date(dateStr);
                const end = new Date(start);
                end.setDate(start.getDate() + (b.duration || 1));
                return check >= start && check < end;
            });

            if (isBooked) return 'ALREADY_BOOKED';
        } else {
            // For hourly listings we still need a simple day-level signal for the calendar.
            // If *any* active booking exists on this date, we treat the day as booked so
            // users can't start another series on that date from the high-level picker.
            const hasAnyBookingOnDate = activeBookings.some(b => b.date === dateStr);
            if (hasAnyBookingOnDate) {
                return 'ALREADY_BOOKED';
            }

            // Hour-level availability is still enforced separately via isSlotBooked.
        }

        return 'AVAILABLE';
    };

    const isSlotBooked = (date: string, hour: number) => {
        return listingBookings.some(b => {
            if (b.date !== date) return false;
            // User's own Reserved bookings shouldn't show as booked slots
            if (b.status === 'Reserved' && user && b.userId === user.id) return false;
            if (b.hours && b.hours.length > 0) {
                return b.hours.includes(hour);
            }
            return false;
        });
    };

    const hostOpenHours = listing.availability ? (listing.availability[selectedDate] || []) : [];

    // --- Booking Draft Handlers ---
    const handleRestoreBookingDraft = useCallback(() => {
        const draft = draftRestoreDialog.draft;
        if (draft) {
            // Restore all the booking state from the draft
            setSelectedDate(draft.selectedDate);
            setSelectedHours(draft.selectedHours);
            if (draft.selectedDays) setSelectedDays(draft.selectedDays);
            setGuestCount(draft.guestCount);
            setSelectedAddOns(draft.selectedAddOns);
            setIsRecurring(draft.isRecurring);
            setRecurrenceFreq(draft.recurrenceFreq);
            setRecurrenceCount(draft.recurrenceCount);
            setAgreedToTerms(draft.agreedToTerms);

            toast.showToast({ message: 'Your previous booking progress has been restored!', type: 'success' });
        }
        setDraftRestoreDialog({ isOpen: false, draft: null });
    }, [draftRestoreDialog.draft, toast]);

    const handleDiscardBookingDraft = useCallback(() => {
        if (user && draftRestoreDialog.draft) {
            deleteBookingDraft(user.id, listing.id);
        }
        setDraftRestoreDialog({ isOpen: false, draft: null });
    }, [user, listing.id, draftRestoreDialog.draft]);

    // Auto-save booking draft when user makes changes
    const saveBookingDraftData = useCallback(() => {
        if (!user) return;

        // Don't save if booking was already submitted
        if (isBookingSubmitted) return;

        // Check if user already has an active booking for this listing
        const existingActiveBooking = getBookings().find(b =>
            b.userId === user.id &&
            b.listingId === listing.id &&
            (b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'Started')
        );

        // If there's an active booking, don't save draft and clean up any existing draft
        if (existingActiveBooking) {
            deleteBookingDraft(user.id, listing.id);
            return;
        }

        // Only save if user has made some selections beyond defaults
        const hasHourlySelections = isHourly && selectedHours.length > 0;
        const hasDailySelections = !isHourly && selectedDays > 1;
        const hasGuestChanges = guestCount > 1;
        const hasAddOns = selectedAddOns.length > 0;
        const hasRecurring = isRecurring;
        const hasAgreed = agreedToTerms;

        const hasSelections = hasHourlySelections ||
            hasDailySelections ||
            hasGuestChanges ||
            hasAddOns ||
            hasRecurring ||
            hasAgreed;

        if (hasSelections) {
            saveBookingDraft({
                listingId: listing.id,
                userId: user.id,
                selectedDate,
                selectedHours,
                selectedDays,
                guestCount,
                selectedAddOns,
                isRecurring,
                recurrenceFreq,
                recurrenceCount,
                agreedToTerms,
                listingTitle: listing.title,
                listingImage: listing.images?.[0]
            });
        }
    }, [user, listing.id, listing.title, listing.images, selectedDate, selectedHours, selectedDays, guestCount, selectedAddOns, isRecurring, recurrenceFreq, recurrenceCount, agreedToTerms, isHourly, isBookingSubmitted]);

    // Auto-save booking draft when booking state changes (debounced)
    useEffect(() => {
        // Don't save if we haven't checked for existing draft yet or dialog is open
        if (!draftCheckedRef.current || draftRestoreDialog.isOpen) return;

        const timeoutId = setTimeout(() => {
            saveBookingDraftData();
        }, 1000); // Debounce by 1 second

        return () => clearTimeout(timeoutId);
    }, [saveBookingDraftData, draftRestoreDialog.isOpen]);

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

    // Helper to check availability for a multi-night stay starting on a given date
    const checkMultiNightAvailability = (startDateStr: string, nights: number): string => {
        const startDate = new Date(startDateStr);
        for (let n = 0; n < nights; n++) {
            const checkDate = new Date(startDate);
            checkDate.setDate(startDate.getDate() + n);
            const checkDateStr = checkDate.toISOString().split('T')[0];
            const status = checkDateAvailability(checkDateStr);
            if (status !== 'AVAILABLE') {
                return status; // Return first non-available status found
            }
        }
        return 'AVAILABLE';
    };

    const bookingSeries = useMemo(() => {
        // For multi-night bookings, check all nights in the stay
        const nightsToCheck = !isHourly ? selectedDays : 1;
        const series = [{ date: selectedDate, status: checkMultiNightAvailability(selectedDate, nightsToCheck) }];
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
            series.push({ date: dStr, status: checkMultiNightAvailability(dStr, nightsToCheck) });
        }
        return series;
    }, [selectedDate, isRecurring, recurrenceFreq, recurrenceCount, listing.availability, listingBookings, isHourly, selectedDays]);

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
            // On unmount, we rely on the debounced saveBookingDraftData to save drafts
            // We do NOT automatically create Reserved bookings - that should only happen
            // when user explicitly clicks "Save for Later"
            // This prevents duplicate draft entries and confusion
        };
    }, []);

    const handleBookClick = (arg?: any) => {
        const bypassVerification = arg === true;
        if (!user) {
            onLogin();
            return;
        }

        if (!user.emailVerified && !user.phoneVerified) {
            toast.showToast({ message: "Please verify your email address or phone number before booking.", type: "error" });
            return;
        }

        if (user.id === listing.hostId) {
            toast.showToast({ message: "You cannot book your own listing.", type: "info" });
            return;
        }

        if (isHourly && selectedHours.length === 0) {
            toast.showToast({ message: "Please scroll up and select at least one hour to continue.", type: "info" });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const unavailableDate = bookingSeries.find(d => d.status !== 'AVAILABLE');
        if (unavailableDate) {
            toast.showToast({ message: `Unable to book series: ${unavailableDate.date} is unavailable.`, type: "error" });
            return;
        }

        if (isHourly) {
            for (const item of bookingSeries) {
                const dateHours = listing.availability?.[item.date] || [];
                const hostMissingHours = selectedHours.some(h => !dateHours.includes(h));
                if (hostMissingHours) {
                    toast.showToast({ message: `The host is closed during some of your selected hours on ${item.date}.`, type: "info" });
                    return;
                }
                const alreadyBooked = selectedHours.some(h => isSlotBooked(item.date, h));
                if (alreadyBooked) {
                    toast.showToast({ message: `Some hours on ${item.date} are already booked.`, type: "error" });
                    return;
                }
            }
        } else if (selectedDays > 1) {
            // For multi-night bookings, validate all nights in each occurrence
            for (const item of bookingSeries) {
                const startDate = new Date(item.date);
                for (let n = 0; n < selectedDays; n++) {
                    const checkDate = new Date(startDate);
                    checkDate.setDate(startDate.getDate() + n);
                    const checkDateStr = checkDate.toISOString().split('T')[0];
                    const status = checkDateAvailability(checkDateStr);
                    if (status !== 'AVAILABLE') {
                        const nightLabel = n === 0 ? 'check-in date' : `night ${n + 1}`;
                        toast.showToast({ message: `Cannot book ${item.date}: ${nightLabel} (${checkDateStr}) is ${status.toLowerCase().replace(/_/g, ' ')}.`, type: "error" });
                        return;
                    }
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

        // Check if there's already a Reserved booking for this listing
        const existingReserved = getBookings().find(b =>
            b.userId === user.id &&
            b.listingId === listing.id &&
            b.status === 'Reserved'
        );

        const fees = calculateFees();

        if (existingReserved) {
            // Update existing Reserved booking instead of creating new one
            const updatedBooking: Booking = {
                ...existingReserved,
                date: selectedDate,
                duration: isHourly ? selectedHours.length : selectedDays,
                hours: isHourly ? selectedHours : undefined,
                totalPrice: fees.total,
                serviceFee: fees.serviceFee,
                cautionFee: fees.cautionFee,
                guestCount: guestCount,
                selectedAddOns: selectedAddOns
            };
            // Delete old and save updated
            deleteBooking(existingReserved.id);
            saveBooking(updatedBooking);
        } else {
            // Create new Reserved booking
            const reservedBooking: Booking = {
                id: Math.random().toString(36).substr(2, 9),
                listingId: listing.id,
                userId: user.id,
                date: selectedDate,
                duration: isHourly ? selectedHours.length : selectedDays,
                hours: isHourly ? selectedHours : undefined,
                bookingType: listing.priceUnit,
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
        }

        if (!silent) {
            toast.showToast({ message: "Booking saved to Reserve List! You can complete it later from your dashboard.", type: "success" });
        }
    };

    const handleSaveToReserveList = () => {
        if (!user) {
            onLogin();
            return;
        }
        if (isHourly && selectedHours.length === 0) {
            toast.showToast({ message: "Please scroll up and select at least one hour to continue.", type: "info" });
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
                // Also delete any localStorage draft when removing from Reserve List
                deleteBookingDraft(user.id, listing.id);
                setIsSavedForLater(false);
            }
        } else {
            saveDraftBooking(false);
            // Delete the localStorage draft since we're now saving to Reserve List (actual booking)
            deleteBookingDraft(user.id, listing.id);
            setIsSavedForLater(true);
        }
    };

    const handleContactHost = () => {
        if (!user) {
            onLogin();
            return;
        }

        if (user.id === listing.hostId) {
            toast.showToast({ message: "You cannot chat with yourself.", type: "info" });
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

            // Only show success and send notifications if bookings were actually created
            if (bookings.length === 0) {
                toast.showToast({ message: "Booking creation failed. Please try again.", type: "error" });
                setIsBookingSubmitted(false);
                return;
            }

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

                // Clear the booking draft after successful booking
                deleteBookingDraft(user.id, listing.id);

                // Also remove any Reserved booking for this listing since we now have a real booking
                const reservedBooking = getBookings().find(b =>
                    b.userId === user.id &&
                    b.listingId === listing.id &&
                    b.status === 'Reserved'
                );
                if (reservedBooking) {
                    deleteBooking(reservedBooking.id);
                }
            }
            setShowConfirmModal(false);
            setShowVerificationModal(false);
        } catch (error: any) {
            toast.showToast({ message: `Payment Failed: ${error.message}`, type: "error" });
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
            toast.showToast({ message: 'Verification failed. Please try again.', type: "error" });
        }
    };

    const handleShare = () => {
        setIsShareModalOpen(true);
    };

    // Check if the current user has an active (confirmed/started/reserved) booking for this listing
    const hasActiveBooking = useMemo(() => {
        if (!user) return false;
        return listingBookings.some(
            b => b.userId === user.id && 
            (b.status === 'Confirmed' || b.status === 'Started' || b.status === 'Reserved')
        );
    }, [user, listingBookings]);

    return {
        host,
        hasActiveBooking,
        paymentMethod, setPaymentMethod,
        walletBalance, setWalletBalance,
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
        handleShare,
        // Booking Draft
        draftRestoreDialog,
        handleRestoreBookingDraft,
        handleDiscardBookingDraft,
        formatDraftAge
    };
};
