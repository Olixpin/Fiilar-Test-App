import React from 'react';
import { Search, Heart, Briefcase, MessageSquare, User as UserIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@fiilar/utils';

const GuestBottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems = [
        { id: 'explore', icon: Search, label: 'Explore', path: '/' },
        { id: 'wishlists', icon: Heart, label: 'Wishlists', path: '/dashboard?tab=favorites' },
        { id: 'trips', icon: Briefcase, label: 'Trips', path: '/dashboard?tab=bookings' },
        { id: 'inbox', icon: MessageSquare, label: 'Inbox', path: '/dashboard?tab=messages' },
        { id: 'profile', icon: UserIcon, label: 'Profile', path: '/dashboard?tab=menu' }
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 pb-safe">
            <div className="flex items-center justify-between">
                {navItems.map((item) => {
                    // Check if active based on path and query params
                    let isActive = false;
                    if (item.path === '/') {
                        isActive = currentPath === '/';
                    } else {
                        const itemUrl = new URL(item.path, 'http://dummy.com'); // Dummy base for relative URL parsing
                        const itemPath = itemUrl.pathname;
                        const itemTab = itemUrl.searchParams.get('tab');

                        const currentTab = new URLSearchParams(location.search).get('tab');

                        if (itemTab) {
                            isActive = currentPath === itemPath && currentTab === itemTab;
                        } else {
                            isActive = currentPath === itemPath;
                        }
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
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
                            </div>
                            <span className="text-[10px] font-medium mt-1">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default GuestBottomNav;
