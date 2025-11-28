import React, { useState, useEffect } from 'react';
import { cn } from '@fiilar/utils';
import { Listing, BookingType, Booking, User, PricingModel } from '@fiilar/types';
import { ArrowLeft, Share, Heart } from 'lucide-react';
import { PriceBreakdownModal } from '../components/ListingDetails/PriceBreakdownModal';
import { SectionNav } from '../components/ListingDetails/SectionNav';
import ShareModal from '../components/ShareModal';
import ImmersiveGallery from '../components/ImmersiveGallery';
import { formatCurrency } from '../../../utils/currency';
import { ConfirmDialog } from '@fiilar/ui';

// New Component Imports
import { ListingHeader } from '../components/ListingDetails/ListingHeader';

import { ListingImages } from '../components/ListingDetails/ListingImages';
import { ListingDescription } from '../components/ListingDetails/ListingDescription';
import { ListingAmenities } from '../components/ListingDetails/ListingAmenities';
import { ListingAccessInfo } from '../components/ListingDetails/ListingAccessInfo';
import { ListingReviews } from '../components/ListingDetails/ListingReviews';
import { ListingPolicies } from '../components/ListingDetails/ListingPolicies';
import { BookingModal } from '../components/ListingDetails/BookingModal';
import { HostSidebarCard, HostProfileCard, LocationPreviewCard } from '../components/ListingDetails/HostSidebarCard';
import { ReviewsModal } from '../components/ListingDetails/ReviewsModal';
import { SuccessModal } from '../components/ListingDetails/SuccessModal';
import { VerificationModal } from '../components/ListingDetails/VerificationModal';
import { ConfirmModal } from '../components/ListingDetails/ConfirmModal';

// Hook
import { useListingDetails } from '../hooks/useListingDetails';

