import React from 'react';
import { Listing, ListingStatus, BookingType } from '@fiilar/types';
import { Button, useLocale } from '@fiilar/ui';
import { Home, UserCheck, MapPin, DollarSign, Users, Briefcase, AlertTriangle, Edit3, Trash2 } from 'lucide-react';

interface HostListingsProps {
    listings: Listing[];
    onEdit: (listing: Listing) => void;
    onDelete: (id: string, status: ListingStatus) => void;
    onCreate: () => void;
}

const HostListings: React.FC<HostListingsProps> = ({ listings, onEdit, onDelete, onCreate }) => {
    const { locale } = useLocale();
    return (
        <div className="space-y-4 animate-in fade-in">
            {listings.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Home size={32} className="text-gray-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">No listings yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Start earning by listing your apartment, studio, or event space on Fiilar.</p>
                    <Button onClick={onCreate} variant="primary">Create listing</Button>
                </div>
            ) : (
                listings.map(listing => (
                    <div key={listing.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 items-start md:items-center group hover:border-gray-300 hover:shadow-sm transition-all">
                        <div className="w-full md:w-32 h-32 md:h-24 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative">
                            <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                            {listing.requiresIdentityVerification && (
                                <div className="absolute top-1 left-1 bg-white/90 p-1 rounded-md shadow-sm" title="ID Required">
                                    <UserCheck size={12} className="text-blue-700" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                            <div className="flex items-center justify-between md:justify-start gap-2 mb-1">
                                <h3 className="font-bold text-gray-900 truncate text-lg md:text-base">{listing.title}</h3>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap ${listing.status === ListingStatus.LIVE ? 'bg-green-50 text-green-700 border-green-200' :
                                    listing.status === ListingStatus.PENDING_APPROVAL ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                        listing.status === ListingStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-gray-100 text-gray-500 border-gray-200'
                                    }`}>
                                    {listing.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate mb-2 flex items-center gap-1"><MapPin size={12} /> {listing.location}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-gray-600">
                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><DollarSign size={12} /> {locale.currencySymbol}{listing.price}/{listing.priceUnit === BookingType.HOURLY ? 'hr' : 'day'}</span>
                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Users size={12} /> Max {listing.capacity || 1}</span>
                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Briefcase size={12} /> {listing.type}</span>
                            </div>
                            {listing.rejectionReason && (
                                <div className="mt-3 text-xs bg-red-50 text-red-800 p-2 rounded border border-red-100 flex items-start gap-2">
                                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                    <span><strong>Action Required:</strong> {listing.rejectionReason}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex md:flex-col items-center gap-2 self-end md:self-center w-full md:w-auto mt-2 md:mt-0">
                            <Button
                                onClick={() => onEdit(listing)}
                                variant="outline"
                                size="sm"
                                className="flex-1 md:flex-none justify-center"
                            >
                                <Edit3 size={16} /> <span className="md:hidden ml-2">Edit</span>
                            </Button>
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(listing.id, listing.status);
                                }}
                                variant="danger"
                                size="sm"
                                className="flex-1 md:flex-none justify-center"
                            >
                                <Trash2 size={16} /> <span className="md:hidden ml-2">Delete</span>
                            </Button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default HostListings;
