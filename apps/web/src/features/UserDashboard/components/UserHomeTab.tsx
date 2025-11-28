import React, { useMemo } from 'react';
import { User, Listing, Booking } from '@fiilar/types';
import { getBookings } from '@fiilar/storage';
import { getConversations } from '@fiilar/messaging';
import { useNavigate } from 'react-router-dom';
import {
    Sun, Moon, Cloud, Calendar, MapPin, Wallet, MessageSquare,
    ArrowRight, Sparkles, ShieldCheck, Key, Clock
} from 'lucide-react';
import { cn, useLocale, useLocationWeather } from '@fiilar/ui';
import ListingCard from '../../Listings/components/ListingCard';

interface UserHomeTabProps {
    user: User;
    listings: Listing[];
    onTabChange: (tab: 'explore' | 'wallet' | 'favorites' | 'bookings' | 'reserve-list' | 'messages' | 'settings' | 'notifications') => void;
}

export const UserHomeTab: React.FC<UserHomeTabProps> = ({ user, listings, onTabChange }) => {
    const navigate = useNavigate();
    const { locale } = useLocale();
    const { city, temp, condition, icon: WeatherIcon } = useLocationWeather();

    // 1. Time-based Greeting
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    // 2. Get Data
    const userBookings = useMemo(() => getBookings().filter(b => b.userId === user.id), [user.id]);
    const unreadMessages = useMemo(() =>
        getConversations(user.id).filter(c => c.participants.includes(user.id) && c.unreadCount && c.unreadCount > 0).length,
        [user.id]);

    // 3. Find Next Upcoming Booking
    const nextBooking = useMemo(() => {
        const now = new Date();
        const upcoming = userBookings
            .filter(b => (b.status === 'Confirmed' || b.status === 'Started') && new Date(b.date) >= now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return upcoming[0];
    }, [userBookings]);

    const nextBookingListing = useMemo(() =>
        nextBooking ? listings.find(l => l.id === nextBooking.listingId) : null,
        [nextBooking, listings]);

    // 4. Recommendations (Mock logic for now - just pick top rated or random)
    const recommendations = useMemo(() => {
        return listings.slice(0, 3);
    }, [listings]);

    // 5. Fetch Wallet Balance (Source of Truth: paymentService)
    const [walletBalance, setWalletBalance] = React.useState(0);

    React.useEffect(() => {
        const fetchBalance = async () => {
            try {
                // Dynamically import to avoid circular dependencies if any
                const { paymentService } = await import('@fiilar/escrow');
                const bal = await paymentService.getWalletBalance();
                setWalletBalance(bal);
            } catch (error) {
                console.error('Failed to fetch wallet balance', error);
            }
        };
        fetchBalance();

        // Listen for balance updates
        const handleBalanceUpdate = () => fetchBalance();
        window.addEventListener('fiilar:wallet-updated', handleBalanceUpdate);
        // Also listen for user updates as a fallback
        window.addEventListener('fiilar:user-updated', handleBalanceUpdate);

        return () => {
            window.removeEventListener('fiilar:wallet-updated', handleBalanceUpdate);
            window.removeEventListener('fiilar:user-updated', handleBalanceUpdate);
        };
    }, [user]);

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                        {greeting}, {user.firstName || user.name.split(' ')[0]}
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        {nextBooking
                            ? "You're all set for your upcoming trip."
                            : "Ready to find your next adventure?"}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                    <WeatherIcon size={16} className="text-orange-500" />
                    <span>{city} • {temp}</span>
                </div>
            </div>

            {/* Hero Card: Context Aware */}
            {nextBooking && nextBookingListing ? (
                // TRIP MODE CARD
                <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white shadow-xl shadow-gray-200">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0">
                        <img
                            src={nextBookingListing.images[0]}
                            alt={nextBookingListing.title}
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent" />
                    </div>

                    <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row gap-8 justify-between">
                        <div className="space-y-6 max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-white">
                                <Sparkles size={14} className="text-yellow-400" />
                                <span>Upcoming Trip</span>
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold mb-2 leading-tight">{nextBookingListing.title}</h2>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <MapPin size={18} />
                                    <span>{nextBookingListing.location}</span>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Check-in</p>
                                    <p className="text-xl font-semibold">
                                        {new Date(nextBooking.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-sm text-gray-400">10:00 AM</p>
                                </div>
                                <div className="w-px bg-white/20" />
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Guests</p>
                                    <p className="text-xl font-semibold">{nextBooking.guestCount || 1} Guests</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    onClick={() => onTabChange('bookings')}
                                    className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
                                >
                                    <Key size={18} />
                                    View Check-in Code
                                </button>
                                <button
                                    onClick={() => onTabChange('messages')}
                                    className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
                                >
                                    <MessageSquare size={18} />
                                    Message Host
                                </button>
                            </div>
                        </div>

                        {/* Countdown / Weather Widget (Mock) */}
                        <div className="hidden md:flex flex-col gap-4 min-w-[200px]">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                                <div className="flex items-center justify-between mb-2">
                                    <WeatherIcon size={24} className="text-blue-300" />
                                    <span className="text-2xl font-bold">{temp}</span>
                                </div>
                                <p className="text-sm text-gray-300">{condition}</p>
                            </div>
                            <div className="bg-brand-600/90 backdrop-blur-md border border-brand-500/50 p-4 rounded-2xl flex-1 flex flex-col justify-center items-center text-center">
                                <Clock size={24} className="mb-2 text-white/80" />
                                <p className="text-sm text-white/80">Starts in</p>
                                <p className="text-2xl font-bold">
                                    {Math.ceil((new Date(nextBooking.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Days
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // EXPLORE MODE CARD
                <div className="relative overflow-hidden rounded-3xl bg-brand-900 text-white shadow-xl shadow-brand-900/20">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-purple-700 opacity-90" />
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    </div>

                    <div className="relative z-10 p-8 md:p-12 flex flex-col items-center text-center max-w-2xl mx-auto space-y-8">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 mb-2">
                            <Sparkles size={32} className="text-yellow-300" />
                        </div>

                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Find your next getaway</h2>
                            <p className="text-lg text-brand-100">
                                Explore unique spaces for your next project, event, or escape. We've curated some top picks just for you.
                            </p>
                        </div>

                        <button
                            onClick={() => onTabChange('explore')}
                            className="px-8 py-4 bg-white text-brand-600 rounded-xl font-bold text-lg hover:bg-brand-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            Start Exploring <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Wallet Widget */}
                <button
                    onClick={() => onTabChange('wallet')}
                    className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-green-50 rounded-xl text-green-600 group-hover:scale-110 transition-transform">
                            <Wallet size={24} />
                        </div>
                        <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                            Active
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Wallet Balance</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {locale.currencySymbol}{(walletBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                </button>

                {/* Messages Widget */}
                <button
                    onClick={() => onTabChange('messages')}
                    className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                            <MessageSquare size={24} />
                        </div>
                        {unreadMessages > 0 && (
                            <div className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full animate-pulse">
                                {unreadMessages} New
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Messages</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {unreadMessages > 0 ? `${unreadMessages} Unread` : 'All caught up'}
                    </h3>
                </button>

                {/* Stats Widget */}
                <button
                    onClick={() => onTabChange('bookings')}
                    className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
                            <Calendar size={24} />
                        </div>
                        <div className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                            {new Date().getFullYear()}
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Total Trips</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{userBookings.length} Bookings</h3>
                </button>
            </div>

            {/* Recommended Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Recommended for you</h3>
                    <button
                        onClick={() => onTabChange('explore')}
                        className="text-brand-600 font-semibold hover:text-brand-700 text-sm flex items-center gap-1"
                    >
                        View all <ArrowRight size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendations.map((listing, index) => (
                        <ListingCard
                            key={listing.id}
                            listing={listing}
                            index={index}
                            priority={true}
                            batchReady={true}
                        />
                    ))}
                </div>
            </div>

        </div>
    );
};
