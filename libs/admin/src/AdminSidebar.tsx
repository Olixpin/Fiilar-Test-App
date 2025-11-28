import React from 'react';
import { ShieldCheck, UserCheck, Users, Home, DollarSign, Scale, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { useLocale } from '@fiilar/ui';
import { APP_INFO } from '@fiilar/storage';

interface AdminSidebarProps {
    activeTab: 'kyc' | 'hosts' | 'listings' | 'financials' | 'escrow' | 'disputes';
    setActiveTab: (tab: 'kyc' | 'hosts' | 'listings' | 'financials' | 'escrow' | 'disputes') => void;
    kycCount: number;
    listingsCount: number;
    disputesCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, kycCount, listingsCount, disputesCount }) => {
    const { locale } = useLocale();
    const navItems = [
        { id: 'kyc' as const, icon: UserCheck, label: 'KYC Requests', count: kycCount, color: 'red' },
        { id: 'hosts' as const, icon: Users, label: 'Host Management', count: 0, color: 'blue' },
        { id: 'listings' as const, icon: Home, label: 'Listings', count: listingsCount, color: 'orange' },
        { id: 'financials' as const, icon: DollarSign, label: 'Financials', count: 0, color: 'green' },
        { id: 'escrow' as const, icon: Scale, label: 'Escrow Manager', count: 0, color: 'purple' },
        { id: 'disputes' as const, icon: AlertTriangle, label: 'Disputes', count: disputesCount, color: 'red' },
    ];

    return (
        <aside className="hidden lg:flex lg:flex-col w-64 glass-card border-r border-white/20 fixed top-16 left-0 bottom-0 z-40 backdrop-blur-xl">
            {/* Header */}
            <div className="p-6 border-b border-white/20 shrink-0">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-600/30">
                        <ShieldCheck size={18} className="text-white" />
                    </div>
                    Admin Panel
                </h2>
                <p className="text-xs text-gray-500 mt-1">Platform management</p>
            </div>

            {/* Quick Stats */}
            <div className="p-4 border-b border-white/20 shrink-0">
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200/50">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp size={14} className="text-green-600" />
                            <span className="text-xs font-medium text-green-700">Revenue</span>
                        </div>
                        <p className="text-lg font-bold text-green-900">{locale.currencySymbol}12.5K</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200/50">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity size={14} className="text-blue-600" />
                            <span className="text-xs font-medium text-blue-700">Active</span>
                        </div>
                        <p className="text-lg font-bold text-blue-900">247</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const hasCount = item.count > 0;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                ${isActive
                                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-600/30 scale-[1.02]'
                                    : 'text-gray-700 hover:bg-white/60 hover:scale-[1.01] active:scale-[0.99]'
                                }
                                group relative overflow-hidden
                            `}
                        >
                            {/* Hover effect background */}
                            {!isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-50 to-brand-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            )}

                            <Icon size={18} className={`relative z-10 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-brand-600'}`} />
                            <span className="relative z-10 flex-1 text-left">{item.label}</span>

                            {hasCount && (
                                <span className={`
                                    relative z-10 text-xs font-bold px-2 py-0.5 rounded-full
                                    ${isActive
                                        ? 'bg-white/20 text-white'
                                        : `bg-${item.color}-100 text-${item.color}-700`
                                    }
                                    ${item.color === 'red' ? 'animate-pulse' : ''}
                                `}>
                                    {item.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/20 shrink-0">
                <div className="text-xs text-gray-500 text-center">
                    <p className="font-medium">{APP_INFO.NAME} Admin</p>
                    <p className="mt-1">Version {APP_INFO.VERSION}</p>
                </div>
            </div>
        </aside>
    );
};
