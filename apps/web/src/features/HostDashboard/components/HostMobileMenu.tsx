import React from 'react';
import { Home, Briefcase, FileText, ShieldCheck, TrendingUp, MessageSquare, Settings } from 'lucide-react';

interface HostMobileMenuProps {
    view: string;
    setView: (view: any) => void;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const HostMobileMenu: React.FC<HostMobileMenuProps> = ({ view, setView, setIsMobileMenuOpen }) => {
    return (
        <div className="mb-4 grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-200">
            <button onClick={() => { setView('overview'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${view === 'overview' ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-700'}`}>
                <Home size={16} /> Overview
            </button>
            <button onClick={() => { setView('listings'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${view === 'listings' ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-700'}`}>
                <Briefcase size={16} /> Listings
            </button>
            <button onClick={() => { setView('bookings'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${view === 'bookings' ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-700'}`}>
                <FileText size={16} /> Bookings
            </button>
            <button onClick={() => { setView('verify'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${view === 'verify' ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-700'}`}>
                <ShieldCheck size={16} /> Verify Guest
            </button>
            <button onClick={() => { setView('earnings'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${view === 'earnings' ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-700'}`}>
                <TrendingUp size={16} /> Earnings
            </button>
            <button onClick={() => { setView('messages'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${view === 'messages' ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-700'}`}>
                <MessageSquare size={16} /> Messages
            </button>
            <button onClick={() => { setView('settings'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${view === 'settings' ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-700'}`}>
                <Settings size={16} /> Settings
            </button>
        </div>
    );
};

export default HostMobileMenu;
