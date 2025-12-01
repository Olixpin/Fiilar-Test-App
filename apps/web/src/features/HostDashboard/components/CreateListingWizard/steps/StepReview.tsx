import React from 'react';
import { Listing, User, PricingModel } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { 
    MapPin, Users, Camera, Shield, Zap, Clock, CalendarDays,
    CheckCircle, AlertTriangle, Lightbulb, Repeat, BadgeCheck, 
    BanknoteIcon, FileText, Home
} from 'lucide-react';

interface StepReviewProps {
    newListing: Partial<Listing>;
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
    user: User;
    isSubmitting: boolean;
    handleCreateListing: () => void;
    setStep: (step: number) => void;
}

const MIN_PHOTOS = 5;

const StepReview: React.FC<StepReviewProps> = ({
    newListing,
    currentStep,
    totalSteps,
    onBack,
    user,
    isSubmitting,
    handleCreateListing,
    setStep,
}) => {
    const images = newListing.images || [];
    const hasEnoughPhotos = images.length >= MIN_PHOTOS;
    const isUserKycVerified = user?.kycVerified || user?.kycStatus === 'verified';
    const hasProofOfAddress = !!newListing.proofOfAddress;
    
    const pricingModel = newListing.pricingModel || PricingModel.DAILY;
    const priceLabel = pricingModel === PricingModel.HOURLY ? 'hour' : 
                       pricingModel === PricingModel.NIGHTLY ? 'night' : 'day';

    // Determine status
    const willBeDraft = !hasEnoughPhotos;
    const willBePendingKyc = !willBeDraft && !isUserKycVerified && !hasProofOfAddress;

    const getStatusInfo = () => {
        if (willBeDraft) {
            return {
                status: 'Draft',
                color: 'amber',
                icon: AlertTriangle,
                message: `Add ${MIN_PHOTOS - images.length} more photo${MIN_PHOTOS - images.length > 1 ? 's' : ''} to submit for approval`,
            };
        }
        if (willBePendingKyc) {
            return {
                status: 'Pending KYC',
                color: 'amber',
                icon: Clock,
                message: 'Upload proof of address to submit for approval',
            };
        }
        return {
            status: 'Ready for Review',
            color: 'green',
            icon: CheckCircle,
            message: 'Your listing will be reviewed and approved shortly',
        };
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

    const completionItems = [
        { label: 'Title & Description', complete: !!(newListing.title && newListing.description), step: 5 },
        { label: 'Location', complete: !!newListing.location, step: 2 },
        { label: `Photos (${images.length}/${MIN_PHOTOS})`, complete: hasEnoughPhotos, step: 6 },
        { label: 'Price Set', complete: !!(newListing.price && newListing.price > 0), step: 10 },
        { label: 'Verification', complete: isUserKycVerified || hasProofOfAddress, step: 15 },
    ];

    return (
        <StepWrapper
            title="Review your listing"
            subtitle="Make sure everything looks good before publishing"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Publish"
            onBack={onBack}
            onNext={handleCreateListing}
            nextLabel={willBeDraft ? 'Save as Draft' : 'Publish Listing'}
            isSubmitting={isSubmitting}
            canContinue={true}
        >
            <div className="space-y-6">
                {/* Status Banner */}
                <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                    statusInfo.color === 'green' 
                        ? 'bg-green-50 border-green-100' 
                        : 'bg-amber-50 border-amber-100'
                }`}>
                    <StatusIcon size={20} className={
                        statusInfo.color === 'green' ? 'text-green-600' : 'text-amber-600'
                    } />
                    <div>
                        <p className={`font-medium ${
                            statusInfo.color === 'green' ? 'text-green-900' : 'text-amber-900'
                        }`}>
                            {statusInfo.status}
                        </p>
                        <p className={`text-sm mt-1 ${
                            statusInfo.color === 'green' ? 'text-green-700' : 'text-amber-700'
                        }`}>
                            {statusInfo.message}
                        </p>
                    </div>
                </div>

                {/* Preview Card */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    {/* Cover Image */}
                    {images.length > 0 ? (
                        <div className="aspect-video bg-gray-100 relative">
                            <img
                                src={images[0]}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                                <span className="text-white text-sm font-medium flex items-center gap-1">
                                    <Camera size={14} />
                                    {images.length}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                            <div className="text-center text-gray-400">
                                <Camera size={32} className="mx-auto mb-2" />
                                <p>No photos yet</p>
                            </div>
                        </div>
                    )}

                    {/* Details */}
                    <div className="p-5">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {newListing.title || 'Untitled Listing'}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            {newListing.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    {newListing.location}
                                </span>
                            )}
                            {newListing.capacity && (
                                <span className="flex items-center gap-1">
                                    <Users size={14} />
                                    {newListing.capacity} guests
                                </span>
                            )}
                        </div>
                        
                        {/* Key badges that guests will see */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {newListing.settings?.instantBook && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                                    <Zap size={12} /> Instant Book
                                </span>
                            )}
                            {newListing.requiresIdentityVerification && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                                    <BadgeCheck size={12} /> ID Verified Guests
                                </span>
                            )}
                            {newListing.cautionFee && newListing.cautionFee > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                    <Shield size={12} /> Security Deposit
                                </span>
                            )}
                            {newListing.settings?.allowRecurring && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                                    <Repeat size={12} /> Recurring OK
                                </span>
                            )}
                        </div>

                        {newListing.price ? (
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-gray-900">
                                    ₦{newListing.price.toLocaleString()}
                                </span>
                                <span className="text-gray-500">/ {priceLabel}</span>
                            </div>
                        ) : (
                            <p className="text-gray-400">No price set</p>
                        )}
                    </div>
                </div>

                {/* Completion Checklist */}
                <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-3">Listing checklist</h4>
                    <div className="space-y-2">
                        {completionItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => setStep(item.step)}
                                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                        item.complete ? 'bg-green-500' : 'bg-gray-300'
                                    }`}>
                                        {item.complete && <CheckCircle size={12} className="text-white" />}
                                    </div>
                                    <span className={item.complete ? 'text-gray-900' : 'text-gray-500'}>
                                        {item.label}
                                    </span>
                                </div>
                                {!item.complete && (
                                    <span className="text-xs text-brand-600 font-medium">Edit</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-white border border-gray-200 rounded-xl text-center">
                        <p className="text-2xl font-bold text-gray-900">
                            {newListing.amenities?.length || 0}
                        </p>
                        <p className="text-xs text-gray-500">Amenities</p>
                    </div>
                    <div className="p-3 bg-white border border-gray-200 rounded-xl text-center">
                        <p className="text-2xl font-bold text-gray-900">
                            {newListing.houseRules?.length || 0}
                        </p>
                        <p className="text-xs text-gray-500">Rules</p>
                    </div>
                    <div className="p-3 bg-white border border-gray-200 rounded-xl text-center">
                        <p className="text-2xl font-bold text-gray-900">
                            {newListing.addOns?.length || 0}
                        </p>
                        <p className="text-xs text-gray-500">Extras</p>
                    </div>
                </div>

                {/* Booking Settings Summary */}
                <div className="p-4 bg-white border border-gray-200 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-3">Booking settings</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {/* Instant Book - Important! */}
                        <div className={`flex items-center justify-between p-2.5 rounded-lg ${
                            newListing.settings?.instantBook 
                                ? 'bg-yellow-50 border border-yellow-200' 
                                : 'bg-gray-50'
                        }`}>
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <Zap size={14} className={newListing.settings?.instantBook ? 'text-yellow-500' : 'text-gray-400'} />
                                Instant Book
                            </span>
                            <span className={`font-medium ${newListing.settings?.instantBook ? 'text-yellow-600' : 'text-gray-500'}`}>
                                {newListing.settings?.instantBook ? 'On' : 'Off'}
                            </span>
                        </div>
                        
                        {/* ID Verification - Important! */}
                        <div className={`flex items-center justify-between p-2.5 rounded-lg ${
                            newListing.requiresIdentityVerification 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-gray-50'
                        }`}>
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <BadgeCheck size={14} className={newListing.requiresIdentityVerification ? 'text-green-500' : 'text-gray-400'} />
                                ID Required
                            </span>
                            <span className={`font-medium ${newListing.requiresIdentityVerification ? 'text-green-600' : 'text-gray-500'}`}>
                                {newListing.requiresIdentityVerification ? 'Yes' : 'No'}
                            </span>
                        </div>
                        
                        {/* Security Deposit */}
                        <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <Shield size={14} className="text-gray-400" />
                                Caution Fee
                            </span>
                            <span className="font-medium text-gray-900">
                                {newListing.cautionFee ? `₦${newListing.cautionFee.toLocaleString()}` : 'None'}
                            </span>
                        </div>
                        
                        {/* Cancellation Policy */}
                        <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <FileText size={14} className="text-gray-400" />
                                Cancellation
                            </span>
                            <span className="font-medium text-gray-900 capitalize">
                                {newListing.cancellationPolicy?.toLowerCase() || 'Flexible'}
                            </span>
                        </div>
                        
                        {/* Recurring Bookings */}
                        <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <Repeat size={14} className="text-gray-400" />
                                Recurring
                            </span>
                            <span className={`font-medium ${newListing.settings?.allowRecurring ? 'text-green-600' : 'text-gray-500'}`}>
                                {newListing.settings?.allowRecurring ? 'Allowed' : 'No'}
                            </span>
                        </div>
                        
                        {/* Min Notice */}
                        <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <Clock size={14} className="text-gray-400" />
                                Notice
                            </span>
                            <span className="font-medium text-gray-900">
                                {newListing.minNotice === 0 ? 'Same day' : 
                                 newListing.minNotice === 1 ? '1 day' : 
                                 newListing.minNotice === 7 ? '1 week' : 
                                 `${newListing.minNotice || 1} days`}
                            </span>
                        </div>
                        
                        {/* Booking Window */}
                        <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <CalendarDays size={14} className="text-gray-400" />
                                Book ahead
                            </span>
                            <span className="font-medium text-gray-900">
                                {newListing.bookingWindow === 30 ? '1 month' : 
                                 newListing.bookingWindow === 90 ? '3 months' : 
                                 newListing.bookingWindow === 180 ? '6 months' : 
                                 newListing.bookingWindow === 365 ? '1 year' : '3 months'}
                            </span>
                        </div>
                        
                        {/* Space Type */}
                        <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <Home size={14} className="text-gray-400" />
                                Type
                            </span>
                            <span className="font-medium text-gray-900">
                                {newListing.type || 'Not set'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Pricing Summary */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 flex items-center gap-1.5">
                                <BanknoteIcon size={14} className="text-gray-400" />
                                Pricing Model
                            </span>
                            <span className="font-medium text-gray-900">
                                {pricingModel === PricingModel.HOURLY ? 'Per Hour' : 
                                 pricingModel === PricingModel.NIGHTLY ? 'Per Night' : 'Per Day'}
                            </span>
                        </div>
                        {newListing.pricePerExtraGuest && newListing.pricePerExtraGuest > 0 && (
                            <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                                <span>Extra guest fee</span>
                                <span>₦{newListing.pricePerExtraGuest.toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pro Tip: Calendar Management */}
                <div className="flex items-start gap-3 p-4 bg-brand-50 border border-brand-100 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                        <Lightbulb size={16} className="text-brand-600" />
                    </div>
                    <div>
                        <p className="font-medium text-brand-900 text-sm">Pro tip</p>
                        <p className="text-sm text-brand-700 mt-1">
                            After publishing, use your <strong>Calendar</strong> to block specific dates, 
                            set custom hours, or mark days as unavailable for holidays or personal use.
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
};

export default StepReview;
