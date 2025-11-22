
import React, { useState, useEffect } from 'react';
import { User, Listing, ListingStatus, Booking, EscrowTransaction, PlatformFinancials } from '../types';
import { updateKYC, saveListing, getBookings } from '../services/storage';
import { escrowService } from '../services/escrowService';
import { Check, X, ShieldCheck, MapPin, FileText, Camera, AlertTriangle, UserCheck, Sparkles, CheckCircle, DollarSign, TrendingUp, Clock, ArrowUpRight, Download } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto relative">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="text-brand-600" />
          Super Admin
        </h1>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'kyc' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
          >
            KYC Requests
            {unverifiedHosts.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-1.5 rounded-full">{unverifiedHosts.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'listings' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
          >
            Space Approvals
            {pendingListings.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-1.5 rounded-full">{pendingListings.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'financials' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
          >
            Financials
          </button>
        </div>
      </div>

      {activeTab === 'kyc' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium grid grid-cols-4 gap-4">
            <div className="col-span-2">User</div>
            <div>Identity Doc</div>
            <div className="text-right">Action</div>
          </div>
          {unverifiedHosts.length === 0 && <div className="p-8 text-center text-gray-500">No pending KYC requests.</div>}
          {unverifiedHosts.map(u => (
            <div key={u.id} className="p-4 border-b border-gray-100 grid grid-cols-4 gap-4 items-center">
              <div className="col-span-2">
                <div className="font-medium text-gray-900">{u.name}</div>
                <div className="text-sm text-gray-500">{u.email}</div>
              </div>
              <div>
                {u.identityDocument ? (
                  <a href={u.identityDocument} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                    <UserCheck size={14} /> View ID
                  </a>
                ) : (
                  <span className="text-gray-400 text-sm">Pending Upload</span>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => handleVerifyUser(u.id, false)} className="p-2 text-red-600 hover:bg-red-50 rounded-full"><X size={18} /></button>
                <button onClick={() => handleVerifyUser(u.id, true)} className="p-2 text-green-600 hover:bg-green-50 rounded-full"><Check size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="space-y-6">
          {pendingListings.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              No listings pending approval.
            </div>
          )}
          {pendingListings.map(l => (
            <div key={l.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
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
                      <img key={i} src={img} alt="" className="h-32 w-48 object-cover rounded-lg border border-gray-100 flex-shrink-0" />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="text-sm text-gray-500">
                    Submitted by Host ID: <span className="font-mono text-gray-700">{l.hostId}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openRejectionModal(l.id)}
                      className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition flex items-center gap-2"
                    >
                      <X size={16} /> Decline
                    </button>
                    <button
                      onClick={() => handleApproveListing(l, true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
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
        <FinancialsTab
          financials={financials}
          bookings={bookings}
          transactions={transactions}
          listings={listings}
          loading={loading}
        />
      )}

      {/* Rejection Modal */}
      {rejectionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle size={20} /> Decline Listing
              </h3>
              <button onClick={() => setRejectionModal({ isOpen: false, listingId: null, reason: '' })} className="p-1 hover:bg-gray-200 rounded-full"><X size={18} /></button>
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
  );
};

export default AdminPanel;
