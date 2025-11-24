import React from 'react';
import { ShieldCheck, UserCheck, Users, Home, DollarSign, Scale, AlertTriangle } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: 'kyc' | 'hosts' | 'listings' | 'financials' | 'escrow' | 'disputes';
  setActiveTab: (tab: 'kyc' | 'hosts' | 'listings' | 'financials' | 'escrow' | 'disputes') => void;
  unverifiedHostsCount: number;
  pendingListingsCount: number;
  openDisputesCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  unverifiedHostsCount,
  pendingListingsCount,
  openDisputesCount
}) => {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed top-16 left-0 bottom-0 z-40">
      <div className="p-6 border-b border-gray-200 shrink-0">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck size={20} className="text-brand-600" />
          Admin Panel
        </h2>
        <p className="text-xs text-gray-500 mt-1">Platform management</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
        <button onClick={() => setActiveTab('kyc')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'kyc' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
          <UserCheck size={18} />
          KYC Requests
          {unverifiedHostsCount > 0 && (
            <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{unverifiedHostsCount}</span>
          )}
        </button>
        <button onClick={() => setActiveTab('hosts')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'hosts' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
          <Users size={18} />
          Host Management
        </button>
        <button onClick={() => setActiveTab('listings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'listings' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
          <Home size={18} />
          Listings
          {pendingListingsCount > 0 && (
            <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingListingsCount}</span>
          )}
        </button>
        <button onClick={() => setActiveTab('financials')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'financials' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
          <DollarSign size={18} />
          Financials
        </button>
        <button onClick={() => setActiveTab('escrow')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'escrow' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
          <Scale size={18} />
          Escrow Manager
        </button>
        <button onClick={() => setActiveTab('disputes')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'disputes' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
          <AlertTriangle size={18} />
          Disputes
          {openDisputesCount > 0 && (
            <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{openDisputesCount}</span>
          )}
        </button>
      </nav>
    </aside>
  );
};
