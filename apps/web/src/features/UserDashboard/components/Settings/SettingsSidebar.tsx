import React from 'react';
import { User as UserIcon, HelpCircle, Info, MessageSquare, LogOut, ChevronRight } from 'lucide-react';
import { SettingsTab } from '../../hooks/useSettingsData';

interface SettingsSidebarProps {
    activeTab: SettingsTab;
    setActiveTab: (tab: SettingsTab) => void;
    onLogout?: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
    const tabs = [
        { id: 'account' as SettingsTab, label: 'Account', icon: UserIcon, description: 'Personal details & security' },
        { id: 'support' as SettingsTab, label: 'Support', icon: HelpCircle, description: 'Get help with your bookings' },
        { id: 'feedback' as SettingsTab, label: 'Feedback', icon: MessageSquare, description: 'Help us improve Fiilar' },
        { id: 'about' as SettingsTab, label: 'About', icon: Info, description: 'Legal & version info' },
    ];

    return (
        <div className="md:w-72 shrink-0 space-y-8 border-r border-gray-100 pr-6">
            <div className="space-y-2">
                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">General</h3>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${isActive
                                ? 'bg-brand-50 text-brand-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'} />
                            <span className={`font-medium ${isActive ? 'text-brand-900' : 'text-gray-700'}`}>{tab.label}</span>
                            {isActive && <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-brand-500" />}
                        </button>
                    );
                })}
            </div>

            <div className="space-y-2">
                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Account</h3>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
                >
                    <LogOut size={20} className="text-gray-400 group-hover:text-red-500" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );
};
