import React from 'react';
import { Home, Briefcase, FileText, ShieldCheck, TrendingUp, DollarSign, MessageSquare, Settings, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@fiilar/ui';

interface HostSidebarProps {
    view: string;
    setView: (view: any) => void;
    pendingListingsCount: number;
    pendingBookingsCount: number;
    unreadMessages: number;
    handleStartNewListing: () => void;
}

const HostSidebar: React.FC<HostSidebarProps> = ({
    view,
    setView,
    pendingListingsCount,
    pendingBookingsCount,
    unreadMessages,
    handleStartNewListing
}) => {
    return (
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed top-16 left-0 bottom-0 z-40">
            <div className="p-6 border-b border-gray-200 shrink-0">
                <h2 className="text-lg font-bold text-gray-900">Host Dashboard</h2>
                <p className="text-xs text-gray-500 mt-1">Manage your spaces</p>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
                <button onClick={() => setView('overview')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'overview' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <Home size={18} />
                    Overview
                </button>
                <button onClick={() => setView('listings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'listings' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <Briefcase size={18} />
                    Listings
                    {pendingListingsCount > 0 && (
                        <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            {pendingListingsCount}
                        </span>
                    )}
                </button>
                <button onClick={() => setView('bookings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'bookings' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <FileText size={18} />
                    Bookings
                    {pendingBookingsCount > 0 && (
                        <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            {pendingBookingsCount}
                        </span>
                    )}
                </button>
                <button onClick={() => setView('verify')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'verify' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <ShieldCheck size={18} />
                    Verify Guest
                </button>
                <button onClick={() => setView('earnings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'earnings' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <TrendingUp size={18} />
                    Earnings
                </button>
                <button onClick={() => setView('payouts')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'payouts' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <DollarSign size={18} />
                    Payouts
                </button>
                <button onClick={() => setView('messages')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'messages' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <MessageSquare size={18} />
                    Messages
                    {unreadMessages > 0 && (
                        <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadMessages}
                        </span>
                    )}
                </button>
            </nav>
            <div className="p-4 space-y-1 border-t border-gray-100 shrink-0">
                <Button onClick={handleStartNewListing} variant="primary" className="w-full mb-2 justify-center" leftIcon={<Plus size={18} />}>New Listing</Button>
                <button onClick={() => setView('settings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'settings' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <Settings size={18} />
                    Settings
                </button>
                <button onClick={() => setView('notifications')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'notifications' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <AlertCircle size={18} />
                    Notifications
                </button>
            </div>
        </aside>
    );
};

export default HostSidebar;
