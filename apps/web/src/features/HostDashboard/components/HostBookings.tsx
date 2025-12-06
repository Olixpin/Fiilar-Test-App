import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Booking, Listing, User } from '@fiilar/types';
import { Briefcase, FileText, MapPin, Calendar as CalendarIcon, CheckCircle, X, DollarSign, ShieldCheck, MessageCircle, Edit, Clock, User as UserIcon, ChevronRight, Info } from 'lucide-react';
import { useLocale } from '@fiilar/ui';
import { OTPInput } from '../../../components/OTPInput';
import { cn } from '@fiilar/utils';
import { getAllUsers } from '@fiilar/storage';

interface HostBookingsProps {
    bookings: Booking[];
    listings: Listing[];
    filter: 'all' | 'pending' | 'confirmed' | 'completed';
    setFilter: (filter: 'all' | 'pending' | 'confirmed' | 'completed') => void;
    view: 'table' | 'cards';
    setView: (view: 'table' | 'cards') => void;
    onAccept: (booking: Booking) => void;
    onReject: (booking: Booking) => void;
    onRelease: (bookingId: string) => void;
    onVerify: (bookingId: string, code: string) => boolean | { success: false; error: string };
    onAllowModification: (booking: Booking) => void;
}

const formatTimeRange = (hours?: number[]) => {
    if (!hours || hours.length === 0) return null;
    const sorted = [...hours].sort((a, b) => a - b);
    const start = sorted[0];
    const end = sorted[sorted.length - 1] + 1;

    const formatHour = (h: number) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:00 ${ampm}`;
    };

    return `${formatHour(start)} - ${formatHour(end)}`;
};

const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

const getBookingTimeDisplay = (booking: Booking, listing?: Listing) => {
    // 1. Try to use specific hours if available
    if (booking.hours && booking.hours.length > 0) {
        return formatTimeRange(booking.hours);
    }

    // 2. Fallback to listing configuration
    if (listing?.bookingConfig) {
        // Check for Nightly Config (checkInTime)
        if ('checkInTime' in listing.bookingConfig) {
            const config = listing.bookingConfig as any;
            return `Check-in: ${formatTime(config.checkInTime)} - Check-out: ${formatTime(config.checkOutTime)}`;
        }

        // Check for Daily Config (accessStartTime)
        if ('accessStartTime' in listing.bookingConfig) {
            const config = listing.bookingConfig as any;
            return `${formatTime(config.accessStartTime)} - ${formatTime(config.accessEndTime)}`;
        }

        // Check for Hourly Config (operatingHours) - fallback if hours missing but it's hourly
        if ('operatingHours' in listing.bookingConfig) {
            const config = listing.bookingConfig as any;
            return `${formatTime(config.operatingHours.start)} - ${formatTime(config.operatingHours.end)}`;
        }
    }

    // 3. Last resort fallbacks based on pricing model (if config missing)
    // REMOVED: User requested data-driven display only.

    return null;
};

const HostBookings: React.FC<HostBookingsProps> = ({ bookings, listings, filter, setFilter, view, setView, onAccept, onReject, onRelease, onVerify, onAllowModification }) => {
    const navigate = useNavigate();
    const { locale } = useLocale();
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<{ booking: Booking; group?: Booking[] } | null>(null);

    // Get all users for displaying guest names
    const users = useMemo(() => getAllUsers(), []);
    const getUserName = (userId: string): string => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Guest';
    };
    const getUser = (userId: string): User | undefined => {
        return users.find(u => u.id === userId);
    };

    // Group bookings by groupId
    const displayItems = React.useMemo(() => {
        const groups: Record<string, Booking[]> = {};
        const items: { booking: Booking, group?: Booking[] }[] = [];

        // First pass: collect groups
        bookings.forEach(b => {
            if (b.groupId) {
                if (!groups[b.groupId]) groups[b.groupId] = [];
                groups[b.groupId].push(b);
            }
        });

        // Second pass: build display items
        const processedGroups = new Set<string>();

        bookings.forEach(b => {
            if (b.groupId) {
                if (!processedGroups.has(b.groupId)) {
                    // Sort group by date
                    const group = groups[b.groupId].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    items.push({ booking: group[0], group });
                    processedGroups.add(b.groupId);
                }
            } else {
                items.push({ booking: b });
            }
        });

        // Sort all items by date (newest first)
        return items.sort((a, b) => new Date(b.booking.date).getTime() - new Date(a.booking.date).getTime());
    }, [bookings]);

    const handleVerifySubmit = () => {
        if (verifyingId) {
            const result = onVerify(verifyingId, verificationCode);
            if (result === true) {
                setVerifyingId(null);
                setVerificationCode('');
                setVerificationError(null);
            } else if (typeof result === 'object' && result.error) {
                setVerificationError(result.error);
            } else {
                setVerificationError('Invalid verification code. Please try again.');
            }
        }
    };

    // Verification Modal rendered via portal to ensure it's above all other content
    const verificationModal = verifyingId ? createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <ShieldCheck size={40} className="text-brand-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Verify Guest</h3>
                    <p className="text-gray-500 mt-2">Enter the 6-character code provided by the guest to grant access.</p>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-center">
                        <div className={cn("transition-transform duration-200", verificationError && "animate-shake")}>
                            <OTPInput
                                value={verificationCode}
                                onChange={(val: string) => {
                                    setVerificationCode(val.toUpperCase());
                                    setVerificationError(false);
                                }}
                                length={6}
                                variant="default"
                                alphanumeric={true}
                                onComplete={() => {
                                    // Optional: auto-submit on complete
                                    // if (val.length === 6) handleVerifySubmit();
                                }}
                                onSubmit={handleVerifySubmit}
                            />
                        </div>
                    </div>

                    {verificationError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 animate-in fade-in slide-in-from-top-1">
                            <p className="text-red-700 text-sm text-center font-medium flex items-start justify-center gap-2">
                                <X size={16} className="flex-shrink-0 mt-0.5" />
                                <span>{verificationError}</span>
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            className="flex-1 px-4 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                            onClick={() => {
                                setVerifyingId(null);
                                setVerificationCode('');
                                setVerificationError(null);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleVerifySubmit}
                            disabled={verificationCode.length < 6}
                        >
                            Verify & Start
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    // Booking Details Modal
    const bookingDetailsModal = selectedBooking ? createPortal(
        (() => {
            const { booking, group } = selectedBooking;
            const listing = listings.find(l => l.id === booking.listingId);
            const guest = getUser(booking.userId);
            const isGroup = group && group.length > 1;
            const totalPrice = isGroup ? group.reduce((sum, item) => sum + item.totalPrice, 0) : booking.totalPrice;
            const totalHostPayout = isGroup ? group.reduce((sum, item) => sum + (item.hostPayout || 0), 0) : (booking.hostPayout || 0);
            const totalBasePrice = isGroup ? group.reduce((sum, item) => sum + (item.basePrice || 0), 0) : (booking.basePrice || 0);
            const totalExtraGuestFees = isGroup ? group.reduce((sum, item) => sum + (item.extraGuestFees || 0), 0) : (booking.extraGuestFees || 0);
            const totalExtras = isGroup ? group.reduce((sum, item) => sum + (item.extrasTotal || 0), 0) : (booking.extrasTotal || 0);
            const totalHostServiceFee = isGroup ? group.reduce((sum, item) => sum + (item.hostServiceFee || 0), 0) : (booking.hostServiceFee || 0);
            const totalCautionFee = isGroup ? group.reduce((sum, item) => sum + (item.cautionFee || 0), 0) : (booking.cautionFee || 0);

            return (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                                    <p className="text-sm text-gray-500 mt-1">#{booking.id.slice(0, 8)}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Guest Info */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                {guest?.avatar ? (
                                    <img 
                                        src={guest.avatar} 
                                        alt={guest.name} 
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-lg border-2 border-white shadow-sm">
                                        {guest?.name?.charAt(0).toUpperCase() || 'G'}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{guest?.name || 'Guest'}</p>
                                    {guest?.phone && (
                                        <p className="text-sm text-gray-500">{guest.phone}</p>
                                    )}
                                </div>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border",
                                    booking.status === 'Confirmed' || booking.status === 'Started' ? 'bg-green-50 text-green-700 border-green-200' :
                                        booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                            booking.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-gray-100 text-gray-500 border-gray-200'
                                )}>
                                    {booking.status}
                                </span>
                            </div>

                            {/* Property Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden">
                                    <img src={listing?.images[0]} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{listing?.title || 'Unknown'}</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <MapPin size={12} /> {listing?.location}
                                    </p>
                                </div>
                            </div>

                            {/* Booking Date/Time */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    {isGroup ? 'Session Dates' : 'Date & Time'}
                                </p>
                                {isGroup ? (
                                    <div className="flex flex-wrap gap-2">
                                        {group.map(s => (
                                            <span key={s.id} className="text-sm bg-white px-3 py-1.5 rounded-lg border border-gray-200 font-medium">
                                                {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                {getBookingTimeDisplay(s, listing) && (
                                                    <span className="text-gray-500 ml-1">• {getBookingTimeDisplay(s, listing)}</span>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon size={16} className="text-brand-500" />
                                            <span className="font-medium">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        {getBookingTimeDisplay(booking, listing) && (
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-brand-500" />
                                                <span className="font-medium">{getBookingTimeDisplay(booking, listing)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {booking.guestCount && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200">
                                        <UserIcon size={14} />
                                        <span>{booking.guestCount} guest{booking.guestCount > 1 ? 's' : ''}</span>
                                    </div>
                                )}
                            </div>

                            {/* Your Earnings - Host-focused breakdown */}
                            <div className="border border-green-200 rounded-xl overflow-hidden bg-green-50/30">
                                <div className="bg-green-100/50 px-4 py-3 border-b border-green-200">
                                    <p className="text-sm font-bold text-green-800">Your Earnings</p>
                                </div>
                                <div className="p-4 space-y-3">
                                    {/* Booking Value */}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Base price {isGroup ? `(${group.length} sessions)` : ''}</span>
                                        <span className="font-medium text-gray-900">{locale.currencySymbol}{totalBasePrice.toLocaleString()}</span>
                                    </div>
                                    {totalExtraGuestFees > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Extra guest fees</span>
                                            <span className="font-medium text-gray-900">{locale.currencySymbol}{totalExtraGuestFees.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {totalExtras > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Add-ons</span>
                                            <span className="font-medium text-gray-900">{locale.currencySymbol}{totalExtras.toLocaleString()}</span>
                                        </div>
                                    )}
                                    
                                    {/* Platform Fee - Host's fee only */}
                                    <div className="flex justify-between text-sm pt-2 border-t border-green-200/50">
                                        <span className="text-gray-600">Platform fee ({((totalHostServiceFee / (totalBasePrice + totalExtraGuestFees)) * 100).toFixed(0) || 3}%)</span>
                                        <span className="font-medium text-red-600">-{locale.currencySymbol}{totalHostServiceFee.toLocaleString()}</span>
                                    </div>

                                    {/* Final Payout */}
                                    <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-green-300">
                                        <span className="font-bold text-green-800">You receive</span>
                                        <span className="text-xl font-bold text-green-700">{locale.currencySymbol}{totalHostPayout.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Status */}
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-2">
                                    <DollarSign size={18} className="text-blue-600" />
                                    <span className="text-sm font-semibold text-blue-900">Payment Status</span>
                                </div>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold border",
                                    booking.paymentStatus === 'Released' ? 'bg-green-100 text-green-700 border-green-200' :
                                        booking.paymentStatus === 'Refunded' ? 'bg-red-100 text-red-700 border-red-200' :
                                            'bg-blue-100 text-blue-700 border-blue-200'
                                )}>
                                    {booking.paymentStatus || 'Paid - Escrow'}
                                </span>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                            <button
                                onClick={() => {
                                    setSelectedBooking(null);
                                    navigate(`?view=messages&userId=${booking.userId}&bookingId=${booking.id}`);
                                }}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={16} /> Message Guest
                            </button>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            );
        })(),
        document.body
    ) : null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Verification Modal - rendered via portal */}
            {verificationModal}

            {/* Booking Details Modal - rendered via portal */}
            {bookingDetailsModal}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage your space bookings and payouts</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                        <button
                            onClick={() => setView('cards')}
                            className={cn(
                                "p-2 rounded-lg transition-all duration-200",
                                view === 'cards' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                            )}
                            title="Card view"
                        >
                            <Briefcase size={20} />
                        </button>
                        <button
                            onClick={() => setView('table')}
                            className={cn(
                                "p-2 rounded-lg transition-all duration-200",
                                view === 'table' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                            )}
                            title="Table view"
                        >
                            <FileText size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {[
                    { key: 'all', label: 'All', count: bookings.length },
                    { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'Pending').length },
                    { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'Confirmed').length },
                    { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'Completed').length }
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key as any)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                            filter === f.key
                                ? "bg-gray-900 text-white shadow-md"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                        )}
                    >
                        {f.label}
                        {f.count > 0 && (
                            <span className={cn(
                                "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                                filter === f.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                            )}>
                                {f.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {bookings.length === 0 ? (
                <div className="glass-card rounded-3xl p-12 text-center border-dashed border-2 border-gray-300 bg-gray-50/50">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CalendarIcon size={32} className="text-gray-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-xl mb-2">No bookings yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">Your bookings will appear here once guests start booking your spaces.</p>
                </div>
            ) : (
                <>
                    {view === 'cards' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {displayItems
                                .filter(({ booking: b }) => filter === 'all' || b.status.toLowerCase() === filter)
                                .map(({ booking, group }) => {
                                    const listing = listings.find(l => l.id === booking.listingId);
                                    const guest = getUser(booking.userId);
                                    const isGroup = group && group.length > 1;
                                    const hostPayout = isGroup ? group.reduce((sum, item) => sum + (item.hostPayout || 0), 0) : (booking.hostPayout || 0);

                                    return (
                                        <div key={booking.id} className="glass-card rounded-2xl overflow-hidden group hover:border-brand-200 transition-all duration-300">
                                            {/* Clickable card body */}
                                            <div 
                                                className="p-5 flex gap-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                                                onClick={() => setSelectedBooking({ booking, group })}
                                            >
                                                <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative shadow-sm">
                                                    <img src={listing?.images[0]} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 truncate text-lg leading-tight">{listing?.title || 'Unknown'}</h3>
                                                            {isGroup && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 mt-1">
                                                                    <CheckCircle size={10} /> Recurring ({group.length} sessions)
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={cn(
                                                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border whitespace-nowrap",
                                                            booking.status === 'Confirmed' || booking.status === 'Started' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                    booking.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                        'bg-gray-100 text-gray-500 border-gray-200'
                                                        )}>
                                                            {booking.status}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                        <div className="flex items-center gap-1.5">
                                                            {guest?.avatar ? (
                                                                <img src={guest.avatar} alt={guest.name} className="w-5 h-5 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-[10px]">
                                                                    {guest?.name?.charAt(0).toUpperCase() || 'G'}
                                                                </div>
                                                            )}
                                                            <span className="font-medium">{guest?.name || 'Guest'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin size={14} className="text-gray-400" />
                                                            <span className="truncate max-w-[120px]">{listing?.location}</span>
                                                        </div>
                                                    </div>

                                                    {isGroup ? (
                                                        <div className="mb-3">
                                                            <p className="text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wide">Session Dates</p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {group.map(s => (
                                                                    <span key={s.id} className="text-[10px] bg-gray-50 px-2 py-1 rounded-md text-gray-600 border border-gray-100 font-medium flex items-center gap-1">
                                                                        {new Date(s.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                                                                        {getBookingTimeDisplay(s, listing) && (
                                                                            <span className="text-gray-500 font-medium">| {getBookingTimeDisplay(s, listing)}</span>
                                                                        )}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3 bg-gray-50/50 p-2 rounded-lg border border-gray-100/50">
                                                            <div className="flex items-center gap-1.5">
                                                                <CalendarIcon size={14} className="text-brand-500" />
                                                                <span className="font-medium">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                                            </div>
                                                            {getBookingTimeDisplay(booking, listing) && (
                                                                <>
                                                                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock size={14} className="text-brand-500" />
                                                                        <span className="font-medium">{getBookingTimeDisplay(booking, listing)}</span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-green-700 text-lg">{locale.currencySymbol}{hostPayout.toLocaleString()}</span>
                                                            <span className="text-xs text-green-600 font-medium">You earn</span>
                                                        </div>
                                                        <span className={cn(
                                                            "px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5",
                                                            booking.paymentStatus === 'Released' ? 'bg-green-50 text-green-700' :
                                                                booking.paymentStatus === 'Refunded' ? 'bg-red-50 text-red-700' :
                                                                    'bg-blue-50 text-blue-700'
                                                        )}>
                                                            <DollarSign size={12} />
                                                            {booking.paymentStatus || 'Escrow'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions Footer */}
                                            <div className="bg-gray-50/50 border-t border-gray-100 p-3 flex gap-2">
                                                {booking.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => onAccept(booking)}
                                                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-all shadow-sm flex items-center justify-center gap-2"
                                                        >
                                                            <CheckCircle size={16} /> Accept
                                                        </button>
                                                        <button
                                                            onClick={() => onReject(booking)}
                                                            className="flex-1 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <X size={16} /> Decline
                                                        </button>
                                                    </>
                                                )}

                                                {booking.status === 'Confirmed' && booking.handshakeStatus !== 'VERIFIED' && (
                                                    <button
                                                        onClick={() => setVerifyingId(booking.id)}
                                                        className="flex-1 bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2"
                                                    >
                                                        <ShieldCheck size={16} /> Verify Guest
                                                    </button>
                                                )}

                                                {booking.paymentStatus === 'Paid - Escrow' && booking.status === 'Confirmed' && booking.handshakeStatus === 'VERIFIED' && (
                                                    <button
                                                        onClick={() => onRelease(booking.id)}
                                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                                                    >
                                                        <DollarSign size={16} /> Release Funds
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => navigate(`?view=messages&userId=${booking.userId}&bookingId=${booking.id}`)}
                                                    className="w-10 h-10 bg-white border border-gray-200 text-gray-600 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:text-brand-600 transition-colors"
                                                    title="Message Guest"
                                                >
                                                    <MessageCircle size={18} />
                                                </button>

                                                {!booking.modificationAllowed && booking.status === 'Pending' && (
                                                    <button
                                                        onClick={() => onAllowModification(booking)}
                                                        className="w-10 h-10 bg-white border border-gray-200 text-purple-600 rounded-xl flex items-center justify-center hover:bg-purple-50 transition-colors"
                                                        title="Allow Modification"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <div className="glass-card rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Guest</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Property</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Earnings</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {displayItems
                                            .filter(({ booking: b }) => filter === 'all' || b.status.toLowerCase() === filter)
                                            .map(({ booking, group }) => {
                                                const listing = listings.find(l => l.id === booking.listingId);
                                                const guest = getUser(booking.userId);
                                                const isGroup = group && group.length > 1;
                                                const hostPayout = isGroup ? group.reduce((sum, item) => sum + (item.hostPayout || 0), 0) : (booking.hostPayout || 0);

                                                return (
                                                    <tr 
                                                        key={booking.id} 
                                                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                                        onClick={() => setSelectedBooking({ booking, group })}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                {guest?.avatar ? (
                                                                    <img src={guest.avatar} alt={guest?.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm">
                                                                        {guest?.name?.charAt(0).toUpperCase() || 'G'}
                                                                    </div>
                                                                )}
                                                                <div className="text-sm font-medium text-gray-900">{guest?.name || 'Guest'}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-medium text-gray-900">{listing?.title || 'Unknown'}</div>
                                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {listing?.location}</div>
                                                            {isGroup && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100 mt-1">
                                                                    Recurring ({group.length})
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isGroup ? (
                                                                <div className="text-sm text-gray-900">
                                                                    <div className="font-medium mb-1 text-xs text-gray-500 uppercase tracking-wide">Multiple Dates</div>
                                                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                                        {group.map(s => (
                                                                            <span key={s.id} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 flex items-center gap-1">
                                                                                {new Date(s.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                                                                                {getBookingTimeDisplay(s, listing) && (
                                                                                    <span className="text-gray-500 font-medium">| {getBookingTimeDisplay(s, listing)}</span>
                                                                                )}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="text-sm font-medium text-gray-900">{new Date(booking.date).toLocaleDateString()}</div>
                                                                    {getBookingTimeDisplay(booking, listing) && (
                                                                        <div className="text-xs text-brand-600 font-medium mt-0.5 flex items-center gap-1">
                                                                            <Clock size={10} /> {getBookingTimeDisplay(booking, listing)}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-green-700 flex items-center gap-2">
                                                                {locale.currencySymbol}{hostPayout.toLocaleString()}
                                                                <span className="text-xs text-green-600 font-medium">earn</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={cn(
                                                                "px-2.5 py-1 text-xs font-bold rounded-full border",
                                                                booking.status === 'Confirmed' || booking.status === 'Started' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                    booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                        booking.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                            'bg-gray-100 text-gray-700 border-gray-200'
                                                            )}>
                                                                {booking.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={cn(
                                                                "px-2.5 py-1 text-xs font-bold rounded-full border flex items-center gap-1 w-fit",
                                                                booking.paymentStatus === 'Released' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                    booking.paymentStatus === 'Refunded' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                        'bg-blue-50 text-blue-700 border-blue-200'
                                                            )}>
                                                                {booking.paymentStatus || 'Escrow'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                                {booking.status === 'Pending' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => onAccept(booking)}
                                                                            className="text-green-600 hover:text-green-700 font-medium p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                                                                            title="Accept"
                                                                        >
                                                                            <CheckCircle size={18} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => onReject(booking)}
                                                                            className="text-red-600 hover:text-red-700 font-medium p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                                                            title="Decline"
                                                                        >
                                                                            <X size={18} />
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {booking.status === 'Confirmed' && booking.handshakeStatus !== 'VERIFIED' && (
                                                                    <button
                                                                        onClick={() => setVerifyingId(booking.id)}
                                                                        className="text-brand-600 hover:text-brand-700 font-medium p-1.5 hover:bg-brand-50 rounded-lg transition-colors"
                                                                        title="Verify Guest"
                                                                    >
                                                                        <ShieldCheck size={18} />
                                                                    </button>
                                                                )}

                                                                {booking.paymentStatus === 'Paid - Escrow' && booking.status === 'Confirmed' && booking.handshakeStatus === 'VERIFIED' && (
                                                                    <button
                                                                        onClick={() => onRelease(booking.id)}
                                                                        className="text-green-600 hover:text-green-700 font-medium p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                                                                        title="Release Funds"
                                                                    >
                                                                        <DollarSign size={18} />
                                                                    </button>
                                                                )}

                                                                <button
                                                                    onClick={() => navigate(`?view=messages&userId=${booking.userId}&bookingId=${booking.id}`)}
                                                                    className="text-gray-400 hover:text-brand-600 font-medium p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                                    title="Message"
                                                                >
                                                                    <MessageCircle size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default HostBookings;
