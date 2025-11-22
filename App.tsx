
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HostDashboard from './components/HostDashboard';
import UserDashboard from './components/UserDashboard';
import ListingCard from './components/ListingCard';
import AdminPanel from './components/AdminPanel';
import ListingDetails from './components/ListingDetails';
import { User, Role, Listing, ListingStatus, Booking, SpaceType, View } from './types';
import { getCurrentUser, loginUser, logoutUser, getListings, initStorage, updateKYC, createBooking, getAllUsers, STORAGE_KEYS } from './services/storage';
import { escrowService } from './services/escrowService';
import { startAutoReleaseScheduler, stopAutoReleaseScheduler } from './services/schedulerService';
import { UploadCloud, Check, Home as HomeIcon, Camera, Users, Music, Briefcase, Sun, Search, Plus, X, Mail, ArrowLeft, AlertCircle, Clock, Shield } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import HostOnboarding from './components/HostOnboarding';
import KYCUpload from './components/KYCUpload';

const ListingDetailsRoute: React.FC<{
  listings: Listing[];
  user: User | null;
  onBook: (dates: string[], duration: number, breakdown: any, selectedHours?: number[], guestCount?: number, selectedAddOns?: string[]) => void;
  onVerify: () => void;
  onLogin: () => void;
  onRefreshUser: () => void;
}> = ({ listings, user, onBook, onVerify, onLogin, onRefreshUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const listing = listings.find(l => l.id === id);

  if (!listing) {
    return <div>Listing not found</div>;
  }

  return (
    <ListingDetails
      listing={listing}
      user={user}
      onBack={() => navigate('/')}
      onBook={(...args) => onBook(listing, ...args)}
      onVerify={onVerify}
      onLogin={onLogin}
      onRefreshUser={onRefreshUser}
    />
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    initStorage();
    const storedUser = getCurrentUser();
    setUser(storedUser);
    setListings(getListings());
    setAllUsers(getAllUsers());

    // Start automated release scheduler
    startAutoReleaseScheduler((bookingId, amount) => {
      console.log(`🎉 Auto-released $${amount} for booking ${bookingId}`);
      // Refresh data to show updated status
      refreshData();
    });

    // Cleanup on unmount
    return () => {
      stopAutoReleaseScheduler();
    };
  }, []);

  const refreshData = () => {
    setUser(getCurrentUser());
    setListings(getListings());
    setAllUsers(getAllUsers());
  };

  // Smart navigation handler
  const handleNavigate = (targetView: string) => {
    if (targetView === 'home') {
      navigate('/');
    } else if (targetView.startsWith('dashboard')) {
      navigate(targetView === 'dashboard-host' ? '/host/dashboard' : '/dashboard');
    } else {
      navigate('/' + targetView);
    }
  };

  const handleLogin = (role: Role) => {
    const u = loginUser(role);
    setUser(u);
    if (role === Role.HOST) {
      // If host is not verified, guide them
      if (!u.kycVerified && !u.identityDocument) {
        navigate('/kyc');
      } else {
        navigate('/host/dashboard');
      }
    } else if (role === Role.ADMIN) {
      navigate('/admin');
    } else {
      // Role.USER
      // If we were on a listing page, we might want to go back there?
      // For now, just go home or dashboard
      navigate('/');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    navigate('/');
  };

  const handleKYCUpload = () => {
    if (!user) return;
    // 1. Update Storage (Mock URL for ID)
    updateKYC(user.id, false, 'https://example.com/id_card_simulated.jpg');

    // 2. CRITICAL: Update Local State immediately so UI reflects the change
    const updatedUser = getCurrentUser();
    setUser(updatedUser);
    refreshData(); // Sync persistent DB state

    setNotification('Identity document uploaded! Admin will verify shortly.');
    navigate('/host/dashboard');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUserVerification = async () => {
    if (!user) return;
    // Update persistent storage (mock DB)
    updateKYC(user.id, true, 'https://example.com/id_card.jpg');

    // Update session state immediately so UI reflects verification
    const updatedUser = { ...user, kycVerified: true };
    setUser(updatedUser);
    refreshData();

    // Show a short notification and return once the store/state is updated.
    setNotification('Identity Verified! Proceeding with booking...');
    setTimeout(() => setNotification(null), 3000);

    // Wait a tick to ensure callers that await this function observe updated storage/state
    await new Promise((res) => setTimeout(res, 50));
  };

  const handleListingClick = (listing: Listing) => {
    navigate(`/listing/${listing.id}`);
  };

  const handleBookSpace = (listing: Listing, dates: string[], duration: number, breakdown: { total: number, service: number, caution: number }, selectedHours?: number[], guestCount?: number, selectedAddOns?: string[]) => {
    if (!user || !listing) return;

    const groupId = dates.length > 1 ? Math.random().toString(36).substr(2, 9) : undefined;

    // We split the total proportional to the number of dates for record keeping, 
    // but for this demo, we'll just divide evenly.
    // Note: Caution fee is technically 1-time per group, but for simplicity in data model we divide it or assign to first.
    // Let's divide evenly for simplicity in the booking records.
    const pricePerBooking = breakdown.total / dates.length;
    const serviceFeePerBooking = breakdown.service / dates.length;
    const cautionFeePerBooking = breakdown.caution / dates.length;

    dates.forEach(async (date, index) => {
      const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newBooking: Booking = {
        id: bookingId,
        listingId: listing.id,
        userId: user.id,
        date: date,
        duration: duration,
        hours: selectedHours, // Store the specific hours
        totalPrice: pricePerBooking,
        serviceFee: serviceFeePerBooking,
        cautionFee: cautionFeePerBooking,
        status: 'Pending',
        groupId: groupId,
        guestCount: guestCount || 1,
        selectedAddOns: selectedAddOns || [],
        paymentStatus: 'Paid - Escrow',
        escrowReleaseDate: escrowService.calculateReleaseDate(date, selectedHours),
        transactionIds: []
      };

      // Process payment through escrow service
      const paymentResult = await escrowService.processGuestPayment(newBooking, user.id);

      if (paymentResult.success) {
        newBooking.transactionIds = paymentResult.transactionIds;
      }

      createBooking(newBooking);
    });

    const message = dates.length > 1
      ? `Recurring Booking Request Sent! (${dates.length} dates)`
      : `Booking Request Sent! Total: $${breakdown.total.toFixed(2)}`;

    setNotification(message);

    setTimeout(() => {
      setNotification(null);
      navigate('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
      <Navbar
        user={user}
        onLogout={handleLogout}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />

      {/* Host KYC Banner */}
      {user?.role === Role.HOST && !user.kycVerified && location.pathname !== '/kyc' && (
        <div className={`${user.identityDocument ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'} border-b px-4 py-3 relative z-40`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`${user.identityDocument ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'} p-1.5 rounded-full shrink-0`}>
                {user.identityDocument ? <Clock size={16} /> : <AlertCircle size={16} />}
              </div>
              <div className={`text-sm ${user.identityDocument ? 'text-blue-900' : 'text-orange-900'}`}>
                {user.identityDocument ? (
                  <>
                    <span className="font-bold">Identity Verification Pending:</span> Your ID is under review by our team. You will be notified once approved.
                  </>
                ) : (
                  <>
                    <span className="font-bold">Account Verification Needed:</span> Verify your identity to publish listings and accept bookings.
                  </>
                )}
              </div>
            </div>
            {!user.identityDocument && (
              <button
                onClick={() => navigate('/kyc')}
                className="text-sm font-semibold text-orange-700 underline decoration-orange-300 hover:text-orange-900 hover:decoration-orange-900 underline-offset-2 whitespace-nowrap"
              >
                Complete Verification &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed top-24 right-4 z-50 bg-black text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right">
          <Check size={18} className="text-green-400" />
          {notification}
        </div>
      )}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={
            <Home
              listings={listings}
              user={user}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchTerm={searchTerm}
              onBecomeHostClick={() => navigate('/login-host')}
            />
          } />
          <Route path="/login" element={<Login onLogin={handleLogin} onBack={() => navigate('/')} />} />
          <Route path="/login-host" element={<HostOnboarding onLogin={handleLogin} onBack={() => navigate('/')} />} />
          <Route path="/kyc" element={<KYCUpload onUpload={handleKYCUpload} onSkip={() => navigate('/host/dashboard')} />} />
          <Route path="/dashboard" element={
            <UserDashboard
              user={user!}
              listings={listings}
              onNavigate={handleNavigate}
            />
          } />
          <Route path="/host/dashboard" element={
            <HostDashboard
              user={user!}
              listings={listings}
              onNavigate={handleNavigate}
              refreshData={refreshData}
              onUpdateListing={(updated) => {
                const newListings = listings.map(l => l.id === updated.id ? updated : l);
                setListings(newListings);
                localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(newListings));
              }}
              onCreateListing={(newListing) => {
                const newListings = [...listings, newListing];
                setListings(newListings);
                localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(newListings));
              }}
            />
          } />
          <Route path="/admin" element={
            <AdminPanel
              users={allUsers}
              listings={listings}
              onVerifyUser={(userId, verified) => {
                const updatedUsers = allUsers.map(u => u.id === userId ? { ...u, kycVerified: verified } : u);
                setAllUsers(updatedUsers);
                localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(updatedUsers));
                // Also update current user if it's them
                if (user && user.id === userId) {
                  const updatedUser = { ...user, kycVerified: verified };
                  setUser(updatedUser);
                  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
                }
              }}
            />
          } />
          <Route path="/listing/:id" element={
            <ListingDetailsRoute
              listings={listings}
              user={user}
              onBook={handleBookSpace}
              onVerify={handleUserVerification}
              onLogin={() => navigate('/login')}
              onRefreshUser={refreshData}
            />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {/* Footer - Only show on home page or listing details */}
      {(location.pathname === '/' || location.pathname.startsWith('/listing/')) && (
        <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-8 text-center text-gray-500">
            <p>&copy; 2024 Fiilar. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
