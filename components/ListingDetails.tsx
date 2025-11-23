
import React, { useState, useEffect, useMemo } from 'react';
import { Listing, User, BookingType, Booking, CancellationPolicy } from '../types';
import { ArrowLeft, MapPin, Star, Clock, Calendar as CalendarIcon, AlertCircle, User as UserIcon, ShieldCheck, UploadCloud, X, Loader2, UserCheck, Repeat, Info, ChevronLeft, ChevronRight, CheckCircle, Ban, Users, Plus, Minus, PackagePlus, Grid, Share, Heart, FileText, Lock, Wallet, CreditCard, MessageSquare } from 'lucide-react';
import ShareModal from './ShareModal';
import ImmersiveGallery from './ImmersiveGallery';
import { getBookings, toggleFavorite, saveBooking, startConversation, getReviews, getAverageRating, getAllUsers, addNotification } from '../services/storage';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import { SERVICE_FEE_PERCENTAGE } from '../constants';

interface ListingDetailsProps {
  listing: Listing;
  user: User | null;
  onBack: () => void;
  onBook: (dates: string[], duration: number, breakdown: { total: number, service: number, caution: number }, selectedHours?: number[], guestCount?: number, selectedAddOns?: string[]) => void;
  onVerify?: () => void;
  onLogin: () => void;
  onRefreshUser?: () => void;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({ listing, user, onBack, onBook, onVerify, onLogin, onRefreshUser }) => {
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
  // local temporary flag used to avoid re-opening verification modal
  // while parent user prop updates after onVerify() is called
  const [verifiedLocally, setVerifiedLocally] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMobileBookingModal, setShowMobileBookingModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    console.log('ListingDetails user effect:', user?.favorites, listing.id);
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
    console.log('Toggling favorite for:', listing.id);
    const newFavs = toggleFavorite(user.id, listing.id);
    console.log('New favorites:', newFavs);
    setIsFavorite(newFavs.includes(listing.id));
    if (onRefreshUser) {
      console.log('Refreshing user...');
      onRefreshUser();
    }
  };

  const isHourly = listing.priceUnit === BookingType.HOURLY;

  useEffect(() => {
    // Fetch all bookings for this listing to prevent conflicts
    const allBookings = getBookings();
    setListingBookings(allBookings.filter(b => b.listingId === listing.id && b.status !== 'Cancelled'));
  }, [listing.id]);

  useEffect(() => {
    if (showConfirmModal) {
      paymentService.getWalletBalance().then(setWalletBalance);
    }
  }, [showConfirmModal]);

  // Enforce Weekly recurrence for Daily listings
  useEffect(() => {
    if (!isHourly && isRecurring && recurrenceFreq === 'DAILY') {
      setRecurrenceFreq('WEEKLY');
    }
  }, [isHourly, isRecurring, recurrenceFreq]);



  // --- Availability Logic ---

