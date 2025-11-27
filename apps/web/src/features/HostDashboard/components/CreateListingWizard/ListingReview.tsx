import React from 'react';
import { Listing, ListingStatus, User, PricingModel } from '@fiilar/types';
import { useLocale } from '@fiilar/ui';
import {
    Settings, Shield, ImageIcon, MapPin, Repeat, Users, PackagePlus, CheckCircle, AlertCircle, AlertTriangle, Loader2
} from 'lucide-react';

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
    newListing, setNewListing, setStep, user, listings, isSubmitting, handleCreateListing
}) => {
    const { locale } = useLocale();
    return (
        <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">

            {/* Settings Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <Settings size={16} className="text-brand-600" /> Configuration
                    </h3>
                </div>
                <div className="p-5 space-y-5">
                    {/* Guest Requirements Toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                                <Shield size={16} className="text-gray-400" /> Require ID Verification
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 max-w-xs">
                                {newListing.requiresIdentityVerification
                                    ? "Only guests with verified Government ID can book."
                                    : "Any guest can book immediately."}
                            </p>
                        </div>
                        <button
                            onClick={() => setNewListing({ ...newListing, requiresIdentityVerification: !newListing.requiresIdentityVerification })}
                            className={`
                           relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                           ${newListing.requiresIdentityVerification ? 'bg-brand-600' : 'bg-gray-200'}
`}
                            title="Toggle ID verification requirement"
                        >
                            <span
                                className={`
inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                            ${newListing.requiresIdentityVerification ? 'translate-x-6' : 'translate-x-1'}
`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Card */}
            <div className="bg-gray-50 p-4 rounded-xl mb-4 text-left relative border border-gray-100">
                <div className="absolute top-3 right-3 z-10">
                    <span className="bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200 text-gray-500 shadow-sm uppercase tracking-wider">Preview</span>
                </div>

                <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                        {newListing.images && newListing.images[0] ? (
                            <img src={newListing.images[0]} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={24} /></div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                        <h3 className="font-bold text-base text-gray-900 truncate">{newListing.title || 'Untitled Listing'}</h3>
                        <p className="text-xs text-gray-600 flex items-center gap-1"><MapPin size={10} /> {newListing.location || 'No location'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{newListing.type}</p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                            <p className="text-brand-600 font-bold text-sm">{locale.currencySymbol}{newListing.price || 0} <span className="text-gray-400 font-normal">/ {newListing.pricingModel === PricingModel.HOURLY ? 'hr' : newListing.pricingModel === PricingModel.NIGHTLY ? 'night' : 'day'}</span></p>

                            {newListing.settings?.allowRecurring && (
                                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                                    <Repeat size={8} /> Recurring
                                </span>
                            )}
                            {newListing.requiresIdentityVerification && (
                                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                                    <Shield size={8} /> ID Req.
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                    <div className={`flex items-center gap-1 font-medium ${newListing.proofOfAddress ? 'text-green-700' : 'text-orange-600'}`}>
                        {newListing.proofOfAddress ? <><CheckCircle size={12} /> Proof of Address Verified</> : <><AlertCircle size={12} /> Missing Documentation</>}
                    </div>
                    <div className="flex flex-col items-end text-gray-500">
                        <span className="flex items-center gap-0.5"><Users size={12} /> Max {newListing.capacity || 1}</span>
                        {(newListing.addOns?.length || 0) > 0 && (
                            <span className="text-blue-600 flex items-center gap-0.5"><PackagePlus size={8} /> {newListing.addOns?.length} Extras</span>
                        )}
                    </div>
                </div>
            </div>

            {!newListing.proofOfAddress && (
                <div className="flex items-start gap-3 bg-orange-50 p-4 rounded-lg text-left text-sm text-orange-800 mb-4 border border-orange-100">
                    <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                    <p>
                        <strong>Missing Document:</strong> You haven't uploaded proof of address yet. You can save this listing as a
                        <span className="font-bold"> Draft</span> and upload it later.
                    </p>
                </div>
            )}

            {!user.kycVerified && (
                <div className="flex items-start gap-3 bg-yellow-50 p-4 rounded-lg text-left text-sm text-yellow-800 mb-4 border border-yellow-100">
                    <AlertCircle className="shrink-0 mt-0.5" size={18} />
                    <p>
                        <strong>Note:</strong> Your account is not KYC verified yet. This listing will be saved as a
                        <span className="font-bold"> Draft</span> until you verify your Government ID.
                    </p>
                </div>
            )}

            {/* Image Count Warning */}
            {(newListing.images?.length || 0) < 5 && (
                <div className="flex items-start gap-3 bg-orange-50 p-4 rounded-lg text-left text-sm text-orange-800 mb-4 border border-orange-100">
                    <ImageIcon className="shrink-0 mt-0.5" size={18} />
                    <p>
                        <strong>More photos needed:</strong> You have fewer than 5 photos. This listing will be saved as a
                        <span className="font-bold"> Draft</span> until you add more photos.
                    </p>
                </div>
            )}

            {/* Availability Warning */}
            {(!newListing.availability || Object.keys(newListing.availability).length === 0) && (
                <div className="flex items-start gap-3 bg-orange-50 p-4 rounded-lg text-left text-sm text-orange-800 mb-4 border border-orange-100">
                    <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                    <p>
                        <strong>No availability set:</strong> You haven't configured any available dates. 
                        Go back to the Availability step and apply a weekly schedule.
                    </p>
                </div>
            )}

            {user.kycVerified && newListing.proofOfAddress && (newListing.images?.length || 0) >= 5 && (
                <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg text-left text-sm text-blue-800 mb-4 border border-blue-100">
                    <CheckCircle className="shrink-0 mt-0.5" size={18} />
                    <p>
                        <strong>Ready to submit:</strong> {(newListing as any).id && listings.find(l => l.id === (newListing as any).id)?.status === ListingStatus.LIVE ?
                            'Updates will be published immediately since this listing is already live.' :
                            'Your listing will be sent for approval by our team before going live.'}
                    </p>
                </div>
            )}

            <div className="pt-6 flex gap-4">
                <button
                    onClick={() => setStep(4)}
                    className="px-8 py-4 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-all border-2 border-gray-200 hover:border-gray-300"
                >
                    Back
                </button>
                <button
                    onClick={handleCreateListing}
                    disabled={isSubmitting}
                    className="flex-1 bg-linear-to-r from-gray-900 to-gray-800 text-white py-4 rounded-xl font-bold flex justify-center items-center hover:from-black hover:to-gray-900 transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed text-lg gap-2"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (
                        user.kycVerified && newListing.proofOfAddress && newListing.price && (newListing.images?.length || 0) >= 5 ?
                            ((newListing as any).id && listings.find(l => l.id === (newListing as any).id)?.status === ListingStatus.LIVE ? 'Save Changes' : 'Submit for Approval')
                            : 'Save Draft'
                    )}
                </button>
            </div>
        </div>
    );
};

export default ListingReview;
