import React from 'react';
import { Home, Briefcase, FileText, ShieldCheck, TrendingUp, DollarSign, MessageSquare, Settings, AlertCircle, Plus, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@fiilar/ui';
import { cn } from '@fiilar/utils';
import { useNavigate } from 'react-router-dom';

interface HostSidebarProps {
    view: string;
    setView: (view: any) => void;
    pendingListingsCount: number;
    pendingBookingsCount: number;
    unreadMessages: number;
    handleStartNewListing: () => void;
    expanded: boolean;
    onToggle: () => void;
}

const HostSidebar: React.FC<HostSidebarProps> = ({
    view,
    setView,
    pendingListingsCount,
    pendingBookingsCount,
    unreadMessages,
    handleStartNewListing,
    expanded,
    onToggle
}) => {
    const navigate = useNavigate();

    const navItems = [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'listings', label: 'Listings', icon: Briefcase, badge: pendingListingsCount },
        { id: 'bookings', label: 'Bookings', icon: FileText, badge: pendingBookingsCount },
        { id: 'verify', label: 'Verify Guest', icon: ShieldCheck },
        { id: 'earnings', label: 'Earnings', icon: TrendingUp },
        { id: 'payouts', label: 'Payouts', icon: DollarSign },
        { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages },
    ];

    const bottomItems = [
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'notifications', label: 'Notifications', icon: AlertCircle },
    ];

    return (
        <aside className={cn(
            "hidden lg:flex flex-col py-6 bg-white border-r border-gray-100 z-20 transition-all duration-300 ease-in-out h-screen sticky top-0",
            expanded ? "w-[220px]" : "w-[72px]"
        )}>
            {/* Logo & Toggle */}
            <div className={cn(
                "flex items-center mb-8",
                expanded ? "px-5 justify-between" : "px-4 justify-center"
            )}>
                <button
                    onClick={() => navigate('/')}
                    className={cn(
                        "flex items-center justify-center hover:opacity-80 transition-opacity",
                        expanded ? "h-7" : "w-8 h-8"
                    )}
                    title="Go to homepage"
                >
                    <img
                        src={expanded ? "/assets/logo.png" : "/assets/fiilar-icon.png"}
                        alt="Fiilar"
                        className={cn(
                            "object-contain",
                            expanded ? "h-full w-auto" : "w-full h-full"
                        )}
                    />
                </button>
                <button
                    onClick={onToggle}
                    className={cn(
                        "w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all",
                        !expanded && "absolute left-[60px] top-6 shadow-sm border border-gray-200"
                    )}
                    title={expanded ? "Collapse sidebar" : "Expand sidebar"}
                >
                    {expanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 flex flex-col w-full px-3 gap-1 overflow-y-auto no-scrollbar">
                {/* New Listing Button */}
                {/* New Listing Button */}
                <button
                    onClick={handleStartNewListing}
                    className={cn(
                        "relative flex items-center gap-3 rounded-full transition-all duration-200 mb-4 group",
                        expanded
                            ? "px-4 py-2.5 bg-brand-600 text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 mx-3"
                            : "w-10 h-10 justify-center mx-auto text-brand-600 hover:bg-brand-50"
                    )}
                    title="Create New Listing"
                >
                    <Plus size={24} strokeWidth={expanded ? 2.5 : 2} className="shrink-0" />
                    {expanded && (
                        <span className="text-sm font-bold whitespace-nowrap">New Listing</span>
                    )}
                </button>

                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        title={item.label}
                        className={cn(
                            "relative flex items-center gap-3 rounded-full transition-all duration-200",
                            expanded ? "px-4 py-2.5" : "w-10 h-10 justify-center mx-auto rounded-xl",
                            view === item.id
                                ? "bg-brand-50 text-brand-700 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <item.icon size={18} strokeWidth={view === item.id ? 2 : 1.5} className="shrink-0" />
                        {expanded && (
                            <span className="text-sm whitespace-nowrap">
                                {item.label}
                            </span>
                        )}
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className={cn(
                                "min-w-[18px] h-[18px] text-[10px] font-bold rounded-full flex items-center justify-center px-1",
                                expanded ? "ml-auto bg-red-100 text-red-700" : "absolute -top-1 -right-1 border-2 border-white bg-red-500 text-white"
                            )}>
                                {item.badge > 99 ? '99+' : item.badge}
                            </span>
                        )}
                    </button>
                ))}

                <div className={cn("h-px bg-gray-100 my-2", expanded ? "mx-2" : "mx-2")} />

                {bottomItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        title={item.label}
                        className={cn(
                            "relative flex items-center gap-3 rounded-full transition-all duration-200",
                            expanded ? "px-4 py-2.5" : "w-10 h-10 justify-center mx-auto rounded-xl",
                            view === item.id
                                ? "bg-brand-50 text-brand-700 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <item.icon size={18} strokeWidth={view === item.id ? 2 : 1.5} className="shrink-0" />
                        {expanded && (
                            <span className="text-sm whitespace-nowrap">
                                {item.label}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            {/* User Profile / Logout (Optional, if we want it in sidebar) */}
            {/* For now, keeping it consistent with UserDashboard which has profile in header */}
        </aside>
    );
};

export default HostSidebar;
