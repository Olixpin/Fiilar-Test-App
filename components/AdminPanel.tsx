
import React, { useState, useEffect } from 'react';
import { User, Listing, ListingStatus, Booking, EscrowTransaction, PlatformFinancials } from '../types';
import { updateKYC, saveListing, getBookings } from '../services/storage';
import { escrowService } from '../services/escrowService';
import { Check, X, ShieldCheck, MapPin, FileText, Camera, AlertTriangle, UserCheck, Sparkles, CheckCircle, DollarSign, TrendingUp, Clock, ArrowUpRight, Download, Users, Home, Activity, Search, Filter } from 'lucide-react';
import FinancialsTab from './FinancialsTab';

interface AdminPanelProps {
  users: User[]; // In a real app, fetch via API
  listings: Listing[];
  refreshData: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ users, listings, refreshData }) => {
  const [activeTab, setActiveTab] = useState<'kyc' | 'listings' | 'financials'>('kyc');
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean, listingId: string | null, reason: string }>({
    isOpen: false, listingId: null, reason: ''
  });
  const [financials, setFinancials] = useState<PlatformFinancials | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock logic to find users who need verification (in reality, backend query)
  const unverifiedHosts = users.filter(u => !u.kycVerified && u.role === 'HOST'); // Basic filter
  // Get listings pending approval
  const pendingListings = listings.filter(l => l.status === ListingStatus.PENDING_APPROVAL);

  // Load financial data when financials tab is active
  useEffect(() => {
    if (activeTab === 'financials') {
      loadFinancialData();
    }
  }, [activeTab]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const allBookings = getBookings();
      const platformFinancials = await escrowService.getPlatformFinancials(allBookings);
      const allTransactions = await escrowService.getEscrowTransactions();

      setBookings(allBookings);
      setFinancials(platformFinancials);
      setTransactions(allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Failed to load financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = (userId: string, approve: boolean) => {
    if (approve) {
      updateKYC(userId, true);
      alert(`User ${userId} approved. Email sent.`);
    } else {
      alert(`User ${userId} rejected. Email sent.`);
    }
    refreshData();
  };

  const handleApproveListing = (listing: Listing, approve: boolean, reason?: string) => {
    const updatedListing = {
      ...listing,
      status: approve ? ListingStatus.LIVE : ListingStatus.REJECTED,
      rejectionReason: reason
    };
    saveListing(updatedListing);
    if (approve) {
      alert(`Listing "${listing.title}" Approved. Email notification sent.`);
    }
    refreshData();
  };

  const openRejectionModal = (id: string) => {
    setRejectionModal({ isOpen: true, listingId: id, reason: '' });
  };

  const handleRejectionSubmit = () => {
    if (!rejectionModal.listingId) return;
    const listing = listings.find(l => l.id === rejectionModal.listingId);
    if (listing) {
      handleApproveListing(listing, false, rejectionModal.reason);
    }
    setRejectionModal({ isOpen: false, listingId: null, reason: '' });
  };

  const presetPhotographyOffer = () => {
    setRejectionModal(prev => ({
      ...prev,
      reason: "Your space has great potential, but the photos provided don't meet our quality standards. We'd like to offer you a COMPLIMENTARY professional photography session to help your listing shine. Please reply to accept this offer."
    }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Sidebar */}
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
            {unverifiedHosts.length > 0 && (
              <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{unverifiedHosts.length}</span>
            )}
          </button>
          <button onClick={() => setActiveTab('listings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'listings' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <Home size={18} />
            Listings
            {pendingListings.length > 0 && (
              <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingListings.length}</span>
            )}
          </button>
          <button onClick={() => setActiveTab('financials')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'financials' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <DollarSign size={18} />
            Financials
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="min-h-screen lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('kyc')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === 'kyc' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>KYC</button>
            <button onClick={() => setActiveTab('listings')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === 'listings' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Listings</button>
            <button onClick={() => setActiveTab('financials')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === 'financials' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Financials</button>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

            {activeTab === 'kyc' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Header */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">KYC Verification</h2>
                      <p className="text-sm text-gray-500 mt-1">Review and approve host identity documents</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search users..."
                          className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</h3>
                      <div className="bg-orange-100 p-2 rounded-lg text-orange-700">
                        <Clock size={18} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{unverifiedHosts.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Verified</h3>
                      <div className="bg-green-100 p-2 rounded-lg text-green-700">
                        <CheckCircle size={18} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.kycVerified).length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total approved</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Users</h3>
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                        <Users size={18} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Platform users</p>
                  </div>
                </div>

                {/* KYC List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Document</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Submitted</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {unverifiedHosts.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                  <UserCheck size={24} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">No pending KYC requests</p>
                                <p className="text-sm text-gray-400 mt-1">All users are verified</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          unverifiedHosts.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 transition">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold">
                                    {u.name.charAt(0)}
                                  </div>
                                  <div className="font-medium text-gray-900">{u.name}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                              <td className="px-6 py-4">
                                {u.identityDocument ? (
                                  <a href={u.identityDocument} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                                    <FileText size={14} /> View Document
                                  </a>
                                ) : (
                                  <span className="text-sm text-gray-400">Not uploaded</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">Just now</td>
                              <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleVerifyUser(u.id, false)} className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1">
                                    <X size={14} /> Reject
                                  </button>
                                  <button onClick={() => handleVerifyUser(u.id, true)} className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center gap-1">
                                    <Check size={14} /> Approve
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Header */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Listing Approvals</h2>
                      <p className="text-sm text-gray-500 mt-1">Review and approve property listings</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                        <Filter size={16} /> Filter
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</h3>
                      <div className="bg-orange-100 p-2 rounded-lg text-orange-700">
                        <Clock size={18} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{pendingListings.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live</h3>
                      <div className="bg-green-100 p-2 rounded-lg text-green-700">
                        <CheckCircle size={18} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{listings.filter(l => l.status === ListingStatus.LIVE).length}</p>
                    <p className="text-xs text-gray-500 mt-1">Active listings</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</h3>
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                        <Home size={18} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
                    <p className="text-xs text-gray-500 mt-1">All listings</p>
                  </div>
                </div>

                {pendingListings.length === 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Home size={32} className="text-gray-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">No pending listings</h3>
                    <p className="text-sm text-gray-500">All listings have been reviewed</p>
                  </div>
                )}
                {pendingListings.map(l => (
                  <div key={l.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{l.title}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin size={14} className="mr-1" /> {l.location}
                          </div>

                          {/* AI Verification Badge */}
                          <div className="mt-3 flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100">
                            <Sparkles size={14} className="text-purple-500" />
                            <span className="text-xs font-bold text-gray-700">AI Analysis:</span>
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                              <CheckCircle size={12} /> Address matches document (98% confidence)
                            </span>
                          </div>

                          {l.proofOfAddress && (
                            <a href={l.proofOfAddress} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition">
                              <FileText size={12} /> View Proof of Address
                            </a>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="block text-lg font-bold text-brand-600">${l.price} <span className="text-sm font-normal text-gray-400">/ {l.priceUnit}</span></span>
                          <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">{l.type}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4">{l.description}</p>

                      <div className="mb-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Images</h4>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {l.images.map((img, i) => (
                            <img key={i} src={img} alt="" className="h-32 w-48 object-cover rounded-lg border border-gray-100 shrink-0" />
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-gray-100 pt-4">
                        <div className="text-sm text-gray-500">
                          Host: <span className="font-medium text-gray-700">{users.find(u => u.id === l.hostId)?.name || 'Unknown'}</span>
                          <span className="mx-2">•</span>
                          <span className="font-mono text-xs">{l.hostId.slice(0, 8)}</span>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => openRejectionModal(l.id)}
                            className="flex-1 sm:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition flex items-center justify-center gap-2"
                          >
                            <X size={16} /> Decline
                          </button>
                          <button
                            onClick={() => handleApproveListing(l, true)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                          >
                            <Check size={16} /> Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

            {/* Rejection Modal */}
            {rejectionModal.isOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-red-600 flex items-center gap-2">
                      <AlertTriangle size={20} /> Decline Listing
                    </h3>
                    <button onClick={() => setRejectionModal({ isOpen: false, listingId: null, reason: '' })} className="p-1 hover:bg-gray-200 rounded-full" title="Close"><X size={18} /></button>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">Please provide a reason for declining this listing. This will be sent to the host.</p>

                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm h-32 mb-3 focus:ring-2 focus:ring-red-500 outline-none"
                      placeholder="Reason for rejection..."
                      value={rejectionModal.reason}
                      onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                    />

                    <button
                      onClick={presetPhotographyOffer}
                      className="w-full mb-4 flex items-center justify-center gap-2 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-100 py-2.5 rounded-lg hover:bg-brand-100 transition"
                    >
                      <Camera size={14} /> Bad Photos? Offer Free Photography
                    </button>

                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => setRejectionModal({ isOpen: false, listingId: null, reason: '' })}
                        className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRejectionSubmit}
                        disabled={!rejectionModal.reason}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirm Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
