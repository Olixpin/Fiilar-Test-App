import React from 'react';
import { Listing, User, Booking } from '@fiilar/types';
import { ArrowLeft, Share, Heart } from 'lucide-react';
import ShareModal from '../components/ShareModal';
import ImmersiveGallery from '../components/ImmersiveGallery';

// New Component Imports
import { ListingHeader } from '../components/ListingDetails/ListingHeader';
import { ListingImages } from '../components/ListingDetails/ListingImages';
import { HostInfo } from '../components/ListingDetails/HostInfo';
import { ListingDescription } from '../components/ListingDetails/ListingDescription';
import { ListingAmenities } from '../components/ListingDetails/ListingAmenities';
import { ListingReviews } from '../components/ListingDetails/ListingReviews';
import { ListingPolicies } from '../components/ListingDetails/ListingPolicies';
import { BookingWidget } from '../components/ListingDetails/BookingWidget';
import { MobileBookingBar } from '../components/ListingDetails/MobileBookingBar';
import { MobileBookingModal } from '../components/ListingDetails/MobileBookingModal';
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
    handleShare
  } = useListingDetails({ listing, user, onBook, onVerify, onLogin, onRefreshUser });

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 pb-24 lg:pb-8 animate-in slide-in-from-right duration-300">
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        listing={listing}
      />

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onBack()}
          className="flex items-center text-gray-500 hover:text-gray-900 font-medium px-3 py-2 rounded-full hover:bg-gray-100 -ml-3 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to browse
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            aria-label="Share listing"
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

      <ImmersiveGallery
        images={listing.images}
        initialIndex={currentImageIndex}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <ListingImages
            listing={listing}
            openGallery={openGallery}
            onBack={onBack}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
          />

          <div>
            <ListingHeader listing={listing} />

            <HostInfo listing={listing} host={host} handleContactHost={handleContactHost} />

            <ListingDescription listing={listing} />

            <ListingAmenities listing={listing} />

            <ListingReviews listing={listing} onShowAllReviews={() => setShowReviewsModal(true)} />

            <ListingPolicies listing={listing} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <BookingWidget
            listing={listing}
            user={user}
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
            handleHourToggle={handleHourToggle}
            hostOpenHours={hostOpenHours}
            isSlotBooked={isSlotBooked}
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
            fees={fees}
            isBookingLoading={isBookingLoading}
            handleBookClick={handleBookClick}
            isSavedForLater={isSavedForLater}
            handleSaveToReserveList={handleSaveToReserveList}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            checkDateAvailability={checkDateAvailability}
            setSelectedHours={setSelectedHours}
          />
        </div>
      </div>

      <MobileBookingBar
        listing={listing}
        onReserve={() => setShowMobileBookingModal(true)}
      />

      <MobileBookingModal
        isOpen={showMobileBookingModal}
        onClose={() => setShowMobileBookingModal(false)}
        listing={listing}
        user={user}
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
        handleHourToggle={handleHourToggle}
        hostOpenHours={hostOpenHours}
        isSlotBooked={isSlotBooked}
        selectedDays={selectedDays}
        setSelectedDays={setSelectedDays}
        fees={fees}
        isBookingLoading={isBookingLoading}
        handleBookClick={handleBookClick}
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
    </div>
  );
};

export default ListingDetails;
