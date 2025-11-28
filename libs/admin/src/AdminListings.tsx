import React, { useState } from 'react';
import { Listing, User, ListingStatus } from '@fiilar/types';
import { Filter, Clock, CheckCircle, Home, MapPin, FileText, X, Check, AlertTriangle, Camera, Grid, List, Search } from 'lucide-react';
import { Button } from '@fiilar/ui';
import { useLocale } from '@fiilar/ui';

interface AdminListingsProps {
    pendingListings: Listing[];
    listings: Listing[];
    users: User[];
    handleApproveListing: (listing: Listing, approve: boolean, reason?: string) => void;
    openRejectionModal: (id: string) => void;
    rejectionModal: { isOpen: boolean, listingId: string | null, reason: string };
    setRejectionModal: (modal: { isOpen: boolean, listingId: string | null, reason: string }) => void;
    handleRejectionSubmit: () => void;
    presetPhotographyOffer: () => void;
}

export const AdminListings: React.FC<AdminListingsProps> = ({
    pendingListings,
    listings,
    users,
    handleApproveListing,
    openRejectionModal,
    rejectionModal,
    setRejectionModal,
    handleRejectionSubmit,
    presetPhotographyOffer
}) => {
    const { locale } = useLocale();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredListings = pendingListings.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="glass-card p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Listing Approvals</h2>
                        <p className="text-sm text-gray-500 mt-1">Review and approve property listings</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search listings..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
                                title="List View"
                            >
                                <List size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
                                title="Grid View"
                            >
                                <Grid size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-5 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</h3>
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-700 group-hover:scale-110 transition-transform">
                            <Clock size={18} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{pendingListings.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                </div>
                <div className="glass-card p-5 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live</h3>
                        <div className="bg-green-100 p-2 rounded-lg text-green-700 group-hover:scale-110 transition-transform">
                            <CheckCircle size={18} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{listings.filter(l => l.status === ListingStatus.LIVE).length}</p>
                    <p className="text-xs text-gray-500 mt-1">Active listings</p>
                </div>
                <div className="glass-card p-5 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</h3>
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-700 group-hover:scale-110 transition-transform">
                            <Home size={18} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
                    <p className="text-xs text-gray-500 mt-1">All listings</p>
                </div>
            </div>

            {filteredListings.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Home size={32} className="text-gray-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">No pending listings</h3>
                    <p className="text-sm text-gray-500">All listings have been reviewed ✓</p>
                </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && filteredListings.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredListings.map(l => (
                        <div key={l.id} className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 group">
                            <div className="relative h-48 overflow-hidden">
                                <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">{l.type}</div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 mb-1 truncate">{l.title}</h3>
                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                    <MapPin size={14} className="mr-1" /> {l.location}
                                </div>
                                <div className="text-lg font-bold text-brand-600 mb-3">
                                    {locale.currencySymbol}{l.price} <span className="text-sm font-normal text-gray-400">/ {l.priceUnit}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => openRejectionModal(l.id)}
                                        leftIcon={<X size={14} />}
                                        className="flex-1"
                                    >
                                        Decline
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        className="flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                        onClick={() => handleApproveListing(l, true)}
                                        leftIcon={<Check size={14} />}
                                    >
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && filteredListings.map(l => (
                <div key={l.id} className="glass-card overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{l.title}</h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <MapPin size={14} className="mr-1" /> {l.location}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-lg font-bold text-brand-600">{locale.currencySymbol}{l.price} <span className="text-sm font-normal text-gray-400">/ {l.priceUnit}</span></span>
                                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">{l.type}</span>
                            </div>
                        </div>

                        {l.proofOfAddress && (
                            <div className="mb-4 flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
                                <CheckCircle size={16} className="text-green-600" />
                                <span className="text-xs font-medium text-green-700">Address verified</span>
                                <a href={l.proofOfAddress} target="_blank" rel="noreferrer" className="ml-auto text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                    <FileText size={12} /> View Document
                                </a>
                            </div>
                        )}

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{l.description}</p>

                        <div className="mb-4">
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {l.images.map((img, i) => (
                                    <img key={i} src={img} alt="" className="h-24 w-36 object-cover rounded-lg border border-gray-200 shrink-0 hover:scale-105 transition-transform" />
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-gray-100 pt-4">
                            <div className="text-sm text-gray-500">
                                Host: <span className="font-medium text-gray-700">{users.find(u => u.id === l.hostId)?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => openRejectionModal(l.id)}
                                    leftIcon={<X size={16} />}
                                >
                                    Decline
                                </Button>
                                <Button
                                    variant="primary"
                                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                    onClick={() => handleApproveListing(l, true)}
                                    leftIcon={<Check size={16} />}
                                >
                                    Approve
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Rejection Modal */}
            {rejectionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-red-600 flex items-center gap-2">
                                <AlertTriangle size={20} /> Decline Listing
                            </h3>
                            <button onClick={() => setRejectionModal({ isOpen: false, listingId: null, reason: '' })} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">Please provide a reason for declining this listing. This will be sent to the host.</p>

                            <textarea
                                className="w-full border-2 border-gray-300 rounded-lg p-3 text-sm h-32 mb-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                placeholder="Reason for rejection..."
                                value={rejectionModal.reason}
                                onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                            />

                            <Button
                                variant="ghost"
                                onClick={presetPhotographyOffer}
                                className="w-full mb-4 flex items-center justify-center gap-2 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 py-2.5 rounded-lg hover:bg-brand-100 transition"
                                leftIcon={<Camera size={14} />}
                            >
                                Bad Photos? Offer Free Photography
                            </Button>

                            <div className="flex gap-3 mt-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setRejectionModal({ isOpen: false, listingId: null, reason: '' })}
                                    className="flex-1 text-gray-500 hover:bg-gray-100"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleRejectionSubmit}
                                    disabled={!rejectionModal.reason}
                                    className="flex-1"
                                >
                                    Confirm Decline
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
