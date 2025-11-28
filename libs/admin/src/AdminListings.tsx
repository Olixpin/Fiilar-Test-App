import React, { useState } from 'react';
import { Listing, User, ListingStatus, SpaceType, PricingModel, BookingType } from '@fiilar/types';
import { CheckCircle, Home, MapPin, FileText, X, Check, Grid, List, Search, Trash2, AlertTriangle, Camera } from 'lucide-react';
import { Button, Badge, ConfirmDialog } from '@fiilar/ui';
import { useLocale } from '@fiilar/ui';
import { cn } from '@fiilar/utils';

interface AdminListingsProps {
    listings: Listing[];
    users: User[];
    handleApproveListing: (listing: Listing, approve: boolean, reason?: string) => void;
    handleDeleteListing: (listingId: string) => void;
    openRejectionModal: (id: string) => void;
    rejectionModal: { isOpen: boolean, listingId: string | null, reason: string };
    setRejectionModal: (modal: { isOpen: boolean, listingId: string | null, reason: string }) => void;
    handleRejectionSubmit: () => void;
    presetPhotographyOffer: () => void;
}

export const AdminListings: React.FC<AdminListingsProps> = ({
    listings,
    users,
    handleApproveListing,
    handleDeleteListing,
    openRejectionModal,
    rejectionModal,
    setRejectionModal,
    handleRejectionSubmit,
    presetPhotographyOffer
}) => {
    const { locale } = useLocale();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'live' | 'rejected' | 'deleted'>('all');
    const [typeFilter, setTypeFilter] = useState<SpaceType | 'all'>('all');
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, listingId: string | null }>({
        isOpen: false,
        listingId: null
    });

    const handleConfirmDelete = () => {
        if (deleteConfirmation.listingId) {
            handleDeleteListing(deleteConfirmation.listingId);
            setDeleteConfirmation({ isOpen: false, listingId: null });
        }
    };

    const filteredListings = listings.filter(l => {
        const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.location.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all'
            ? l.status !== ListingStatus.DELETED // Don't show deleted in 'all' by default
            : statusFilter === 'pending'
                ? l.status === ListingStatus.PENDING_APPROVAL
                : statusFilter === 'live'
                    ? l.status === ListingStatus.LIVE
                    : statusFilter === 'rejected'
                        ? l.status === ListingStatus.REJECTED
                        : l.status === ListingStatus.DELETED;

        const matchesType = typeFilter === 'all' || l.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    // Sort: Pending first, then newest
    filteredListings.sort((a, b) => {
        if (a.status === ListingStatus.PENDING_APPROVAL && b.status !== ListingStatus.PENDING_APPROVAL) return -1;
        if (a.status !== ListingStatus.PENDING_APPROVAL && b.status === ListingStatus.PENDING_APPROVAL) return 1;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    const getStatusBadge = (status: ListingStatus) => {
        switch (status) {
            case ListingStatus.LIVE:
                return <Badge variant="success" className="bg-green-100 text-green-700 border-green-200">Live</Badge>;
            case ListingStatus.PENDING_APPROVAL:
                return <Badge variant="warning" className="bg-orange-100 text-orange-700 border-orange-200">Pending</Badge>;
            case ListingStatus.REJECTED:
                return <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
            case ListingStatus.DELETED:
                return <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">Deleted</Badge>;
            default:
                return <Badge variant="outline">Draft</Badge>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="glass-card p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Listings Manager</h2>
                        <p className="text-sm text-gray-500 mt-1">Review, approve, and manage all property listings</p>
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

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6 border-b border-gray-100 pb-4 overflow-x-auto">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-2">
                        {(['all', 'pending', 'live', 'rejected', 'deleted'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap border",
                                    statusFilter === status
                                        ? "border-brand-200 bg-brand-50 text-brand-700 shadow-sm"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                )}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                <span className={cn(
                                    "ml-2 text-xs px-1.5 py-0.5 rounded-full",
                                    statusFilter === status ? "bg-brand-200 text-brand-800" : "bg-gray-100 text-gray-600"
                                )}>
                                    {status === 'all' ? listings.filter(l => l.status !== ListingStatus.DELETED).length :
                                        status === 'pending' ? listings.filter(l => l.status === ListingStatus.PENDING_APPROVAL).length :
                                            status === 'live' ? listings.filter(l => l.status === ListingStatus.LIVE).length :
                                                status === 'rejected' ? listings.filter(l => l.status === ListingStatus.REJECTED).length :
                                                    listings.filter(l => l.status === ListingStatus.DELETED).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Type Filter */}
                    <div className="sm:ml-auto">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as SpaceType | 'all')}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                        >
                            <option value="all">All Types</option>
                            {Object.values(SpaceType).map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {filteredListings.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Home size={32} className="text-gray-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">No listings found</h3>
                    <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && filteredListings.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredListings.map(l => (
                        <div key={l.id} className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                            <div className="relative h-48 overflow-hidden shrink-0">
                                <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                <div className="absolute top-2 right-2">
                                    {getStatusBadge(l.status)}
                                </div>
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md text-white text-xs font-bold rounded">{l.type}</div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-900 mb-1 truncate">{l.title}</h3>
                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                    <MapPin size={14} className="mr-1" /> {l.location}
                                </div>
                                <div className="text-lg font-bold text-brand-600 mb-4">
                                    {locale.currencySymbol}{l.price} <span className="text-sm font-normal text-gray-400">/ {
                                        (l.pricingModel === PricingModel.HOURLY || l.priceUnit === BookingType.HOURLY) ? 'hr' :
                                            l.pricingModel === PricingModel.DAILY ? 'day' :
                                                'night'
                                    }</span>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                                    {l.status === ListingStatus.PENDING_APPROVAL ? (
                                        <>
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
                                        </>
                                    ) : l.status === ListingStatus.DELETED ? (
                                        <div className="w-full text-center text-xs text-gray-500 italic py-2">
                                            Archived
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                            onClick={() => setDeleteConfirmation({ isOpen: true, listingId: l.id })}
                                            leftIcon={<Trash2 size={14} />}
                                        >
                                            Delete Listing
                                        </Button>
                                    )}
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
                            <div className="flex gap-4">
                                <img src={l.images[0]} alt="" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xl font-bold text-gray-900">{l.title}</h3>
                                        {getStatusBadge(l.status)}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                        <MapPin size={14} className="mr-1" /> {l.location}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Host: <span className="font-medium text-gray-700">{users.find(u => u.id === l.hostId)?.name || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-lg font-bold text-brand-600">{locale.currencySymbol}{l.price} <span className="text-sm font-normal text-gray-400">/ {
                                    (l.pricingModel === PricingModel.HOURLY || l.priceUnit === BookingType.HOURLY) ? 'hr' :
                                        l.pricingModel === PricingModel.DAILY ? 'day' :
                                            'night'
                                }</span></span>
                                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">{l.type}</span>
                            </div>
                        </div>

                        {l.proofOfAddress && (
                            <div className="mb-4 flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-200 ml-[112px]">
                                <CheckCircle size={16} className="text-green-600" />
                                <span className="text-xs font-medium text-green-700">Address verified</span>
                                <a href={l.proofOfAddress} target="_blank" rel="noreferrer" className="ml-auto text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                    <FileText size={12} /> View Document
                                </a>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-4">
                            {l.status === ListingStatus.PENDING_APPROVAL ? (
                                <>
                                    <Button
                                        variant="outline"
                                        className="border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => openRejectionModal(l.id)}
                                        leftIcon={<X size={16} />}
                                    >
                                        Decline
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                        onClick={() => handleApproveListing(l, true)}
                                        leftIcon={<Check size={16} />}
                                    >
                                        Approve
                                    </Button>
                                </>
                            ) : l.status === ListingStatus.DELETED ? (
                                <div className="text-sm text-gray-500 italic">
                                    This listing has been deleted
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => setDeleteConfirmation({ isOpen: true, listingId: l.id })}
                                    leftIcon={<Trash2 size={16} />}
                                >
                                    Delete Listing
                                </Button>
                            )}
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

            <ConfirmDialog
                isOpen={deleteConfirmation.isOpen}
                title="Delete Listing"
                message="Are you sure you want to delete this listing? This action cannot be undone and the listing will be moved to the archives."
                confirmText="Delete Listing"
                variant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteConfirmation({ isOpen: false, listingId: null })}
            />
        </div>
    );
};
