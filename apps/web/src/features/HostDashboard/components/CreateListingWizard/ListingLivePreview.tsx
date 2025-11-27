import React from 'react';
import { Listing, BookingType, PricingModel, CancellationPolicy } from '@fiilar/types';
import { useLocale } from '@fiilar/ui';
import {
    Sparkles, CheckCircle, Clock, ImageIcon, MapPin, Users, Repeat, Shield, PackagePlus, FileText, Calendar as CalendarIcon,
    AlertCircle, TrendingUp, Zap, Moon, Home
} from 'lucide-react';

interface ListingLivePreviewProps {
    newListing: Partial<Listing>;
    lastSaved: Date | null;
    step: number;
    setStep: (step: number) => void;
}

const ListingLivePreview: React.FC<ListingLivePreviewProps> = ({
    newListing, lastSaved, step, setStep
}) => {
    const { locale } = useLocale();
    
    return (
        <div className="hidden lg:block w-96 shrink-0">
            <div className="sticky top-24 space-y-4">
                {/* Auto-save indicator */}
                {(newListing.title || newListing.description) && (
                    <div className={`rounded-lg px-3 py-2 text-xs flex items-center gap-2 transition-all ${lastSaved && new Date().getTime() - lastSaved.getTime() < 5000
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-gray-50 border border-gray-200 text-gray-600'
                        } `}>
                        {lastSaved && new Date().getTime() - lastSaved.getTime() < 5000 ? (
                            <>
                                <CheckCircle size={12} className="animate-in fade-in" />
                                <span>Draft saved</span>
                            </>
                        ) : (
                            <>
                                <Clock size={12} />
                                <span>Auto-saving...</span>
                            </>
                        )}
                    </div>
                )}
                {/* Preview Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-linear-to-r from-brand-50 to-purple-50 px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles size={14} className="text-brand-600" /> Live Preview
                        </h3>
                    </div>
                    <div className="p-4">
                        {/* Image Preview */}
                        <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-200 mb-4">
                            {newListing.images && newListing.images[0] ? (
                                <img src={newListing.images[0]} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                    <ImageIcon size={32} className="mb-2" />
                                    <span className="text-xs">No image yet</span>
                                </div>
                            )}
                        </div>

                        {/* Title & Location */}
                        <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                            {newListing.title || 'Untitled Listing'}
                        </h3>
                        <p className="text-xs text-gray-600 flex items-center gap-1 mb-3">
                            <MapPin size={10} /> {newListing.location || 'No location set'}
                        </p>

                        {/* Description */}
                        {newListing.description && (
                            <p className="text-xs text-gray-600 mb-3 line-clamp-3">{newListing.description}</p>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-2xl font-bold text-brand-600">{locale.currencySymbol}{newListing.price || 0}</span>
                            <span className="text-sm text-gray-500">
                                / {newListing.pricingModel === PricingModel.NIGHTLY ? 'night' : 
                                   newListing.pricingModel === PricingModel.HOURLY ? 'hour' : 'day'}
                            </span>
                        </div>

                        {/* Pricing Model Badge */}
                        {newListing.pricingModel && (
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                                    newListing.pricingModel === PricingModel.NIGHTLY 
                                        ? 'bg-indigo-100 text-indigo-700' 
                                        : newListing.pricingModel === PricingModel.HOURLY 
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-teal-100 text-teal-700'
                                }`}>
                                    {newListing.pricingModel === PricingModel.NIGHTLY && <><Moon size={10} /> Overnight</>}
                                    {newListing.pricingModel === PricingModel.DAILY && <><CalendarIcon size={10} /> Full Day</>}
                                    {newListing.pricingModel === PricingModel.HOURLY && <><Clock size={10} /> Hourly</>}
                                </span>
                                {newListing.settings?.instantBook && (
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full flex items-center gap-1">
                                        <Zap size={10} /> Instant
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Guest & Fee Info - Only show if tiered pricing (extra guest fee > 0) or has security deposit */}
                        {(Number(newListing.pricePerExtraGuest) > 0 || Number(newListing.cautionFee) > 0) && (
                            <div className="text-xs text-gray-600 mb-3 space-y-1">
                                {/* Only show included guests when tiered pricing is active (has extra guest fee) */}
                                {Number(newListing.pricePerExtraGuest) > 0 && Number(newListing.includedGuests) > 0 && (
                                    <p>Base price includes {newListing.includedGuests} {newListing.includedGuests === 1 ? 'guest' : 'guests'}</p>
                                )}
                                {Number(newListing.pricePerExtraGuest) > 0 && (
                                    <p>+{locale.currencySymbol}{newListing.pricePerExtraGuest} per extra guest</p>
                                )}
                                {Number(newListing.cautionFee) > 0 && (
                                    <p className="flex items-center gap-1">
                                        <Shield size={10} /> {locale.currencySymbol}{newListing.cautionFee} security deposit
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <Home size={10} /> {newListing.type}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <Users size={10} /> Max {newListing.capacity || 1}
                            </span>
                            {newListing.settings?.allowRecurring && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                                    <Repeat size={10} /> Recurring
                                </span>
                            )}
                            {newListing.requiresIdentityVerification && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                                    <Shield size={10} /> ID Required
                                </span>
                            )}
                        </div>

                        {/* Amenities */}
                        {(newListing.amenities?.length || 0) > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {newListing.amenities?.slice(0, 4).map((amenity, idx) => (
                                    <span key={idx} className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                        {amenity.name}
                                    </span>
                                ))}
                                {(newListing.amenities?.length || 0) > 4 && (
                                    <span className="text-[10px] text-gray-400">+{newListing.amenities!.length - 4} more</span>
                                )}
                            </div>
                        )}

                        {/* Cancellation Policy */}
                        {newListing.cancellationPolicy && (
                            <div className="text-xs text-gray-500 mb-3">
                                <span className="font-medium">Cancellation:</span> {
                                    newListing.cancellationPolicy === CancellationPolicy.FLEXIBLE ? 'Flexible' :
                                    newListing.cancellationPolicy === CancellationPolicy.MODERATE ? 'Moderate' :
                                    newListing.cancellationPolicy === CancellationPolicy.STRICT ? 'Strict' : 'Non-refundable'
                                }
                            </div>
                        )}

                        {/* Extras */}
                        {(newListing.addOns?.length || 0) > 0 && (
                            <div className="border-t border-gray-100 pt-3 mb-3">
                                <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                    <PackagePlus size={12} /> Optional Extras ({newListing.addOns?.length})
                                </p>
                                <div className="space-y-1">
                                    {newListing.addOns?.slice(0, 3).map(addon => (
                                        <div key={addon.id} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                {addon.image && (
                                                    <img src={addon.image} alt={addon.name} className="w-6 h-6 rounded object-cover border border-gray-200" />
                                                )}
                                                <span className="text-gray-600">{addon.name}</span>
                                            </div>
                                            <span className="font-semibold text-gray-900">{locale.currencySymbol}{addon.price}</span>
                                        </div>
                                    ))}
                                    {(newListing.addOns?.length || 0) > 3 && (
                                        <p className="text-xs text-gray-400 italic">+{newListing.addOns!.length - 3} more</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Status Indicators */}
                        <div className="border-t border-gray-100 pt-3 space-y-2">
                            <div className={`flex items-center gap-2 text-xs ${newListing.proofOfAddress ? 'text-green-700' : 'text-orange-600'
                                } `}>
                                {newListing.proofOfAddress ? (
                                    <><CheckCircle size={12} /> Proof verified</>
                                ) : (
                                    <><AlertCircle size={12} /> Missing proof</>
                                )}
                            </div>
                            {newListing.images && newListing.images.length > 0 && (
                                <div className="flex items-center gap-2 text-xs text-green-700">
                                    <CheckCircle size={12} /> {newListing.images.length} photo{newListing.images.length !== 1 ? 's' : ''}
                                </div>
                            )}
                            {(newListing.houseRules?.length || 0) > 0 && (
                                <div className="flex items-center gap-2 text-xs text-green-700">
                                    <CheckCircle size={12} /> {newListing.houseRules?.length} house rule{newListing.houseRules?.length !== 1 ? 's' : ''}
                                </div>
                            )}
                            {(newListing.safetyItems?.length || 0) > 0 && (
                                <div className="flex items-center gap-2 text-xs text-green-700">
                                    <CheckCircle size={12} /> {newListing.safetyItems?.length} safety item{newListing.safetyItems?.length !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Completion Progress */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Completion</h4>
                    <div className="space-y-2">
                        {[
                            { label: 'Basic Info', done: !!(newListing.title && newListing.location && newListing.price && newListing.pricingModel) },
                            { label: 'Photos (5+)', done: (newListing.images?.length || 0) >= 5 },
                            { label: 'Availability', done: Object.keys(newListing.availability || {}).length > 0 },
                            { label: 'Verification', done: !!newListing.proofOfAddress }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                                <span className={item.done ? 'text-gray-900' : 'text-gray-400'}>{item.label}</span>
                                {item.done ? (
                                    <CheckCircle size={14} className="text-green-600" />
                                ) : (
                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Estimated Earnings */}
                {newListing.price && Object.keys(newListing.availability || {}).length > 0 && (
                    <div className="bg-linear-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <TrendingUp size={14} className="text-green-600" /> Potential Earnings
                        </h4>
                        <div className="space-y-1 text-xs text-gray-700">
                            <div className="flex justify-between">
                                <span>Per booking:</span>
                                <span className="font-bold">{locale.currencySymbol}{newListing.price}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Available days:</span>
                                <span className="font-bold">{Object.keys(newListing.availability || {}).length}</span>
                            </div>
                            <div className="border-t border-green-200 pt-2 mt-2 flex justify-between">
                                <span>Est. monthly:</span>
                                <span className="font-bold text-green-700">{locale.currencySymbol}{Math.round((newListing.price || 0) * Math.min(Object.keys(newListing.availability || {}).length, 30) * 0.3)}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">*Based on 30% booking rate</p>
                        </div>
                    </div>
                )}

                {/* Quick Jump Links */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Quick Jump</h4>
                    <div className="space-y-1">
                        {[
                            { step: 1, label: 'Details', icon: FileText },
                            { step: 2, label: 'Photos', icon: ImageIcon },
                            { step: 3, label: 'Availability', icon: CalendarIcon },
                            { step: 4, label: 'Verification', icon: Shield },
                            { step: 5, label: 'Review', icon: CheckCircle }
                        ].map((item) => (
                            <button
                                key={item.step}
                                onClick={() => setStep(item.step)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${step === item.step ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                                    } `}
                                title={`Go to ${item.label} `}
                            >
                                <item.icon size={14} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingLivePreview;
