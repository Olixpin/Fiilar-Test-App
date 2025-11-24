
import React from 'react';
import { User, Listing } from '@fiilar/types';
import FinancialsTab from '../components/FinancialsTab';
import EscrowManager from '../components/EscrowManager';
import DisputeCenter from '../components/DisputeCenter';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminKYC } from '../components/AdminKYC';
import { AdminHosts } from '../components/AdminHosts';
import { AdminListings } from '../components/AdminListings';
import { useAdminData } from '../hooks/useAdminData';

interface AdminPanelProps {
  users: User[]; // In a real app, fetch via API
  listings: Listing[];
  refreshData: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ users, listings, refreshData }) => {
  const {
    activeTab, setActiveTab,
    rejectionModal, setRejectionModal,
    financials,
    bookings,
    transactions,
    loading,
    unverifiedHosts,
    pendingListings,
    openDisputes,
    loadFinancialData,
    handleVerifyUser,
    handleUpdateBadgeStatus,
    handleApproveListing,
    openRejectionModal,
    handleRejectionSubmit,
    presetPhotographyOffer
  } = useAdminData({ users, listings, refreshData });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        kycCount={unverifiedHosts.length}
        listingsCount={pendingListings.length}
        disputesCount={openDisputes.length}
      />

      {/* Main Content */}
      <div className="min-h-screen lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('kyc')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === 'kyc' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>KYC</button>
            <button onClick={() => setActiveTab('hosts')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === 'hosts' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Hosts</button>
            <button onClick={() => setActiveTab('listings')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === 'listings' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Listings</button>
            <button onClick={() => setActiveTab('financials')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === 'financials' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Financials</button>
            <button onClick={() => setActiveTab('escrow')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === 'escrow' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Escrow</button>
            <button onClick={() => setActiveTab('disputes')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === 'disputes' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Disputes</button>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

            {activeTab === 'kyc' && (
              <AdminKYC
                unverifiedHosts={unverifiedHosts}
                users={users}
                handleVerifyUser={handleVerifyUser}
                handleUpdateBadgeStatus={handleUpdateBadgeStatus}
              />
            )}

            {activeTab === 'hosts' && (
              <AdminHosts
                users={users}
                listings={listings}
                handleUpdateBadgeStatus={handleUpdateBadgeStatus}
              />
            )}

            {activeTab === 'listings' && (
              <AdminListings
                pendingListings={pendingListings}
                listings={listings}
                users={users}
                handleApproveListing={handleApproveListing}
                openRejectionModal={openRejectionModal}
                rejectionModal={rejectionModal}
                setRejectionModal={setRejectionModal}
                handleRejectionSubmit={handleRejectionSubmit}
                presetPhotographyOffer={presetPhotographyOffer}
              />
            )}

            {activeTab === 'financials' && (
              <div className="animate-in fade-in">
                <FinancialsTab
                  financials={financials}
                  bookings={bookings}
                  transactions={transactions}
                  listings={listings}
                  loading={loading}
                />
              </div>
            )}

            {activeTab === 'escrow' && (
              <div className="animate-in fade-in">
                <EscrowManager
                  financials={financials}
                  transactions={transactions}
                  loading={loading}
                />
              </div>
            )}

            {activeTab === 'disputes' && (
              <div className="animate-in fade-in">
                <DisputeCenter
                  bookings={bookings}
                  listings={listings}
                  refreshData={loadFinancialData}
                />
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
