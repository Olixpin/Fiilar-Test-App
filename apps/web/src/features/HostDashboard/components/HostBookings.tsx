import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Booking, Listing } from '@fiilar/types';
import { Briefcase, FileText, MapPin, Calendar as CalendarIcon, CheckCircle, X, DollarSign, ShieldCheck, MessageCircle, Edit } from 'lucide-react';
import { Button, Input, useLocale } from '@fiilar/ui';

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
    onVerify: (bookingId: string, code: string) => boolean;
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

const HostBookings: React.FC<HostBookingsProps> = ({ bookings, listings, filter, setFilter, view, setView, onAccept, onReject, onRelease, onVerify, onAllowModification }) => {
    const navigate = useNavigate();
    const { locale } = useLocale();
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationError, setVerificationError] = useState(false);

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
            const success = onVerify(verifyingId, verificationCode);
            if (success) {
                setVerifyingId(null);
                setVerificationCode('');
                setVerificationError(false);
            } else {
                setVerificationError(true);
            }
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in">
            {/* Verification Modal */}
            {verifyingId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck size={32} className="text-brand-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Verify Guest</h3>
                            <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code provided by the guest to grant access.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Input
                                    label="Guest Code"
                                    placeholder="e.g. A1B2C3"
                                    value={verificationCode}
                                    onChange={(e) => {
                                        setVerificationCode(e.target.value.toUpperCase());
                                        setVerificationError(false);
                                    }}
                                    className="text-center text-2xl tracking-widest uppercase font-mono"
                                    maxLength={6}
                                />
                                {verificationError && (
                                    <p className="text-red-600 text-sm mt-2 text-center font-medium animate-pulse">
                                        Invalid code. Please try again.
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setVerifyingId(null);
                                        setVerificationCode('');
                                        setVerificationError(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    className="flex-1"
                                    onClick={handleVerifySubmit}
                                    disabled={verificationCode.length < 6}
                                >
                                    Verify & Start
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header with Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your space bookings and payouts</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex p-1 bg-gray-100 rounded-lg">
                        <button
                            onClick={() => setView('cards')}
                            className={`p-2 rounded-md transition-all ${view === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Card view"
                        >
                            <Briefcase size={20} />
                        </button>
                        <button
                            onClick={() => setView('table')}
                            className={`p-2 rounded-md transition-all ${view === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Table view"
                        >
                            <FileText size={20} />
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex p-1 bg-gray-100 rounded-xl overflow-x-auto no-scrollbar">
                        {[
                            { key: 'all', label: 'All', count: bookings.length },
                            { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'Pending').length },
                            { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'Confirmed').length },
                            { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'Completed').length }
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filter === f.key
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                {f.label} {f.count > 0 && `(${f.count})`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} className="text-gray-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">No bookings yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">Your bookings will appear here once guests start booking your spaces.</p>
                </div>
            ) : (
                <>
                    {view === 'cards' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {displayItems
                                .filter(({ booking: b }) => filter === 'all' || b.status.toLowerCase() === filter)
                                .map(({ booking, group }) => {
                                    const listing = listings.find(l => l.id === booking.listingId);
                                    const isGroup = group && group.length > 1;
                                    const totalPrice = isGroup ? group.reduce((sum, item) => sum + item.totalPrice, 0) : booking.totalPrice;

                                    return (
                                        <div key={booking.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                            <div className="flex gap-4 p-4">
                                                <img src={listing?.images[0]} alt="" className="w-24 h-24 rounded-lg object-cover shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 truncate">{listing?.title || 'Unknown'}</h3>
                                                            {isGroup && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 mt-1">
                                                                    <CheckCircle size={10} /> Recurring ({group.length} sessions)
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap ${booking.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                booking.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                    'bg-gray-100 text-gray-500 border-gray-200'
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                                        <MapPin size={10} /> {listing?.location}
                                                    </p>

                                                    {isGroup ? (
                                                        <div className="mb-2">
                                                            <p className="text-xs text-gray-600 font-medium mb-1">Session Dates:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {group.map(s => (
                                                                    <span key={s.id} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">
                                                                        {new Date(s.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                                                            <CalendarIcon size={10} /> {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                            {formatTimeRange(booking.hours) && (
                                                                <span className="text-brand-600 font-medium ml-1">
                                                                    • {formatTimeRange(booking.hours)}
                                                                </span>
                                                            )}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-3 text-xs">
                                                        <span className="font-bold text-gray-900">{locale.currencySymbol}{totalPrice.toFixed(2)}</span>
                                                        <span className={`px-2 py-0.5 rounded-full font-semibold ${booking.paymentStatus === 'Released' ? 'bg-green-100 text-green-700' :
                                                            booking.paymentStatus === 'Refunded' ? 'bg-red-100 text-red-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {booking.paymentStatus || 'Escrow'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {booking.status === 'Pending' && (
                                                <div className="border-t border-gray-100 p-3 bg-gray-50 flex gap-2 flex-wrap">
                                                    <button
                                                        onClick={() => onAccept(booking)}
                                                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-green-700 transition flex items-center justify-center gap-1"
                                                    >
                                                        <CheckCircle size={14} /> Accept {isGroup ? 'Series' : ''}
                                                    </button>
                                                    <button
                                                        onClick={() => onReject(booking)}
                                                        className="flex-1 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-1"
                                                    >
                                                        <X size={14} /> Decline {isGroup ? 'Series' : ''}
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`?view=messages&userId=${booking.userId}&bookingId=${booking.id}`)}
                                                        className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-blue-100 transition flex items-center justify-center gap-1"
                                                        title="Message Guest"
                                                    >
                                                        <MessageCircle size={14} />
                                                    </button>
                                                    {!booking.modificationAllowed && (
                                                        <button
                                                            onClick={() => onAllowModification(booking)}
                                                            className="bg-purple-50 text-purple-600 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-purple-100 transition flex items-center justify-center gap-1"
                                                            title="Allow Guest to Modify"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {booking.status === 'Confirmed' && booking.handshakeStatus !== 'VERIFIED' && (
                                                <div className="border-t border-gray-100 p-3 bg-brand-50">
                                                    <button
                                                        onClick={() => setVerifyingId(booking.id)}
                                                        className="w-full bg-brand-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-brand-700 transition flex items-center justify-center gap-1"
                                                    >
                                                        <ShieldCheck size={14} /> Verify Guest
                                                    </button>
                                                </div>
                                            )}
                                            {booking.paymentStatus === 'Paid - Escrow' && booking.status === 'Confirmed' && booking.handshakeStatus === 'VERIFIED' && (
                                                <div className="border-t border-gray-100 p-3 bg-blue-50">
                                                    <button
                                                        onClick={() => onRelease(booking.id)}
                                                        className="w-full bg-brand-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-brand-700 transition flex items-center justify-center gap-1"
                                                    >
                                                        <DollarSign size={14} /> Release Funds
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Guest</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Property</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {displayItems
                                            .filter(({ booking: b }) => filter === 'all' || b.status.toLowerCase() === filter)
                                            .map(({ booking, group }) => {
                                                const listing = listings.find(l => l.id === booking.listingId);
                                                const isGroup = group && group.length > 1;
                                                const totalPrice = isGroup ? group.reduce((sum, item) => sum + item.totalPrice, 0) : booking.totalPrice;

                                                return (
                                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{booking.userId}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-medium text-gray-900">{listing?.title || 'Unknown'}</div>
                                                            <div className="text-xs text-gray-500">{listing?.location}</div>
                                                            {isGroup && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 mt-1">
                                                                    Recurring ({group.length})
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isGroup ? (
                                                                <div className="text-sm text-gray-900">
                                                                    <div className="font-medium mb-1">Multiple Dates:</div>
                                                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                                        {group.map(s => (
                                                                            <span key={s.id} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                                                                {new Date(s.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="text-sm text-gray-900">{new Date(booking.date).toLocaleDateString()}</div>
                                                                    {booking.hours && (
                                                                        <div className="text-xs text-brand-600 font-medium mt-0.5">
                                                                            {formatTimeRange(booking.hours)}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-gray-900">{locale.currencySymbol}{totalPrice.toFixed(2)}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {booking.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${booking.paymentStatus === 'Released' ? 'bg-green-100 text-green-800' :
                                                                booking.paymentStatus === 'Refunded' ? 'bg-red-100 text-red-800' :
                                                                    'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                {booking.paymentStatus || 'Paid - Escrow'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            {booking.status === 'Pending' && (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => onAccept(booking)}
                                                                        className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                                                                    >
                                                                        <CheckCircle size={14} /> Accept
                                                                    </button>
                                                                    <button
                                                                        onClick={() => onReject(booking)}
                                                                        className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                                                    >
                                                                        <X size={14} /> Decline
                                                                    </button>
                                                                    <button
                                                                        onClick={() => navigate(`?view=messages&userId=${booking.userId}&bookingId=${booking.id}`)}
                                                                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                                                        title="Message Guest"
                                                                    >
                                                                        <MessageCircle size={14} />
                                                                    </button>
                                                                    {!booking.modificationAllowed && (
                                                                        <button
                                                                            onClick={() => onAllowModification(booking)}
                                                                            className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                                                                            title="Allow Guest to Modify"
                                                                        >
                                                                            <Edit size={14} /> Allow Modify
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {booking.status === 'Confirmed' && booking.handshakeStatus !== 'VERIFIED' && (
                                                                <button
                                                                    onClick={() => setVerifyingId(booking.id)}
                                                                    className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                                                                >
                                                                    <ShieldCheck size={14} /> Verify
                                                                </button>
                                                            )}
                                                            {booking.paymentStatus === 'Paid - Escrow' && booking.status === 'Confirmed' && booking.handshakeStatus === 'VERIFIED' && (
                                                                <button
                                                                    onClick={() => onRelease(booking.id)}
                                                                    className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                                                                >
                                                                    <DollarSign size={14} /> Release
                                                                </button>
                                                            )}
                                                            {booking.paymentStatus === 'Released' && (
                                                                <span className="text-green-600 font-medium">✓ Released</span>
                                                            )}
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
