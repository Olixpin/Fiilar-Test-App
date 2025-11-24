import React from 'react';
import { User as UserIcon, HelpCircle, Info, MessageSquare } from 'lucide-react';
import { SettingsTab } from '../../hooks/useSettingsData';

interface SettingsSidebarProps {
    activeTab: SettingsTab;
    setActiveTab: (tab: SettingsTab) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'account' as SettingsTab, label: 'Account', icon: UserIcon },
        { id: 'support' as SettingsTab, label: 'Support', icon: HelpCircle },
        { id: 'about' as SettingsTab, label: 'About', icon: Info },
        { id: 'feedback' as SettingsTab, label: 'Feedback', icon: MessageSquare },
    ];

    return (
        <div className="md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === tab.id
                                ? 'bg-brand-50 text-brand-700 font-semibold'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Icon size={20} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
