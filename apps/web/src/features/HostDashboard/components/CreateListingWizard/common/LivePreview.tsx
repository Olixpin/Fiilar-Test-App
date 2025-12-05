import React from 'react';
import { Listing, PricingModel } from '@fiilar/types';
import { MapPin, Users, Star, Heart, Share2, Gift, Shield, Ban, Zap, BadgeCheck, Repeat, Eye } from 'lucide-react';

interface LivePreviewProps {
    listing: Partial<Listing>;
    currentStep: number;
}

// Helper to get price unit label
const getPriceUnitLabel = (pricingModel?: PricingModel): string => {
    switch (pricingModel) {
        case PricingModel.HOURLY:
            return 'hour';
        case PricingModel.DAILY:
            return 'day';
        case PricingModel.NIGHTLY:
        default:
            return 'night';
    }
};

const LivePreview: React.FC<LivePreviewProps> = ({ listing }) => {
    const hasImages = !!(listing.images && listing.images.length > 0);
    const hasTitle = !!(listing.title && listing.title.trim().length > 0);
    const hasLocation = !!(listing.location && listing.location.trim().length > 0);
    const hasPrice = !!(listing.price && listing.price > 0);
    const hasPricingModel = !!listing.pricingModel;
    const hasAddOns = !!(listing.addOns && listing.addOns.length > 0);
    const hasHouseRules = !!(listing.houseRules && listing.houseRules.length > 0);
    const hasCancellationPolicy = !!listing.cancellationPolicy;

    return (
        <div className="h-full bg-gray-50 rounded-2xl overflow-hidden flex flex-col">
            {/* Preview Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-white">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Live Preview</p>
            </div>

            {/* Preview Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Image Section */}
                    <div className="aspect-[16/9] bg-gray-100 relative">
                        {hasImages ? (
                            <img
                                src={listing.images![0]}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                <div className="text-center text-gray-400">
                                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center">
                                        <Eye className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-400">Preview will appear here</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Image overlay actions - only show when there are images */}
                        {hasImages && (
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button className="p-2 bg-white/90 rounded-full shadow-sm hover:bg-brand-50 transition-colors" aria-label="Save to wishlist">
                                    <Heart size={16} className="text-gray-600 hover:text-brand-600" />
                                </button>
                                <button className="p-2 bg-white/90 rounded-full shadow-sm" aria-label="Share">
                                    <Share2 size={16} className="text-gray-600" />
                                </button>
                            </div>
                        )}

                        {/* Space type badge */}
                        {listing.type && (
                            <div className="absolute bottom-3 left-3">
                                <span className="px-2 py-1 bg-white/90 rounded-full text-xs font-medium text-gray-700">
                                    {listing.type.replace(/_/g, ' ')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="p-4 space-y-3">
                        {/* Title */}
                        <div>
                            {hasTitle ? (
                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                                    {listing.title}
                                </h3>
                            ) : (
                                <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                            )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-gray-500">
                            <MapPin size={12} />
                            {hasLocation ? (
                                <span className="text-xs">{listing.location}</span>
                            ) : (
                                <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                            )}
                        </div>

                        {/* Rating placeholder */}
                        <div className="flex items-center gap-1">
                            <Star size={12} className="text-gray-900 fill-gray-900" />
                            <span className="text-xs font-medium text-gray-900">New</span>
                        </div>

                        {/* Capacity */}
                        {listing.capacity && (
                            <div className="flex items-center gap-1 text-gray-500">
                                <Users size={12} />
                                <span className="text-xs">Up to {listing.capacity} guests</span>
                            </div>
                        )}

                        {/* Booking Features Badges */}
                        {(listing.settings?.instantBook || listing.requiresIdentityVerification || listing.settings?.allowRecurring || (listing.cautionFee != null && listing.cautionFee > 0)) && (
                            <div className="flex flex-wrap gap-1.5">
                                {listing.settings?.instantBook && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                        <Zap size={10} /> Instant Book
                                    </span>
                                )}
                                {listing.requiresIdentityVerification && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                        <BadgeCheck size={10} /> ID Required
                                    </span>
                                )}
                                {listing.settings?.allowRecurring && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                        <Repeat size={10} /> Recurring OK
                                    </span>
                                )}
                                {listing.cautionFee != null && listing.cautionFee > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                        <Shield size={10} /> ₦{listing.cautionFee.toLocaleString()} deposit
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Price */}
                        <div className="pt-2 border-t border-gray-100">
                            {hasPrice ? (
                                <div className="flex items-baseline gap-1">
                                    <span className="font-semibold text-gray-900">
                                        ₦{listing.price?.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        / {getPriceUnitLabel(listing.pricingModel)}
                                    </span>
                                </div>
                            ) : hasPricingModel ? (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm text-gray-400">Set your price</span>
                                    <span className="text-xs text-gray-400">
                                        / {getPriceUnitLabel(listing.pricingModel)}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-400">
                                    Price not set
                                </div>
                            )}
                        </div>

                        {/* Amenities Preview */}
                        {listing.amenities && listing.amenities.length > 0 && (
                            <div className="pt-2 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-2">Amenities</p>
                                <div className="flex flex-wrap gap-2">
                                    {listing.amenities.slice(0, 4).map((amenity, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 bg-brand-50 rounded-full text-xs text-brand-700"
                                        >
                                            {typeof amenity === 'object' && amenity !== null ? amenity.name : String(amenity)}
                                        </span>
                                    ))}
                                    {listing.amenities.length > 4 && (
                                        <span className="px-2 py-1 text-xs text-brand-600">
                                            +{listing.amenities.length - 4} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Description Preview */}
                        {listing.description && (
                            <div className="pt-2 border-t border-gray-100">
                                <p className="text-xs text-gray-600 line-clamp-2">
                                    {listing.description}
                                </p>
                            </div>
                        )}

                        {/* Add-ons Preview */}
                        {hasAddOns && (
                            <div className="pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-1 mb-2">
                                    <Gift size={12} className="text-brand-600" />
                                    <p className="text-xs text-gray-500">Extras available</p>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {listing.addOns!.slice(0, 2).map((addOn, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
                                        >
                                            {addOn.name}
                                        </span>
                                    ))}
                                    {listing.addOns!.length > 2 && (
                                        <span className="text-xs text-gray-400">
                                            +{listing.addOns!.length - 2} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Policies Row */}
                        {(hasCancellationPolicy || hasHouseRules) && (
                            <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                                {hasCancellationPolicy && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded text-xs text-green-700">
                                        <Shield size={10} />
                                        <span className="capitalize">{listing.cancellationPolicy?.replace(/_/g, ' ')}</span>
                                    </div>
                                )}
                                {hasHouseRules && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded text-xs text-amber-700">
                                        <Ban size={10} />
                                        <span>{listing.houseRules!.length} rules</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Completion indicator */}
                <div className="mt-4 p-3 bg-white rounded-xl">
                    <p className="text-xs font-medium text-gray-500 mb-2">Completion</p>
                    <div className="space-y-1.5">
                        <ProgressItem label="Basic info" done={!!listing.type && !!listing.location && listing.location.trim().length > 0 && !!listing.address && listing.address.trim().length > 0} />
                        <ProgressItem label="Photos" done={hasImages && listing.images!.length >= 5} />
                        <ProgressItem label="Pricing" done={hasPricingModel && hasPrice} />
                        <ProgressItem label="Description" done={!!listing.title && listing.title.trim().length >= 5 && !!listing.description && listing.description.trim().length >= 20} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper component for completion indicator
const ProgressItem: React.FC<{ label: string; done: boolean }> = ({ label, done }) => (
    <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full flex items-center justify-center ${done ? 'bg-brand-500' : 'bg-gray-200'}`}>
            {done && (
                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            )}
        </div>
        <span className={`text-xs ${done ? 'text-brand-700' : 'text-gray-400'}`}>{label}</span>
    </div>
);

export default LivePreview;
