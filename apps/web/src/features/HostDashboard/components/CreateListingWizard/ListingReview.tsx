import React, { useState } from 'react';
import { Listing, User } from '@fiilar/types';
import { Button, useToast } from '@fiilar/ui';
import { CheckCircle, MapPin, Shield, ArrowRight, Loader2, PartyPopper, PackagePlus } from 'lucide-react';

interface ListingReviewProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    setStep: (step: number) => void;
    user: User;
    listings: Listing[];
    isSubmitting: boolean;
    handleCreateListing: () => void;
}

const ListingReview: React.FC<ListingReviewProps> = ({
    newListing, setStep, isSubmitting, handleCreateListing
}) => {
    const { showToast } = useToast();
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handlePublish = () => {
        if (!agreedToTerms) {
            showToast({ message: "Please agree to the terms and conditions", type: "error" });
            return;
        }
        handleCreateListing();
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-purple-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-500/20 animate-in zoom-in duration-500">
                    <CheckCircle size={40} />
                </div>
                <h3 className="font-bold text-3xl text-gray-900 tracking-tight">Ready to Publish?</h3>
                <p className="text-gray-500 text-lg mt-2 max-w-lg mx-auto">
                    Review your listing details one last time before making it live for guests to book.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Listing Preview Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card rounded-3xl overflow-hidden border border-white/40 shadow-xl shadow-brand-900/5 group hover:shadow-2xl transition-all duration-500">
                        <div className="relative h-64 md:h-80 overflow-hidden">
                            {newListing.images && newListing.images.length > 0 ? (
                                <img
                                    src={newListing.images[0]}
                                    alt={newListing.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400">No image</span>
                                </div>
                            )}
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-brand-700 shadow-lg">
                                ${newListing.price} <span className="text-gray-500 font-normal">/ {newListing.priceUnit}</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-20">
                                <h4 className="text-2xl font-bold text-white mb-1">{newListing.title}</h4>
                                <div className="flex items-center text-white/90 text-sm">
                                    <MapPin size={14} className="mr-1" /> {newListing.location}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 space-y-6 bg-white/60 backdrop-blur-md">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/50 rounded-2xl border border-white/60">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Type</span>
                                    <p className="font-semibold text-gray-900 mt-1">{newListing.type}</p>
                                </div>
                                <div className="p-4 bg-white/50 rounded-2xl border border-white/60">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Capacity</span>
                                    <p className="font-semibold text-gray-900 mt-1">{newListing.capacity} Guests</p>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Description</span>
                                <p className="text-gray-600 leading-relaxed text-sm line-clamp-3">
                                    {newListing.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {newListing.amenities?.slice(0, 5).map((amenity, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
                                        {amenity.name}
                                    </span>
                                ))}
                                {(newListing.amenities?.length || 0) > 5 && (
                                    <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-medium border border-gray-200">
                                        +{(newListing.amenities?.length || 0) - 5} more
                                    </span>
                                )}
                            </div>

                            {(newListing.addOns?.length || 0) > 0 && (
                                <div className="pt-4 border-t border-gray-200/50">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Extras</span>
                                    <div className="flex items-center gap-2 text-brand-600 font-medium text-sm">
                                        <PackagePlus size={16} />
                                        {newListing.addOns?.length} Add-on{newListing.addOns?.length !== 1 ? 's' : ''} configured
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Sidebar */}
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-3xl border border-white/40 shadow-lg bg-white/40">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield size={18} className="text-brand-600" />
                            Host Protection
                        </h4>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                                <span>$1M Liability Insurance included</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                                <span>Guest identity verification</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                                <span>24/7 Support for hosts</span>
                            </li>
                        </ul>
                    </div>

                    <div className="glass-card p-6 rounded-3xl border border-white/40 shadow-lg bg-white/40">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-brand-500 checked:bg-brand-500 hover:border-brand-400"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                />
                                <CheckCircle size={14} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
                            </div>
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                I agree to the <a href="#" className="text-brand-600 hover:underline font-medium">Host Terms & Conditions</a> and confirm that all information provided is accurate.
                            </span>
                        </label>
                    </div>

                    <Button
                        onClick={handlePublish}
                        disabled={isSubmitting || !agreedToTerms}
                        variant="primary"
                        size="lg"
                        className="w-full py-4 text-lg shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 transition-all hover:scale-[1.02] relative overflow-hidden group"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin" size={20} /> Publishing...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <PartyPopper size={20} className="group-hover:animate-bounce" /> Publish Listing
                            </div>
                        )}
                        {/* Shine effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>
                    </Button>

                    <Button
                        onClick={() => setStep(4)}
                        variant="ghost"
                        className="w-full text-gray-500 hover:text-gray-900"
                    >
                        Back to Verification
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ListingReview;
