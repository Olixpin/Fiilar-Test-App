import React from 'react';
import { User, Listing } from '@fiilar/types';
import { Star, CheckCircle, MessageSquare, User as UserIcon, ShieldCheck, Award } from 'lucide-react';
import { getReviews } from '@fiilar/reviews';

interface HostSidebarCardProps {
    listing: Listing;
    host?: User;
    handleContactHost: () => void;
}

export const HostProfileCard: React.FC<HostSidebarCardProps> = ({ listing, host, handleContactHost }) => {
    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-200/50">
            <div className="flex items-start justify-between mb-8">
                <div className="relative group cursor-pointer">
                    <div className="absolute -inset-1 bg-linear-to-br from-brand-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-md"></div>
                    {host?.avatar ? (
                        <img src={host.avatar} alt={host.name} className="relative w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                    ) : (
                        <div className="relative w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                            <UserIcon size={40} className="text-gray-400" />
                        </div>
                    )}
                    {host?.kycVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-brand-600 text-white p-1.5 rounded-full border-4 border-white shadow-sm" title="Verified Host">
                            <ShieldCheck size={16} strokeWidth={3} />
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <h3 className="font-bold text-xl text-gray-900 mb-1">{host?.name || 'Unknown Host'}</h3>
                    <p className="text-sm font-medium text-gray-500">Joined {new Date().getFullYear()}</p>
                    {/* Host Badge */}
                    {host?.badgeStatus === 'super_host' && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-full shadow-sm">
                            <Award size={12} />
                            SUPERHOST
                        </div>
                    )}
                    {host?.badgeStatus === 'premium' && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-linear-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-sm">
                            <Award size={12} />
                            PREMIUM HOST
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-5 mb-8">
                {/* Reviews Stat */}
                {getReviews(listing.id).length > 0 && (
                    <div className="flex items-center gap-4 text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                            <Star size={20} className="text-yellow-500 fill-yellow-500" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{getReviews(listing.id).length} Reviews</p>
                            <p className="text-xs text-gray-500">
                                {(host?.rating || 0) >= 4.8 ? 'Consistent 5-star ratings' : 'Verified reviews'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Identity Verified */}
                {host?.kycVerified && (
                    <div className="flex items-center gap-4 text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                            <CheckCircle size={20} className="text-green-600" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">Identity Verified</p>
                            <p className="text-xs text-gray-500">Trusted community member</p>
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={handleContactHost}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3"
            >
                <MessageSquare size={20} />
                Contact Host
            </button>
        </div>
    );
};

export const LocationPreviewCard: React.FC = () => {
    return (
        <div className="group relative rounded-3xl overflow-hidden border border-gray-200 shadow-lg h-64 cursor-pointer">
            <img
                src="https://placehold.co/600x400/e2e8f0/94a3b8?text=Map+View"
                alt="Location Map"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>

            {/* Privacy Circle (Approximate Location) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative flex items-center justify-center">
                    {/* Outer fade circle */}
                    <div className="w-32 h-32 bg-brand-500/10 rounded-full animate-pulse absolute"></div>
                    {/* Inner privacy circle */}
                    <div className="w-16 h-16 bg-brand-500/20 border-2 border-brand-500/50 rounded-full backdrop-blur-[1px] shadow-lg"></div>
                </div>
            </div>

            {/* Bottom Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-gray-900 text-sm">Approximate location</p>
                        <p className="text-xs text-gray-500">Exact location provided after booking</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                        <ShieldCheck size={16} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const HostSidebarCard: React.FC<HostSidebarCardProps> = (props) => {
    return (
        <div className="space-y-8">
            <HostProfileCard {...props} />
            <LocationPreviewCard />
        </div>
    );
};
