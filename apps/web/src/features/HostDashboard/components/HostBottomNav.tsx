import React from 'react';
import { Home, Grid, Calendar, MessageSquare, User as UserIcon } from 'lucide-react';
import { cn } from '@fiilar/utils';

interface HostBottomNavProps {
    view: string;
    setView: (view: any) => void;
    unreadMessages?: number;
}

const HostBottomNav: React.FC<HostBottomNavProps> = ({ view, setView, unreadMessages = 0 }) => {
    const navItems = [
        { id: 'overview', icon: Home, label: 'Home' },
        { id: 'listings', icon: Grid, label: 'Listings' },
        { id: 'bookings', icon: Calendar, label: 'Calendar' },
        { id: 'messages', icon: MessageSquare, label: 'Inbox', badge: unreadMessages },
        { id: 'menu', icon: UserIcon, label: 'Profile' } // New Menu Tab
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 pb-safe">
            <div className="flex items-center justify-between">
                {navItems.map((item) => {
                    const isActive = view === item.id || (item.id === 'bookings' && view === 'calendar') || (item.id === 'earnings' && view === 'payouts');
                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 relative",
                                isActive ? "text-brand-600" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-xl transition-all duration-200",
                                isActive && "bg-brand-50"
                            )}>
                                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                {(item.badge ?? 0) > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                        {item.badge && item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default HostBottomNav;
