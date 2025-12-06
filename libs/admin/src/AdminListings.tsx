import React, { useState, useEffect } from 'react';
import { Listing, User, ListingStatus, PricingModel } from '@fiilar/types';
import { CheckCircle, Home, MapPin, FileText, X, Check, Search, Trash2, Camera, ChevronLeft, ChevronRight, Mail, Phone, Clock, Sparkles, ShieldCheck, Eye, AlertTriangle, Shield } from 'lucide-react';
import { Button, ConfirmDialog, useToast } from '@fiilar/ui';
import { useLocale } from '@fiilar/ui';
import { cn } from '@fiilar/utils';

// Helper component for host avatars
const HostAvatar = ({ host, size = 'md' }: { host: User; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-lg'
    };
    
    if (host.avatar) {
        return <img src={host.avatar} alt={host.name} className={cn("rounded-full object-cover", sizeClasses[size])} />;
    }
    
    return (
        <div className={cn(
            "bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium",
            sizeClasses[size]
        )}>
            {host.name.charAt(0).toUpperCase()}
        </div>
    );
};

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

type TabType = 'all' | 'pending' | 'live' | 'rejected';

export const AdminListings: React.FC<AdminListingsProps> = ({
    listings,
    users,
    handleApproveListing,
    handleDeleteListing,
    openRejectionModal,
    rejectionModal,
    setRejectionModal,
    handleRejectionSubmit,
}) => {
    const { locale } = useLocale();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
    const [detailTab, setDetailTab] = useState('details');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, listingId: string | null }>({
        isOpen: false,
        listingId: null
    });

    // Wrapper to add toast notifications for approve/reject
    const handleApproveWithToast = (listing: Listing, approve: boolean, reason?: string) => {
        handleApproveListing(listing, approve, reason);
        if (approve) {
            showToast({ message: `"${listing.title}" has been approved and is now live`, type: 'success' });
        } else {
            showToast({ message: `"${listing.title}" has been rejected`, type: 'info' });
        }
        setSelectedListing(null);
    };

    // Wrapper to add toast notifications for delete
    const handleDeleteWithToast = (listingId: string) => {
        const listing = listings.find(l => l.id === listingId);
        handleDeleteListing(listingId);
        showToast({ message: `"${listing?.title || 'Listing'}" has been deleted`, type: 'success' });
    };

    const handleConfirmDelete = () => {
        if (deleteConfirmation.listingId) {
            handleDeleteWithToast(deleteConfirmation.listingId);
            setDeleteConfirmation({ isOpen: false, listingId: null });
        }
    };

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedListing) {
                setSelectedListing(null);
            }
        };
        
        if (selectedListing) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [selectedListing]);

    const getFilteredListings = () => {
        let filtered = listings.filter(l => {
            const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.location.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });

        switch (activeTab) {
            case 'pending':
                filtered = filtered.filter(l => l.status === ListingStatus.PENDING_APPROVAL);
                break;
            case 'live':
                filtered = filtered.filter(l => l.status === ListingStatus.LIVE);
                break;
            case 'rejected':
                filtered = filtered.filter(l => l.status === ListingStatus.REJECTED);
                break;
            default:
                filtered = filtered.filter(l => l.status !== ListingStatus.DELETED);
        }

        // Sort: Pending first, then newest
        return filtered.sort((a, b) => {
            if (a.status === ListingStatus.PENDING_APPROVAL && b.status !== ListingStatus.PENDING_APPROVAL) return -1;
            if (a.status !== ListingStatus.PENDING_APPROVAL && b.status === ListingStatus.PENDING_APPROVAL) return 1;
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
    };

    const filteredListings = getFilteredListings();

    // Auto-select first listing when filtered list changes
    useEffect(() => {
        if (filteredListings.length > 0 && !selectedListing) {
            setSelectedListing(filteredListings[0]);
        } else if (filteredListings.length > 0 && selectedListing) {
            // Check if current selection is still in the filtered list
            const stillExists = filteredListings.some(l => l.id === selectedListing.id);
            if (!stillExists) {
                setSelectedListing(filteredListings[0]);
            }
        } else if (filteredListings.length === 0) {
            setSelectedListing(null);
        }
    }, [filteredListings, activeTab, searchTerm]);

    const stats = {
        all: listings.filter(l => l.status !== ListingStatus.DELETED).length,
        pending: listings.filter(l => l.status === ListingStatus.PENDING_APPROVAL).length,
        live: listings.filter(l => l.status === ListingStatus.LIVE).length,
        rejected: listings.filter(l => l.status === ListingStatus.REJECTED).length,
    };

    const tabs = [
        { id: 'pending' as TabType, label: 'Pending', count: stats.pending },
        { id: 'live' as TabType, label: 'Live', count: stats.live },
        { id: 'rejected' as TabType, label: 'Rejected', count: stats.rejected },
        { id: 'all' as TabType, label: 'All', count: stats.all },
    ];

    const detailTabs = ['Details', 'Documents', 'Photos', 'Amenities', 'Activity'];

    const getStatusBadge = (status: ListingStatus) => {
        switch (status) {
            case ListingStatus.LIVE:
                return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Live</span>;
            case ListingStatus.PENDING_APPROVAL:
                return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">Pending</span>;
            case ListingStatus.REJECTED:
                return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">Rejected</span>;
            default:
                return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">Draft</span>;
        }
    };

    const getHost = (hostId: string) => users.find(u => u.id === hostId);

    return (
        <div className="flex gap-6 h-[calc(100vh-180px)] animate-in fade-in">
            {/* Left Panel - Listings List */}
            <div className="w-[380px] flex-shrink-0 flex flex-col">
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-4 flex-shrink-0">
                    <div className="flex gap-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSelectedListing(null); }}
                                className={cn(
                                    "pb-3 text-sm font-medium border-b-2 transition-colors",
                                    activeTab === tab.id
                                        ? "border-gray-900 text-gray-900"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                )}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className={cn(
                                        "ml-2 px-1.5 py-0.5 text-xs rounded-full",
                                        activeTab === tab.id
                                            ? "bg-gray-900 text-white"
                                            : "bg-gray-100 text-gray-600"
                                    )}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search listings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
                    />
                </div>

                {/* Listings List */}
                <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                    {filteredListings.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Home size={20} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">No listings found</p>
                        </div>
                    ) : (
                        filteredListings.map((listing) => {
                            return (
                                <div
                                    key={listing.id}
                                    onClick={() => { setSelectedListing(listing); setCurrentImageIndex(0); }}
                                    className={cn(
                                        "p-3 rounded-lg cursor-pointer transition-all border-l-2",
                                        selectedListing?.id === listing.id
                                            ? "bg-gray-100 border-l-gray-400"
                                            : "border-l-transparent hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                            {listing.images?.[0] && (
                                                <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-medium text-gray-900 text-sm truncate">{listing.title}</h3>
                                                {getStatusBadge(listing.status)}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <MapPin size={10} />
                                                <span className="truncate">{listing.location}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {locale.currencySymbol}{listing.price}
                                                    <span className="text-xs font-normal text-gray-400">/{listing.pricingModel === PricingModel.HOURLY ? 'hr' : 'night'}</span>
                                                </span>
                                                <span className="text-xs text-gray-400">{listing.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Panel - Listing Details */}
            <div className="flex-1 min-w-0 overflow-y-auto">
                {selectedListing ? (
                    <div className="bg-white rounded-xl border border-gray-200">
                        {/* Image Gallery */}
                        <div className="relative h-64 bg-gray-900 rounded-t-xl overflow-hidden">
                            {selectedListing.images && selectedListing.images.length > 0 ? (
                                <>
                                    <img 
                                        src={selectedListing.images[currentImageIndex]} 
                                        alt={selectedListing.title} 
                                        className="w-full h-full object-cover"
                                    />
                                    {selectedListing.images.length > 1 && (
                                        <>
                                            <button 
                                                onClick={() => setCurrentImageIndex(i => i === 0 ? selectedListing.images.length - 1 : i - 1)}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                                                title="Previous image"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>
                                            <button 
                                                onClick={() => setCurrentImageIndex(i => i === selectedListing.images.length - 1 ? 0 : i + 1)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                                                title="Next image"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                                                {selectedListing.images.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setCurrentImageIndex(idx)}
                                                        className={cn(
                                                            "w-2 h-2 rounded-full transition-all",
                                                            idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                                                        )}
                                                        title={`View image ${idx + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Camera size={32} className="text-gray-600" />
                                </div>
                            )}
                            <div className="absolute top-3 right-3">
                                {getStatusBadge(selectedListing.status)}
                            </div>
                        </div>

                        {/* Listing Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">{selectedListing.title}</h2>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                        <MapPin size={14} />
                                        <span>{selectedListing.location}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {locale.currencySymbol}{selectedListing.price}
                                    </div>
                                    <div className="text-xs text-gray-500">per {selectedListing.pricingModel === PricingModel.HOURLY ? 'hour' : 'night'}</div>
                                </div>
                            </div>

                            {/* Host Info */}
                            {getHost(selectedListing.hostId) && (() => {
                                const host = getHost(selectedListing.hostId)!;
                                return (
                                    <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-lg">
                                        <HostAvatar host={host} size="md" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 text-sm">{host.name}</span>
                                                {host.badgeStatus === 'super_host' && <Sparkles size={12} className="text-amber-500" />}
                                                {host.badgeStatus === 'premium' && <ShieldCheck size={12} className="text-purple-500" />}
                                                {host.kycVerified && (
                                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">Verified</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">{host.email}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 border border-gray-200 rounded-lg hover:bg-white transition-colors" title="Email host">
                                                <Mail size={14} className="text-gray-500" />
                                            </button>
                                            <button className="p-2 border border-gray-200 rounded-lg hover:bg-white transition-colors" title="Call host">
                                                <Phone size={14} className="text-gray-500" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Detail Tabs */}
                        <div className="border-b border-gray-200">
                            <div className="flex gap-1 px-6">
                                {detailTabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setDetailTab(tab.toLowerCase())}
                                        className={cn(
                                            "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                                            detailTab === tab.toLowerCase()
                                                ? "border-gray-900 text-gray-900"
                                                : "border-transparent text-gray-500 hover:text-gray-700"
                                        )}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {detailTab === 'details' && (
                                <>
                                    {/* Property Details */}
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="p-3 bg-gray-50 rounded-lg text-center">
                                            <div className="text-lg font-bold text-gray-900">{selectedListing.capacity || '-'}</div>
                                            <div className="text-xs text-gray-500">Guests</div>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg text-center">
                                            <div className="text-lg font-bold text-gray-900">{selectedListing.type}</div>
                                            <div className="text-xs text-gray-500">Type</div>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg text-center">
                                            <div className="text-lg font-bold text-gray-900">{selectedListing.images?.length || 0}</div>
                                            <div className="text-xs text-gray-500">Photos</div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-sm text-gray-600 mb-6 line-clamp-4">{selectedListing.description}</p>

                                    {/* Verification Status */}
                                    {selectedListing.proofOfAddress && (
                                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100 mb-6">
                                            <CheckCircle size={16} className="text-green-600" />
                                            <span className="text-sm font-medium text-green-700">Address Verified</span>
                                            <a 
                                                href={selectedListing.proofOfAddress} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="ml-auto text-xs font-medium text-green-700 hover:text-green-800 flex items-center gap-1"
                                            >
                                                <FileText size={12} /> View Document
                                            </a>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {selectedListing.status === ListingStatus.PENDING_APPROVAL && (
                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                            <Button
                                                variant="danger"
                                                onClick={() => openRejectionModal(selectedListing.id)}
                                                leftIcon={<X size={16} />}
                                                className="flex-1"
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                variant="primary"
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                onClick={() => handleApproveWithToast(selectedListing, true)}
                                                leftIcon={<Check size={16} />}
                                            >
                                                Approve
                                            </Button>
                                        </div>
                                    )}

                                    {selectedListing.status === ListingStatus.LIVE && (
                                        <div className="pt-4 border-t border-gray-100">
                                            <Button
                                                variant="outline"
                                                className="w-full border-red-200 text-red-600 hover:bg-red-50"
                                                onClick={() => setDeleteConfirmation({ isOpen: true, listingId: selectedListing.id })}
                                                leftIcon={<Trash2 size={16} />}
                                            >
                                                Delete Listing
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                            {detailTab === 'documents' && (
                                <div className="space-y-6">
                                    <h3 className="text-sm font-semibold text-gray-900">Verification Documents</h3>
                                    
                                    {/* Proof of Address */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Proof of Address</h4>
                                        {selectedListing.proofOfAddress ? (
                                            <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <FileText size={20} className="text-green-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-medium text-green-800">Document Uploaded</span>
                                                            <CheckCircle size={14} className="text-green-600" />
                                                        </div>
                                                        <p className="text-xs text-green-600 mb-3">Utility bill or official address document</p>
                                                        <a 
                                                            href={selectedListing.proofOfAddress} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                                                        >
                                                            <Eye size={12} /> View Document
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border border-dashed border-amber-200 bg-amber-50 rounded-xl p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <AlertTriangle size={20} className="text-amber-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-sm font-medium text-amber-800">Not Provided</span>
                                                        <p className="text-xs text-amber-600 mt-1">Host has not uploaded proof of address for this listing</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Host KYC Status */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Host Verification</h4>
                                        {(() => {
                                            const host = getHost(selectedListing.hostId);
                                            return (
                                                <div className={cn(
                                                    "border rounded-xl p-4",
                                                    host?.kycStatus === 'verified' 
                                                        ? "border-green-200 bg-green-50" 
                                                        : "border-amber-200 bg-amber-50"
                                                )}>
                                                    <div className="flex items-start gap-3">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                                            host?.kycStatus === 'verified' ? "bg-green-100" : "bg-amber-100"
                                                        )}>
                                                            <Shield size={20} className={host?.kycStatus === 'verified' ? "text-green-600" : "text-amber-600"} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={cn(
                                                                    "text-sm font-medium",
                                                                    host?.kycStatus === 'verified' ? "text-green-800" : "text-amber-800"
                                                                )}>
                                                                    {host?.kycStatus === 'verified' ? 'Identity Verified' : 'Pending Verification'}
                                                                </span>
                                                                {host?.kycStatus === 'verified' && <CheckCircle size={14} className="text-green-600" />}
                                                            </div>
                                                            <p className={cn(
                                                                "text-xs",
                                                                host?.kycStatus === 'verified' ? "text-green-600" : "text-amber-600"
                                                            )}>
                                                                {host?.name || 'Unknown Host'} - KYC Status: {host?.kycStatus || 'none'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Document Checklist Summary */}
                                    <div className="border-t border-gray-100 pt-6">
                                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Document Checklist</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="text-sm text-gray-600">Proof of Address</span>
                                                {selectedListing.proofOfAddress ? (
                                                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                                        <CheckCircle size={14} /> Uploaded
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                                                        <Clock size={14} /> Missing
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="text-sm text-gray-600">Host KYC</span>
                                                {(() => {
                                                    const host = getHost(selectedListing.hostId);
                                                    return host?.kycStatus === 'verified' ? (
                                                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                                            <CheckCircle size={14} /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                                                            <Clock size={14} /> {host?.kycStatus || 'none'}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {detailTab === 'photos' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            All Photos ({selectedListing.images?.length || 0})
                                        </h3>
                                    </div>

                                    {!selectedListing.images || selectedListing.images.length === 0 ? (
                                        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Camera size={20} className="text-gray-400" />
                                            </div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-1">No photos uploaded</h4>
                                            <p className="text-xs text-gray-500">This listing has no photos yet</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-3">
                                            {selectedListing.images.map((img, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => setCurrentImageIndex(idx)}
                                                >
                                                    <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Photo Quality Check */}
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-900 mb-4">Photo Quality Check</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="text-sm text-gray-600">Minimum Photos (5+)</span>
                                                {(selectedListing.images?.length || 0) >= 5 ? (
                                                    <span className="flex items-center gap-1 text-green-600 text-sm">
                                                        <CheckCircle size={14} /> Pass
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-amber-600 text-sm">
                                                        <Clock size={14} /> {selectedListing.images?.length || 0}/5
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {detailTab === 'amenities' && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Listed Amenities</h3>
                                    
                                    {!selectedListing.amenities || selectedListing.amenities.length === 0 ? (
                                        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <CheckCircle size={20} className="text-gray-400" />
                                            </div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-1">No amenities listed</h4>
                                            <p className="text-xs text-gray-500">This listing has no amenities specified</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedListing.amenities.map((amenity, idx) => (
                                                <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                                    <CheckCircle size={14} className="text-green-600" />
                                                    <span className="text-sm text-gray-700">{amenity.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Listing Details */}
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-900 mb-4">Property Details</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">Property Type</p>
                                                <p className="text-sm font-medium text-gray-900">{selectedListing.type}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">Max Capacity</p>
                                                <p className="text-sm font-medium text-gray-900">{selectedListing.capacity || 'Not specified'}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">Pricing Model</p>
                                                <p className="text-sm font-medium text-gray-900 capitalize">{selectedListing.pricingModel || 'Not specified'}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">Price</p>
                                                <p className="text-sm font-medium text-gray-900">{locale.currencySymbol}{selectedListing.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {detailTab === 'activity' && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Listing Activity Timeline</h3>
                                    
                                    {/* Created */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Home size={14} className="text-blue-600" />
                                            </div>
                                            <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-sm font-medium text-gray-900">Listing Created</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Host submitted the listing for review</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {selectedListing.createdAt 
                                                    ? new Date(selectedListing.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Change */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center",
                                                selectedListing.status === ListingStatus.LIVE ? "bg-green-100" :
                                                selectedListing.status === ListingStatus.REJECTED ? "bg-red-100" :
                                                "bg-amber-100"
                                            )}>
                                                {selectedListing.status === ListingStatus.LIVE ? (
                                                    <CheckCircle size={14} className="text-green-600" />
                                                ) : selectedListing.status === ListingStatus.REJECTED ? (
                                                    <X size={14} className="text-red-600" />
                                                ) : (
                                                    <Clock size={14} className="text-amber-600" />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedListing.status === ListingStatus.LIVE ? 'Listing Approved' :
                                                 selectedListing.status === ListingStatus.REJECTED ? 'Listing Rejected' :
                                                 'Pending Review'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {selectedListing.status === ListingStatus.LIVE ? 'Listing is now live and visible to guests' :
                                                 selectedListing.status === ListingStatus.REJECTED ? 'Listing was rejected by admin' :
                                                 'Waiting for admin approval'}
                                            </p>
                                            <span className={cn(
                                                "inline-flex items-center gap-1 text-xs mt-1 px-2 py-0.5 rounded",
                                                selectedListing.status === ListingStatus.LIVE ? "bg-green-100 text-green-700" :
                                                selectedListing.status === ListingStatus.REJECTED ? "bg-red-100 text-red-700" :
                                                "bg-amber-100 text-amber-700"
                                            )}>
                                                {selectedListing.status === ListingStatus.LIVE ? 'Live' :
                                                 selectedListing.status === ListingStatus.REJECTED ? 'Rejected' :
                                                 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 h-full min-h-[500px] flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Home size={28} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Select a Listing</h3>
                            <p className="text-sm text-gray-500">Choose a listing from the list to view details</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            {rejectionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Listing</h3>
                        <textarea
                            placeholder="Enter rejection reason..."
                            value={rejectionModal.reason}
                            onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-32 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="outline" onClick={() => setRejectionModal({ isOpen: false, listingId: null, reason: '' })}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleRejectionSubmit}>
                                Reject Listing
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirmation.isOpen}
                onCancel={() => setDeleteConfirmation({ isOpen: false, listingId: null })}
                onConfirm={handleConfirmDelete}
                title="Delete Listing"
                message="Are you sure you want to delete this listing? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};