interface ListingDetailsProps {
  listing: Listing;
  user: User | null;
  onBack: () => void;
  onBook: (dates: string[], duration: number, breakdown: { total: number, service: number, caution: number }, selectedHours?: number[], guestCount?: number, selectedAddOns?: string[]) => Promise<Booking[]>;
  onVerify?: () => void;
  onLogin: () => void;
  onRefreshUser?: () => void;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({ listing, user, onBack, onBook, onVerify, onLogin, onRefreshUser }) => {
  const {
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
    currentImageIndex,
    isRecurring, setIsRecurring,
    recurrenceFreq, setRecurrenceFreq,
    recurrenceCount, setRecurrenceCount,
    showVerificationModal, setShowVerificationModal,
    showConfirmModal, setShowConfirmModal,
    isVerifying,
    isBookingLoading,
    pendingBooking,
    isFavorite,
    showMobileBookingModal, setShowMobileBookingModal,
    showReviewsModal, setShowReviewsModal,
    agreedToTerms, setAgreedToTerms,
    isSavedForLater,
    showSuccessModal,
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
  } = useListingDetails({ listing, user, onBook, onVerify, onLogin, onRefreshUser });

  const [showPriceBreakdownModal, setShowPriceBreakdownModal] = useState(false);

  const [showTopNav, setShowTopNav] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Hide top nav when scrolled past 60% of viewport (before sheet hits top)
      const threshold = window.innerHeight * 0.6;
      setShowTopNav(window.scrollY < threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHost = user?.id === listing.hostId;

  return (
    <div className="min-h-screen bg-white">
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        listing={listing}
      />

      {/* Host Preview Banner */}
      {isHost && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-amber-100 border border-amber-200 text-amber-800 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-500 pointer-events-none">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">Host Preview Mode</span>
        </div>
      )}

      <ImmersiveGallery
        images={listing.images}
        initialIndex={currentImageIndex}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      {/* Top Navigation (Floating) */}
      <div className={cn(
        "fixed top-0 left-0 w-full z-50 p-4 sm:p-6 flex justify-between items-start pointer-events-none transition-opacity duration-300",
        (showTopNav && !showMobileBookingModal) ? "opacity-100" : "opacity-0"
      )}>
        <button
          onClick={onBack}
          className="pointer-events-auto p-2.5 rounded-full hover:bg-white/20 transition-all hover:scale-105"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full hover:bg-white/20 transition-all hover:scale-105"
            aria-label="Share"
          >
            <Share size={20} className="text-white" />
          </button>
          <button
            onClick={handleToggleFavorite}
            className="p-2.5 rounded-full hover:bg-white/20 transition-all hover:scale-105"
            aria-label="Save"
          >
            <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : "text-white"} />
          </button>
        </div>
      </div>

      {/* Mobile Sticky Header (Appears on scroll) */}
      <div className={cn(
        "fixed top-0 left-0 w-full z-[60] bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between transition-all duration-300 lg:hidden shadow-sm",
        (!showTopNav && !showMobileBookingModal) ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}>
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-gray-900 truncate pr-2">{listing.title}</h1>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Share listing"
          >
            <Share size={18} className="text-gray-700" />
          </button>
          <button
            onClick={handleToggleFavorite}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"} />
          </button>
        </div>
      </div>

      {/* Floating Action Bar (Desktop - Minimal) */}
      <div className={`hidden lg:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-white/80 backdrop-blur-md border border-gray-200/50 p-2 pl-6 rounded-full shadow-2xl items-center gap-6 animate-in slide-in-from-bottom-4 duration-700 transition-all ${showMobileBookingModal ? 'translate-y-32 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <div className="flex flex-col items-start">
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(listing.price)}
            <span className="text-sm font-normal text-gray-500">/{
              listing.pricingModel === PricingModel.NIGHTLY ? 'night' :
                listing.pricingModel === PricingModel.DAILY ? 'day' :
                  listing.pricingModel === PricingModel.HOURLY ? 'hr' :
                    listing.priceUnit === BookingType.HOURLY ? 'hr' : 'night'
            }</span>
          </p>
          <button
            onClick={() => setShowPriceBreakdownModal(true)}
            className="text-xs text-gray-500 underline hover:text-gray-900 transition-colors mt-0.5"
          >
            Price breakdown
          </button>
        </div>
        <button
          onClick={() => setShowMobileBookingModal(true)}
          className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-full font-semibold shadow-xl transition-all hover:scale-105"
        >
          Book Now
        </button>
      </div>

      {/* Hero Images (Parallax Fixed Background) */}
      <div className="fixed top-0 left-0 w-full h-[85vh] z-0">
        <ListingImages
          listing={listing}
          openGallery={openGallery}
          onBack={() => { }}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
        />
        {/* Gradient Overlay for text readability if needed, though content covers it */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Main Content Grid (Sliding Sheet) */}
      <div className="relative z-10 bg-white mt-[75vh] rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] min-h-screen pb-32">
        <SectionNav />
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* Left Column: The Story (66%) */}
            <div className="lg:col-span-8 space-y-12">

              {/* Title & Header moved here */}
              <div id="overview" className="scroll-mt-32">
                <ListingHeader listing={listing} />
              </div>

              <div className="border-b border-gray-100 pb-10">
                <ListingDescription listing={listing} />
              </div>

              {/* Mobile Host Section - Top */}
              <div id="host-mobile" className="lg:hidden border-b border-gray-100 pb-10">
                <HostProfileCard listing={listing} host={host} handleContactHost={handleContactHost} />
              </div>

              <div id="amenities" className="border-b border-gray-100 pb-10 scroll-mt-32">
                <ListingAmenities listing={listing} />
                <ListingAccessInfo listing={listing} />
              </div>

              <div id="reviews" className="border-b border-gray-100 pb-10 scroll-mt-32">
                <ListingReviews listing={listing} onShowAllReviews={() => setShowReviewsModal(true)} />
              </div>

              <div id="policies" className="scroll-mt-32">
                <ListingPolicies listing={listing} />
              </div>

              {/* Mobile Location Section - Bottom */}
              <div id="location-mobile" className="lg:hidden pt-8 border-t border-gray-100">
                <LocationPreviewCard />
              </div>
            </div>

            {/* Right Column: Context Sidebar (33%) */}
            <div id="location" className="hidden lg:block lg:col-span-4 sticky top-24 space-y-8 pt-4">
              <HostSidebarCard listing={listing} host={host} handleContactHost={handleContactHost} />
            </div>
          </div>
        </div>

        {/* Floating Action Bar (Mobile Only) */}
        <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe lg:hidden z-40 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-transform duration-300 ${showMobileBookingModal ? 'translate-y-full' : 'translate-y-0'}`}>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-gray-900">{formatCurrency(listing.price)}</span>
              <span className="text-sm text-gray-500">/{
                listing.pricingModel === PricingModel.NIGHTLY ? 'night' :
                  listing.pricingModel === PricingModel.DAILY ? 'day' :
                    listing.pricingModel === PricingModel.HOURLY ? 'hr' :
                      listing.priceUnit === BookingType.HOURLY ? 'hr' : 'night'
              }</span>
            </div>
            <div
              onClick={() => setShowPriceBreakdownModal(true)}
              className="text-xs text-gray-500 underline cursor-pointer hover:text-gray-900 transition-colors"
            >
              Show price breakdown
            </div>
          </div>
          <button
            onClick={() => setShowMobileBookingModal(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-brand-500/30 transition-all transform hover:scale-105 active:scale-95"
          >
            Book Now
          </button>
        </div>

        <PriceBreakdownModal
          isOpen={showPriceBreakdownModal}
          onClose={() => setShowPriceBreakdownModal(false)}
          listing={listing}
          fees={fees}
          isHourly={isHourly}
          duration={isHourly ? (selectedHours.length || 1) : selectedDays}
          guestCount={guestCount}
        />

        {/* The Comprehensive Booking Modal (Replaces Widget) */}
        <BookingModal
          isOpen={showMobileBookingModal} // Reusing this state for the main modal
          onClose={() => setShowMobileBookingModal(false)}
          listing={listing}
          user={user}
          isHost={isHost}
          guestCount={guestCount}
          setGuestCount={setGuestCount}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          isCalendarOpen={isCalendarOpen}
          setIsCalendarOpen={setIsCalendarOpen}
          selectedAddOns={selectedAddOns}
          toggleAddOn={toggleAddOn}
          isRecurring={isRecurring}
          setIsRecurring={setIsRecurring}
          recurrenceFreq={recurrenceFreq}
          setRecurrenceFreq={setRecurrenceFreq}
          recurrenceCount={recurrenceCount}
          setRecurrenceCount={setRecurrenceCount}
          bookingSeries={bookingSeries}
          isHourly={isHourly}
          selectedHours={selectedHours}
          _handleHourToggle={handleHourToggle}
          hostOpenHours={hostOpenHours}
          isSlotBooked={isSlotBooked}
          selectedDays={selectedDays}
          _setSelectedDays={setSelectedDays}
          fees={fees}
          isBookingLoading={isBookingLoading}
          handleBookClick={handleBookClick}
          _isSavedForLater={isSavedForLater}
          _handleSaveToReserveList={handleSaveToReserveList}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          checkDateAvailability={checkDateAvailability}
          setSelectedHours={setSelectedHours}
        />

        <ReviewsModal
          isOpen={showReviewsModal}
          onClose={() => setShowReviewsModal(false)}
          listing={listing}
        />

        <SuccessModal
          isOpen={showSuccessModal}
          confirmedBookings={confirmedBookings}
        />

        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          isVerifying={isVerifying}
          handleVerificationComplete={handleVerificationComplete}
        />

        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          listing={listing}
          pendingBooking={pendingBooking}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          walletBalance={walletBalance}
          agreedToTerms={agreedToTerms}
          setAgreedToTerms={setAgreedToTerms}
          isBookingLoading={isBookingLoading}
          handleConfirmBooking={handleConfirmBooking}
        />

        {/* Booking Draft Restore Dialog */}
        <ConfirmDialog
          isOpen={draftRestoreDialog.isOpen}
          title="Continue where you left off?"
          message={`You have an unfinished booking${draftRestoreDialog.draft?.listingTitle ? ` for "${draftRestoreDialog.draft.listingTitle}"` : ''}${draftRestoreDialog.draft?.savedAt ? ` (${formatDraftAge(draftRestoreDialog.draft.savedAt)})` : ''}. Would you like to restore your selections?`}
          confirmText="Restore Booking"
          cancelText="Start Fresh"
          variant="info"
          onConfirm={handleRestoreBookingDraft}
          onCancel={handleDiscardBookingDraft}
        />
      </div>
    </div>
  );
};

export default ListingDetails;