  const checkDateAvailability = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr < today) return 'PAST';

    // 1. Check Host Availability Map
    let hostHours: number[] = [];
    if (listing.availability) {
      if (!listing.availability[dateStr]) {
        return 'BLOCKED_BY_HOST';
      }
      hostHours = listing.availability[dateStr];
    }

    // 2. Check Existing Bookings & Saturation
    if (!isHourly) {
      const isBooked = listingBookings.some(b => {
        if (b.status === 'Cancelled') return false;

        // Check for direct match (fast path)
        if (b.date === dateStr) return true;

        // Check for duration overlap (Multi-night bookings)
        const start = new Date(b.date);
        const check = new Date(dateStr);
        
        // Calculate end date (exclusive)
        // duration is number of nights. If duration is 1, it occupies start date only.
        const end = new Date(start);
        end.setDate(start.getDate() + (b.duration || 1));
        
        // Check if the requested date falls within the booking range
        return check >= start && check < end;
      });

      if (isBooked) return 'ALREADY_BOOKED';
    } else {
      // Hourly Saturation Check
      // Find all bookings for this date
      const dayBookings = listingBookings.filter(b => b.date === dateStr && b.status !== 'Cancelled');
      // Collect all booked hours flat array
      const bookedHours = dayBookings.reduce((acc, curr) => [...acc, ...(curr.hours || [])], [] as number[]);

      // If the host has defined hours, check if ALL of them are booked
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
      return false; // Fallback for daily bookings interfering with hourly (unlikely in this data model but safe)
    });
  };

  // Get available hours for the selected date
  // Filter out hours that the host hasn't opened
  const hostOpenHours = listing.availability ? (listing.availability[selectedDate] || []) : [];

  // --- Calendar Helpers ---

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  // --- Handlers ---

  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
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

  // Generate all dates in the recurrence series
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
      const dStr = formatDate(nextDate);
      series.push({ date: dStr, status: checkDateAvailability(dStr) });
    }
    return series;
  }, [selectedDate, isRecurring, recurrenceFreq, recurrenceCount, listing.availability, listingBookings]);

  const calculateFees = () => {
    const datesCount = isRecurring ? recurrenceCount : 1;

    // 1. Calculate Base Rental Cost
    let basePrice = listing.price;

    // Guest Pricing Logic
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

    // 2. Calculate Add-Ons Cost (Flat fee per booking instance)
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
    const cautionFee = listing.cautionFee || 0; // Flat fee added once to the total check-out

    // Total
    const total = subtotal + serviceFee + cautionFee;

    return { subtotal, serviceFee, cautionFee, total };
  };

  // Initiates the booking flow
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

    // Final Validation
    let errorMsg = "";

    // 1. Check Date Series
    const unavailableDate = bookingSeries.find(d => d.status !== 'AVAILABLE');
    if (unavailableDate) {
      alert(`Unable to book series: ${unavailableDate.date} is unavailable.`);
      return;
    }

    // 2. Check Hourly Conflicts (if hourly)
    if (isHourly) {
      // For each date in the series, check if the selected hours are free
      for (const item of bookingSeries) {
        const dateHours = listing.availability?.[item.date] || [];

        // Check Host Schedule
        const hostMissingHours = selectedHours.some(h => !dateHours.includes(h));
        if (hostMissingHours) {
          alert(`The host is closed during some of your selected hours on ${item.date}.`);
          return;
        }

        // Check Existing Bookings
        const alreadyBooked = selectedHours.some(h => isSlotBooked(item.date, h));
        if (alreadyBooked) {
          alert(`Some hours on ${item.date} are already booked.`);
          return;
        }
      }
    }

    const listingRequiresVerification = listing.requiresIdentityVerification;

    if (listingRequiresVerification && !user.kycVerified && !bypassVerification) {
      // If we just verified locally, allow booking to proceed even if parent prop
      // hasn't updated yet. Otherwise open verification modal.
      if (!verifiedLocally) {
        setShowVerificationModal(true);
        return;
      }
    } else {
      // Ensure modal is closed if we are bypassing or verified
      setShowVerificationModal(false);
    }

    // Prepare Booking Data and Open Confirmation Modal
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

  // Reusable helper to save draft
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
      guestCount: guestCount,
      selectedAddOns: selectedAddOns,
      paymentStatus: undefined
    };

    saveBooking(reservedBooking);

    if (!silent) {
      alert("Booking saved to Reserve List! You can complete it later from your dashboard.");
    } else {
      alert("Booking saved to Reserve List (Drafts)");
    }
  };

  // NEW: Handle "Save for Later" (Reserve List)
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

    saveDraftBooking(false);
  };

  const handleContactHost = () => {
    if (!user) {
      onLogin();
      return;
    }
    const conversationId = startConversation(user.id, listing.hostId, listing.id);
    navigate(`/dashboard?tab=messages&conversationId=${conversationId}`);
  };

  // Finalizes booking after modal confirmation
  const handleConfirmBooking = async () => {
    if (!pendingBooking) return;
    setIsBookingLoading(true);

    try {
      // Process Payment
      await paymentService.processPayment(
        pendingBooking.fees.total,
        paymentMethod
      );

      // If payment successful, proceed with booking
      onBook(
        pendingBooking.dates,
        pendingBooking.duration,
        pendingBooking.breakdown,
        pendingBooking.hours,
        pendingBooking.guestCount,
        pendingBooking.selectedAddOns
      );

      // Notify guest about booking request
      if (user) {
        addNotification({
          userId: user.id,
          type: 'booking',
          title: 'Booking Request Sent',
          message: `Your booking request for "${listing.title}" has been sent to the host`,
          severity: 'info',
          read: false,
          actionRequired: false,
          metadata: {
            link: '/dashboard?tab=bookings'
          }
        });

        // Notify host about new booking request
        addNotification({
          userId: listing.hostId,
          type: 'booking',
          title: 'New Booking Request',
          message: `${user.name} requested to book "${listing.title}"`,
          severity: 'warning',
          read: false,
          actionRequired: true,
          metadata: {
            link: '/dashboard?view=bookings'
          }
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
    // Close the modal immediately when a file is chosen so the UX feels responsive.
    if (file) {
      setShowVerificationModal(false);
    }
    setIsVerifying(true);
    try {
      // Await parent verification. Support both Promise and sync returns.
      await Promise.resolve(onVerify());
      // Mark locally that we've verified so handleBookClick won't re-open the modal
      setVerifiedLocally(true);
      setIsVerifying(false);
      // Proceed with booking flow and bypass verification check since we've just verified
      handleBookClick(true);
    } catch (err) {
      setIsVerifying(false);
      alert('Verification failed. Please try again.');
    }
  };

  const renderCalendar = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-4">
        <button aria-label="Previous month" title="Previous month" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} /></button>
        <span className="text-sm font-bold text-gray-900">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button aria-label="Next month" title="Next month" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d} className="text-[10px] font-bold text-gray-400">{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth(currentMonth).map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const dateStr = formatDate(date);
          const status = checkDateAvailability(dateStr);

          const isSelected = dateStr === selectedDate;
          const seriesMatch = isRecurring ? bookingSeries.find(s => s.date === dateStr) : null;
          const isPartOfSeries = !!seriesMatch;
          const isSeriesConflict = seriesMatch && seriesMatch.status !== 'AVAILABLE';
          const isBaseDisabled = status !== 'AVAILABLE';

          // Styles
          let bgClass = 'bg-white hover:bg-gray-50 border-transparent';
          let textClass = 'text-gray-700';

          if (isSelected) {
            bgClass = 'bg-gray-900 shadow-md scale-105 z-10 border-transparent';
            textClass = 'text-white';
          } else if (isSeriesConflict) {
            bgClass = 'bg-red-100 border-red-200';
            textClass = 'text-red-700 line-through decoration-red-400';
          } else if (isPartOfSeries) {
            bgClass = 'bg-brand-100 border-brand-200';
            textClass = 'text-brand-700 font-bold';
          } else if (isBaseDisabled) {
            bgClass = 'bg-gray-50';
            textClass = 'text-gray-300 cursor-not-allowed line-through decoration-gray-300';
          }

          return (
            <button
              key={dateStr}
              disabled={isBaseDisabled && !isSeriesConflict}
              onClick={() => {
                setSelectedDate(dateStr);
                setSelectedHours([]);
              }}
              className={`
                            relative w-full aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all border
                            ${bgClass} ${textClass}
                        `}
            >
              {date.getDate()}
              {dateStr === new Date().toISOString().split('T')[0] && !isSelected && (
                <div className="absolute bottom-1 w-1 h-1 bg-brand-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10px] text-gray-500 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-900"></div> Start</div>
        {isRecurring && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-brand-200 border border-brand-300"></div> Series</div>}
        {isRecurring && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-200 border border-red-300"></div> Conflict</div>}
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-200"></div> Blocked</div>
      </div>
    </div>
  );

  const fees = calculateFees();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 pb-24 lg:pb-8 animate-in slide-in-from-right duration-300">
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        listing={listing}
      />
      {/* Header & Nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-gray-900 font-medium px-3 py-2 rounded-full hover:bg-gray-100 -ml-3 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to browse
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            aria-label="Share listing"
            title="Share listing"
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors flex items-center gap-2"
          >
            <Share size={18} /> <span className="text-sm underline hidden sm:inline">Share</span>
          </button>
          <button
            onClick={handleToggleFavorite}
            className={`p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2 ${isFavorite ? 'text-red-500' : 'text-gray-600'}`}
          >
            <Heart size={18} className={isFavorite ? 'fill-current' : ''} /> <span className="text-sm underline hidden sm:inline">{isFavorite ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Immersive Gallery */}
      <ImmersiveGallery
        images={listing.images}
        initialIndex={currentImageIndex}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Images & Details */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {/* Hero Gallery (Bento Grid) */}
          <div className="relative rounded-xl lg:rounded-2xl overflow-hidden h-[300px] sm:h-[400px] group cursor-pointer" onClick={() => openGallery(0)}>
            {listing.images.length >= 5 ? (
              <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full">
                {/* Hero Image */}
                <div className="col-span-2 row-span-2 relative overflow-hidden">
                  <img src={listing.images[0]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Main" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
                </div>
                {/* Side Images */}
                <div className="col-span-1 row-span-1 relative overflow-hidden">
                  <img src={listing.images[1]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Detail 1" />
                </div>
                <div className="col-span-1 row-span-1 relative overflow-hidden">
                  <img src={listing.images[2]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Detail 2" />
                </div>
                <div className="col-span-1 row-span-1 relative overflow-hidden">
                  <img src={listing.images[3]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Detail 3" />
                </div>
                <div className="col-span-1 row-span-1 relative overflow-hidden">
                  <img src={listing.images[4]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Detail 4" />
                </div>
              </div>
            ) : (
              // Fallback if fewer images
              <div className="w-full h-full relative overflow-hidden">
                <img src={listing.images[0]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Main" />
              </div>
            )}

            {/* Show All Photos Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openGallery(0);
              }}
              className="absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-md font-semibold text-sm flex items-center gap-2 hover:scale-105 transition"
            >
              <Grid size={16} /> Show all photos
            </button>
          </div>

          {/* Info */}
          <div>
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">
                  {listing.type}
                </div>
                {listing.requiresIdentityVerification && (
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">
                    <UserCheck size={14} />
                    <span>ID Required</span>
                  </div>
                )}
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin size={16} className="mr-1 shrink-0" />
                <span>{listing.location}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-y border-gray-100 py-4 sm:py-6 mt-4 sm:mt-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {host?.avatar ? (
                    <img src={host.avatar} alt={host.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="p-2 bg-gray-100 rounded-full">
                      <UserIcon size={24} className="text-gray-600" />
                    </div>
                  )}
                  {host?.kycVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-white" title="Verified Host">
                      <CheckCircle size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase font-bold">Host</p>
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-gray-900">{host?.name || 'Unknown Host'}</p>
                    {host?.kycVerified && <CheckCircle size={14} className="text-blue-500 fill-blue-50" />}
                  </div>
                  <button
                    onClick={handleContactHost}
                    className="text-brand-600 text-sm font-semibold hover:underline mt-1 flex items-center gap-1"
                  >
                    <MessageSquare size={14} /> Contact Host
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <Star size={20} className="text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Rating</p>
                  <p className="font-medium">4.9 (12 reviews)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <Users size={20} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Capacity</p>
                  <p className="font-medium">Up to {listing.capacity || 1} Guests</p>
                </div>
              </div>
            </div>

            <div className="prose text-gray-600 max-w-none">
              <h3 className="text-lg font-bold text-gray-900 mb-2">About this space</h3>
              <p>{listing.description}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Amenities & Tags</h3>
              <div className="flex flex-wrap gap-2">
                {listing.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-10 pt-10 border-t border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Reviews</h3>
                  {(() => {
                    const avgRating = getAverageRating(listing.id);
                    const reviews = getReviews(listing.id);
                    return avgRating > 0 ? (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              {(() => {
                const reviews = getReviews(listing.id);
                if (reviews.length === 0) {
                  return (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <Star size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No reviews yet. Be the first to review this space!</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {reviews.slice(0, 5).map(review => {
                      const reviewer = getAllUsers().find(u => u.id === review.userId);
                      return (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold shrink-0">
                              {reviewer?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-gray-900">{reviewer?.name || 'Anonymous'}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {reviews.length > 5 && (
                      <button className="text-brand-600 font-semibold hover:text-brand-700 text-sm">
                        Show all {reviews.length} reviews
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Things to Know - Policies & Safety */}
            <div className="mt-8 pt-8 border-t border-gray-200 pb-0">
              <h3 className="text-xl font-bold text-gray-900 mb-4 sm:mb-6">Things to know</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pb-0">
                {/* House Rules */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">House Rules</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {listing.houseRules && listing.houseRules.length > 0 ? (
                      listing.houseRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="block w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></span>
                          {rule}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400 italic">No specific rules set by host.</li>
                    )}
                  </ul>
                </div>

                {/* Safety */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Safety & Property</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {listing.safetyItems && listing.safetyItems.length > 0 ? (
                      listing.safetyItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ShieldCheck size={14} className="mt-0.5 text-gray-400 shrink-0" />
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400 italic">No safety info provided.</li>
                    )}
                  </ul>
                </div>

                {/* Cancellation */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Cancellation Policy</h4>
                  <p className="text-sm font-medium text-gray-900 mb-1">{listing.cancellationPolicy || CancellationPolicy.MODERATE}</p>
                  <p className="text-sm text-gray-600">
                    {listing.cancellationPolicy === CancellationPolicy.FLEXIBLE && "Free cancellation until 24 hours before check-in."}
                    {listing.cancellationPolicy === CancellationPolicy.MODERATE && "Free cancellation until 5 days before check-in."}
                    {(listing.cancellationPolicy === CancellationPolicy.STRICT || !listing.cancellationPolicy) && "Non-refundable."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Booking Widget */}
        <div className="lg:col-span-1">
          {/* Desktop: Sticky sidebar */}
          <div className="hidden lg:block sticky top-24 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-end mb-6 pb-6 border-b border-gray-100">
              <div>
                <span className="text-3xl font-bold text-gray-900">${listing.price}</span>
                <span className="text-gray-500"> / {isHourly ? 'hour' : 'day'}</span>
              </div>
              {(() => {
                const reviews = getReviews(listing.id);
                return reviews.length > 0 ? (
                  <button 
                    onClick={() => setShowReviewsModal(true)}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Star size={16} className="text-yellow-400 mr-1" />
                    <span className="font-medium text-gray-900 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-500">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
                  </button>
                ) : null;
              })()}
            </div>

            <div className="space-y-4 mb-6">

              {/* Guest Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    disabled={guestCount <= 1}
                    aria-label="Decrease guests"
                    title="Decrease guests"
                    className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-r border-gray-300 disabled:opacity-50"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="flex-1 text-center py-3 bg-white font-medium">
                    {guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setGuestCount(Math.min(listing.capacity || 10, guestCount + 1))}
                    disabled={guestCount >= (listing.capacity || 10)}
                    aria-label="Increase guests"
                    title="Increase guests"
                    className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-l border-gray-300 disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {/* Guest Price Info */}
                {guestCount > (listing.includedGuests || 1) && (listing.pricePerExtraGuest || 0) > 0 && (
                  <div className="mt-1 text-xs text-gray-500 flex justify-between">
                    <span>Included: {listing.includedGuests} guests</span>
                    <span className="font-medium text-green-700">+${(guestCount - (listing.includedGuests || 1)) * (listing.pricePerExtraGuest || 0)}/unit extra</span>
                  </div>
                )}
              </div>

              {/* Date Selection - Custom Calendar Trigger */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    aria-label="Open calendar"
                    title="Open calendar"
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg hover:border-brand-500 hover:ring-1 hover:ring-brand-500 text-left flex items-center transition-all bg-white"
                  >
                    <CalendarIcon className="absolute left-3 top-3.5 text-gray-500" size={18} />
                    <span className="font-medium text-gray-900">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </button>
                </div>
                {isCalendarOpen && renderCalendar()}
              </div>

              {/* Optional Extras Selection */}
              {listing.addOns && listing.addOns.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                    <PackagePlus size={16} className="text-brand-600" /> Optional Extras
                  </div>
                  <div className="space-y-2">
                    {listing.addOns.map(addon => (
                      <div key={addon.id}
                        onClick={() => toggleAddOn(addon.id)}
                        className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${selectedAddOns.includes(addon.id) ? 'bg-white border-brand-500 ring-1 ring-brand-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="flex items-start gap-2 overflow-hidden">
                          <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${selectedAddOns.includes(addon.id) ? 'bg-brand-600 border-brand-600' : 'border-gray-300'}`}>
                            {selectedAddOns.includes(addon.id) && <CheckCircle size={12} className="text-white" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{addon.name}</div>
                            {addon.description && <div className="text-[10px] text-gray-500 truncate">{addon.description}</div>}
                          </div>
                        </div>
                        <div className="text-sm font-bold whitespace-nowrap">
                          +${addon.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recurrence Toggle */}
              {listing.settings?.allowRecurring && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 transition-colors">
                  <div className="flex items-center justify-between mb-2 cursor-pointer select-none" onClick={() => setIsRecurring(!isRecurring)}>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Repeat size={16} className={isRecurring ? "text-brand-600" : "text-gray-400"} />
                      {isHourly ? 'Repeat Booking?' : 'Book Series?'}
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${isRecurring ? 'bg-brand-600' : 'bg-gray-300'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isRecurring ? 'left-6' : 'left-1'}`} />
                    </div>
                  </div>

                  {isRecurring && (
                    <div className="space-y-3 mt-3 pt-3 border-t border-gray-200 animate-in slide-in-from-top-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Frequency</label>
                        <div className="flex gap-2">
                          {isHourly && (
                            <button
                              onClick={() => setRecurrenceFreq('DAILY')}
                              className={`flex-1 py-1.5 text-xs rounded border ${recurrenceFreq === 'DAILY' ? 'bg-white border-brand-500 text-brand-600 ring-1 ring-brand-500' : 'bg-white border-gray-300 text-gray-600'}`}
                            >
                              Daily
                            </button>
                          )}
                          <button
                            onClick={() => setRecurrenceFreq('WEEKLY')}
                            className={`py-1.5 text-xs rounded border ${isHourly ? 'flex-1' : 'w-full'} ${recurrenceFreq === 'WEEKLY' ? 'bg-white border-brand-500 text-brand-600 ring-1 ring-brand-500' : 'bg-white border-gray-300 text-gray-600'}`}
                          >
                            Weekly
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Occurrences</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={2}
                            max={8}
                            value={recurrenceCount}
                            onChange={(e) => setRecurrenceCount(parseInt(e.target.value))}
                            aria-label="Number of occurrences"
                            title="Number of occurrences"
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                          />
                          <span className="text-sm font-bold w-8 text-center">{recurrenceCount}</span>
                        </div>
                      </div>

                      {/* Dates Preview with Validity Check */}
                      <div className="text-[10px] bg-white p-2 rounded border border-gray-100">
                        <div className="font-bold mb-1 text-gray-700">Series Preview:</div>
                        <div className="grid grid-cols-2 gap-y-1 gap-x-2">
                          {bookingSeries.map((item, i) => (
                            <div key={i} className={`flex items-center gap-1 truncate ${item.status !== 'AVAILABLE' ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                              {item.status === 'AVAILABLE' ? (
                                <CheckCircle size={10} className="text-green-500" />
                              ) : (
                                <X size={10} />
                              )}
                              <span>{item.date.slice(5)}</span>
                              {item.status !== 'AVAILABLE' && <span className="text-[8px] uppercase ml-auto border border-red-200 px-1 rounded">Blocked</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hourly Selection */}
              {isHourly && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Select Hours</label>
                    <span className="text-xs text-gray-500">{selectedHours.length} selected</span>
                  </div>

                  {hostOpenHours.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm">
                      <Ban className="mx-auto mb-2 text-gray-400" size={20} />
                      Host is unavailable on this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {hostOpenHours.map(hour => {
                        const booked = isSlotBooked(selectedDate, hour);
                        const isSelected = selectedHours.includes(hour);
                        return (
                          <button
                            key={hour}
                            onClick={() => !booked && handleHourToggle(hour)}
                            disabled={booked}
                            className={`
                              py-2 rounded text-xs font-medium transition-all relative border
                              ${booked
                                ? 'bg-gray-100 text-gray-300 border-transparent cursor-not-allowed decoration-gray-300'
                                : (isSelected
                                  ? 'bg-brand-600 text-white border-brand-600'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-brand-300 hover:bg-gray-50')
                              }
                            `}
                          >
                            {hour.toString().padStart(2, '0')}:00
                            {booked && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-[60%] h-px bg-gray-300 transform -rotate-12"></div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {isRecurring && selectedHours.length > 0 && (
                    <div className="mt-2 bg-blue-50 border border-blue-100 p-2 rounded flex items-start gap-2">
                      <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800">
                        Selected hours will apply to all {recurrenceCount} dates in the series.
                        <span className="block text-gray-500 text-[10px] mt-1">We check availability for every single date.</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Daily Selection */}
              {!isHourly && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Nights)</label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setSelectedDays(Math.max(1, selectedDays - 1))}
                      aria-label="Decrease nights"
                      title="Decrease nights"
                      className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-r border-gray-300"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={selectedDays}
                      readOnly
                      aria-label="Number of nights"
                      title="Number of nights"
                      className="w-full text-center p-3 outline-none bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedDays(selectedDays + 1)}
                      aria-label="Increase nights"
                      title="Increase nights"
                      className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-l border-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Total & Breakdown */}
            <div className="space-y-4">
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal {isRecurring && `(${recurrenceCount} bookings)`}</span>
                  <span>${fees.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Service Fee (10%)</span>
                  <span>${fees.serviceFee.toFixed(2)}</span>
                </div>
                {fees.cautionFee > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      Caution Fee
                      <span title="Refundable Deposit">
                        <Info size={12} className="text-gray-400" />
                      </span>
                    </span>
                    <span>${fees.cautionFee.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-lg font-bold text-gray-900 border-t border-gray-200 pt-4">
                <span>Total</span>
                <div className="text-right">
                  <div>${fees.total.toFixed(2)}</div>
                </div>
              </div>

              {user && !user.kycVerified && listing.requiresIdentityVerification && (
                <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>One-time verification required to book.</span>
                </div>
              )}

              {/* Smart Booking Button */}
              <button
                onClick={handleBookClick}
                disabled={(isHourly && hostOpenHours.length === 0) || isBookingLoading || bookingSeries.some(s => s.status !== 'AVAILABLE')}
                className={`
                    w-full py-3.5 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2
                    ${(isHourly && hostOpenHours.length === 0) || bookingSeries.some(s => s.status !== 'AVAILABLE')
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-200'}
                `}
              >
                {isBookingLoading && <Loader2 className="animate-spin" size={20} />}
                {!isBookingLoading && (
                  // Dynamic Button Text based on State
                  bookingSeries.some(s => s.status !== 'AVAILABLE') ? 'Dates Unavailable' :
                    (user ?
                      (listing.requiresIdentityVerification && !user.kycVerified ? 'Verify & Book' : (isRecurring ? `Book Series` : 'Book Now'))
                      : 'Sign in to Book'
                    )
                )}
              </button>

              {!user && (
                <p className="text-center text-xs text-gray-500">You won't be charged yet</p>
              )}
            </div>
          </div>

          {/* Mobile: Fixed bottom bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-gray-500">Total</div>
                <div className="text-xl font-bold text-gray-900">${fees.total.toFixed(2)}</div>
              </div>
              <button
                onClick={() => setShowMobileBookingModal(true)}
                className="flex-1 py-3 rounded-lg font-bold transition shadow-md bg-brand-600 text-white hover:bg-brand-700"
              >
                Select Options
              </button>
            </div>
          </div>

          {/* Mobile Booking Modal */}
          {showMobileBookingModal && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
              <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold">Booking Options</h2>
                  <button onClick={() => setShowMobileBookingModal(false)} aria-label="Close booking options" title="Close booking options" className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button type="button" onClick={() => setGuestCount(Math.max(1, guestCount - 1))} disabled={guestCount <= 1} aria-label="Decrease guests" title="Decrease guests" className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-r border-gray-300 disabled:opacity-50"><Minus size={16} /></button>
                      <div className="flex-1 text-center py-3 bg-white font-medium">{guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}</div>
                      <button type="button" onClick={() => setGuestCount(Math.min(listing.capacity || 10, guestCount + 1))} disabled={guestCount >= (listing.capacity || 10)} aria-label="Increase guests" title="Increase guests" className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-l border-gray-300 disabled:opacity-50"><Plus size={16} /></button>
                    </div>
                    {guestCount > (listing.includedGuests || 1) && (listing.pricePerExtraGuest || 0) > 0 && (
                      <div className="mt-1 text-xs text-gray-500 flex justify-between">
                        <span>Included: {listing.includedGuests} guests</span>
                        <span className="font-medium text-green-700">+${(guestCount - (listing.includedGuests || 1)) * (listing.pricePerExtraGuest || 0)}/unit extra</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <button type="button" onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg text-left flex items-center bg-white relative">
                      <CalendarIcon className="absolute left-3 top-3.5 text-gray-500" size={18} />
                      <span className="font-medium text-gray-900">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </button>
                    {isCalendarOpen && renderCalendar()}
                  </div>
                  {listing.addOns && listing.addOns.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                        <PackagePlus size={16} className="text-brand-600" /> Optional Extras
                      </div>
                      <div className="space-y-2">
                        {listing.addOns.map(addon => (
                          <div key={addon.id} onClick={() => toggleAddOn(addon.id)} className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${selectedAddOns.includes(addon.id) ? 'bg-white border-brand-500 ring-1 ring-brand-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                            <div className="flex items-start gap-2 overflow-hidden">
                              <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${selectedAddOns.includes(addon.id) ? 'bg-brand-600 border-brand-600' : 'border-gray-300'}`}>
                                {selectedAddOns.includes(addon.id) && <CheckCircle size={12} className="text-white" />}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate">{addon.name}</div>
                                {addon.description && <div className="text-[10px] text-gray-500 truncate">{addon.description}</div>}
                              </div>
                            </div>
                            <div className="text-sm font-bold whitespace-nowrap">+${addon.price}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {listing.settings?.allowRecurring && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setIsRecurring(!isRecurring)}>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                          <Repeat size={16} className={isRecurring ? "text-brand-600" : "text-gray-400"} />
                          {isHourly ? 'Repeat Booking?' : 'Book Series?'}
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${isRecurring ? 'bg-brand-600' : 'bg-gray-300'}`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isRecurring ? 'left-6' : 'left-1'}`} />
                        </div>
                      </div>
                      {isRecurring && (
                        <div className="space-y-3 mt-3 pt-3 border-t border-gray-200">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Frequency</label>
                            <div className="flex gap-2">
                              {isHourly && <button onClick={() => setRecurrenceFreq('DAILY')} className={`flex-1 py-1.5 text-xs rounded border ${recurrenceFreq === 'DAILY' ? 'bg-white border-brand-500 text-brand-600 ring-1 ring-brand-500' : 'bg-white border-gray-300 text-gray-600'}`}>Daily</button>}
                              <button onClick={() => setRecurrenceFreq('WEEKLY')} className={`py-1.5 text-xs rounded border ${isHourly ? 'flex-1' : 'w-full'} ${recurrenceFreq === 'WEEKLY' ? 'bg-white border-brand-500 text-brand-600 ring-1 ring-brand-500' : 'bg-white border-gray-300 text-gray-600'}`}>Weekly</button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Occurrences</label>
                            <div className="flex items-center gap-3">
                              <input type="range" min={2} max={8} value={recurrenceCount} onChange={(e) => setRecurrenceCount(parseInt(e.target.value))} aria-label="Number of occurrences" title="Number of occurrences" className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600" />
                              <span className="text-sm font-bold w-8 text-center">{recurrenceCount}</span>
                            </div>
                          </div>
                          <div className="text-[10px] bg-white p-2 rounded border border-gray-100">
                            <div className="font-bold mb-1 text-gray-700">Series Preview:</div>
                            <div className="grid grid-cols-2 gap-y-1 gap-x-2">
                              {bookingSeries.map((item, i) => (
                                <div key={i} className={`flex items-center gap-1 truncate ${item.status !== 'AVAILABLE' ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                  {item.status === 'AVAILABLE' ? <CheckCircle size={10} className="text-green-500" /> : <X size={10} />}
                                  <span>{item.date.slice(5)}</span>
                                  {item.status !== 'AVAILABLE' && <span className="text-[8px] uppercase ml-auto border border-red-200 px-1 rounded">Blocked</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {isHourly && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Select Hours</label>
                        <span className="text-xs text-gray-500">{selectedHours.length} selected</span>
                      </div>
                      {hostOpenHours.length === 0 ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm"><Ban className="mx-auto mb-2 text-gray-400" size={20} />Host is unavailable on this date.</div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {hostOpenHours.map(hour => {
                            const booked = isSlotBooked(selectedDate, hour);
                            const isSelected = selectedHours.includes(hour);
                            return (
                              <button key={hour} onClick={() => !booked && handleHourToggle(hour)} disabled={booked} className={`py-2 rounded text-xs font-medium transition-all relative border ${booked ? 'bg-gray-100 text-gray-300 border-transparent cursor-not-allowed' : (isSelected ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-gray-200 text-gray-700 hover:border-brand-300')}`}>
                                {hour.toString().padStart(2, '0')}:00
                                {booked && <div className="absolute inset-0 flex items-center justify-center"><div className="w-[60%] h-px bg-gray-300 transform -rotate-12"></div></div>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {isRecurring && selectedHours.length > 0 && (
                        <div className="mt-2 bg-blue-50 border border-blue-100 p-2 rounded flex items-start gap-2">
                          <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-800">
                            Selected hours will apply to all {recurrenceCount} dates in the series.
                            <span className="block text-gray-500 text-[10px] mt-1">We check availability for every single date.</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {!isHourly && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Nights)</label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button type="button" onClick={() => setSelectedDays(Math.max(1, selectedDays - 1))} aria-label="Decrease nights" title="Decrease nights" className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-r border-gray-300">-</button>
                        <input type="number" value={selectedDays} readOnly aria-label="Number of nights" title="Number of nights" className="w-full text-center p-3 outline-none bg-white" />
                        <button type="button" onClick={() => setSelectedDays(selectedDays + 1)} aria-label="Increase nights" title="Increase nights" className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-l border-gray-300">+</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-200 bg-white space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal {isRecurring && `(${recurrenceCount} bookings)`}</span>
                      <span>${fees.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Service Fee (10%)</span>
                      <span>${fees.serviceFee.toFixed(2)}</span>
                    </div>
                    {fees.cautionFee > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          Caution Fee
                          <Info size={12} className="text-gray-400" />
                        </span>
                        <span>${fees.cautionFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
                      <span>Total</span>
                      <span>${fees.total.toFixed(2)}</span>
                    </div>
                  </div>
                  {user && !user.kycVerified && listing.requiresIdentityVerification && (
                    <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <span>One-time verification required to book.</span>
                    </div>
                  )}
                  <button onClick={() => { setShowMobileBookingModal(false); handleBookClick(); }} disabled={(isHourly && selectedHours.length === 0) || isBookingLoading || bookingSeries.some(s => s.status !== 'AVAILABLE')} className={`w-full font-bold py-3 rounded-lg transition ${(isHourly && selectedHours.length === 0) || bookingSeries.some(s => s.status !== 'AVAILABLE') ? 'bg-gray-300 text-gray-500' : 'bg-brand-600 text-white hover:bg-brand-700'}`}>
                    {isBookingLoading ? <Loader2 className="animate-spin" size={18} /> : (bookingSeries.some(s => s.status !== 'AVAILABLE') ? 'Dates Unavailable' : (user ? (listing.requiresIdentityVerification && !user.kycVerified ? 'Verify & Book' : (isRecurring ? 'Book Series' : 'Book Now')) : 'Sign in to Book'))}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowVerificationModal(false)}
              aria-label="Close verification dialog"
              title="Close verification dialog"
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X size={20} className="text-gray-500" />
            </button>

            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={36} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                The host of this space requires verified ID. Please verify your identity to continue. This is a one-time process.
              </p>

              <div className="space-y-4">
                <label className={`
                      block w-full border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all group
                      ${isVerifying ? 'border-brand-300 bg-brand-50' : 'border-gray-300 hover:border-brand-500 hover:bg-gray-50'}
                   `}>
                  {isVerifying ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Loader2 className="animate-spin text-brand-600 mb-3" size={32} />
                      <span className="text-brand-700 font-medium">Verifying your document...</span>
                    </div>
                  ) : (
                    <>
                      {/* Close modal immediately when a file is selected, then run verification logic. */}
                      <input id="id-upload" type="file" className="hidden" onChange={handleVerificationComplete} aria-label="Upload ID document" aria-describedby="id-upload-desc" />
                      <UploadCloud className="mx-auto text-gray-400 group-hover:text-brand-500 mb-3 transition-colors" size={32} />
                      <div className="text-gray-900 font-medium">Click to upload ID</div>
                      <div id="id-upload-desc" className="text-xs text-gray-400 mt-1">Passport, Driver's License, or National ID</div>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {showConfirmModal && pendingBooking && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200">

            {/* Left: Trip Details */}
            <div className="md:w-1/3 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">Your Trip</h2>

              <div className="flex gap-4 mb-6">
                <img src={listing.images[0]} className="w-20 h-20 rounded-lg object-cover" alt="Space" />
                <div>
                  <div className="text-xs text-gray-500 mb-1">{listing.type}</div>
                  <div className="font-semibold text-sm line-clamp-2">{listing.title}</div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Star size={10} className="text-yellow-500 mr-1" /> 4.9
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-200 pt-4">
                <div>
                  <div className="font-semibold text-sm mb-1">Dates</div>
                  <div className="text-sm text-gray-600">{new Date(pendingBooking.dates[0]).toLocaleDateString()} {pendingBooking.dates.length > 1 && `+ ${pendingBooking.dates.length - 1} more`}</div>
                </div>
                <div>
                  <div className="font-semibold text-sm mb-1">Guests</div>
                  <div className="text-sm text-gray-600">{pendingBooking.guestCount} Guests</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-bold text-sm mb-3">Price Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${pendingBooking.fees.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>${pendingBooking.fees.serviceFee.toFixed(2)}</span>
                  </div>
                  {pendingBooking.fees.cautionFee > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Caution Fee (Refundable)</span>
                      <span>${pendingBooking.fees.cautionFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                    <span>Total (USD)</span>
                    <span>${pendingBooking.fees.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Review & Agreement */}
            <div className="md:w-2/3 p-8 overflow-y-auto relative">
              <button
                type="button"
                onClick={() => {
                  // Auto-save on close (Abandoned Cart)
                  saveDraftBooking(true);
                  setShowConfirmModal(false);
                }}
                aria-label="Close confirmation dialog"
                title="Close confirmation dialog"
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} className="text-gray-500" />
              </button>

              <h2 className="text-2xl font-bold mb-6">Review and pay</h2>

              <div className="space-y-8">
                {/* Payment Method Selection */}
                <section>
                  <h3 className="font-semibold text-lg mb-3">Pay with</h3>
                  <div className="space-y-3">
                    {/* Wallet Option */}
                    <div
                      onClick={() => setPaymentMethod('WALLET')}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'WALLET' ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${paymentMethod === 'WALLET' ? 'bg-brand-200 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>
                          <Wallet size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">Fiilar Wallet</div>
                          <div className="text-sm text-gray-500">Balance: ₦{walletBalance.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'WALLET' ? 'border-brand-600 bg-brand-600' : 'border-gray-300'}`}>
                        {paymentMethod === 'WALLET' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>

                    {/* Card Option */}
                    <div
                      onClick={() => setPaymentMethod('CARD')}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${paymentMethod === 'CARD' ? 'bg-brand-200 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">Credit / Debit Card</div>
                          <div className="text-sm text-gray-500">Pay securely with card</div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'CARD' ? 'border-brand-600 bg-brand-600' : 'border-gray-300'}`}>
                        {paymentMethod === 'CARD' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  </div>

                  {/* Insufficient Funds Warning */}
                  {paymentMethod === 'WALLET' && walletBalance < pendingBooking.fees.total && (
                    <div className="mt-3 flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>Insufficient wallet balance. Please top up or use a card.</span>
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-3">Cancellation Policy</h3>
                  <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <span className="font-bold text-gray-900">{listing.cancellationPolicy || CancellationPolicy.MODERATE}: </span>
                    {listing.cancellationPolicy === CancellationPolicy.FLEXIBLE && "Cancel up to 24 hours before check-in for a full refund."}
                    {listing.cancellationPolicy === CancellationPolicy.MODERATE && "Cancel up to 5 days before check-in for a full refund."}
                    {(listing.cancellationPolicy === CancellationPolicy.STRICT || !listing.cancellationPolicy) && "Bookings are non-refundable."}
                  </div>
                </section>

                <div className="pt-6 border-t border-gray-200">
                  <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      I agree to the <button type="button" onClick={() => navigate('/terms')} className="text-brand-600 hover:text-brand-700 font-medium underline">Host's House Rules</button>, Ground rules for guests, and Fiilar's <button type="button" onClick={() => navigate('/terms')} className="text-brand-600 hover:text-brand-700 font-medium underline">Rebooking and Refund Policy</button>.
                    </span>
                  </label>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={!agreedToTerms || isBookingLoading || (paymentMethod === 'WALLET' && walletBalance < pendingBooking.fees.total)}
                    className={`
                                    w-full font-bold text-lg py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2
                                    ${!agreedToTerms || isBookingLoading || (paymentMethod === 'WALLET' && walletBalance < pendingBooking.fees.total)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-xl'}
                                `}
                  >
                    {isBookingLoading ? <Loader2 className="animate-spin" /> : `Pay $${pendingBooking.fees.total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {showReviewsModal && (() => {
        const reviews = getReviews(listing.id);
        const avgRating = getAverageRating(listing.id);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                  {avgRating > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowReviewsModal(false)}
                  aria-label="Close reviews modal"
                  title="Close reviews modal"
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map(review => {
                      const reviewer = getAllUsers().find(u => u.id === review.userId);
                      return (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold shrink-0">
                              {reviewer?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-gray-900">{reviewer?.name || 'Anonymous'}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default ListingDetails;


