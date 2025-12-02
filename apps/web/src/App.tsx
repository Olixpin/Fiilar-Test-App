import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/common/Navbar';
import { User, Role, Listing, Booking } from '@fiilar/types';
import { initStorage, loginUser, getCurrentUser, logoutUser, getListings, getAllUsers, createSecureBooking, STORAGE_KEYS, updateUserProfile } from '@fiilar/storage';
import { updateKYC, updateLiveness } from '@fiilar/kyc';
import { escrowService } from '@fiilar/escrow';
import { startAutoReleaseScheduler, stopAutoReleaseScheduler } from '@fiilar/escrow';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import Home from './features/Listings/pages/Home';
import ErrorBoundary from './components/common/ErrorBoundary';
import { analytics } from './services/analytics';
import { LocaleProvider, useToast } from '@fiilar/ui';
import { formatCurrency } from './utils/currency';
import ScrollToTop from './components/common/ScrollToTop';
import SupportModal from './components/common/SupportModal';
import GuestBottomNav from './components/common/GuestBottomNav';

const HostDashboard = lazy(() => import('./features/HostDashboard/pages/HostDashboardPage'));
const UserDashboard = lazy(() => import('./features/UserDashboard/pages/UserDashboard'));
const AdminPanel = lazy(() => import('@fiilar/admin').then(module => ({ default: module.AdminPanel })));
const ListingDetails = lazy(() => import('./features/Listings/pages/ListingDetails'));
const Login = lazy(() => import('./features/Auth/pages/Login'));
const HostOnboarding = lazy(() => import('./features/HostDashboard/pages/HostOnboarding'));
const CompleteProfile = lazy(() => import('./features/Auth/pages/CompleteProfile'));
const CompleteProfileHost = lazy(() => import('./features/Auth/pages/CompleteProfileHost'));
const KYCUpload = lazy(() => import('./features/Auth/components/KYCUpload'));
const TermsAndConditions = lazy(() => import('./components/common/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./components/common/PrivacyPolicy'));
const EmailVerificationBanner = lazy(() => import('./features/Auth/components/EmailVerificationBanner'));
const VerifyEmailPage = lazy(() => import('./features/Auth/pages/VerifyEmailPage'));
const NotFound = lazy(() => import('./components/common/NotFound'));
const SystemHealthCheck = lazy(() => import('@fiilar/admin').then(module => ({ default: module.SystemHealthCheck })));
const FixWallet = lazy(() => import('./features/Admin/pages/FixWallet'));
const GlassSliderDemo = lazy(() => import('./features/Demo/GlassSliderDemo'));

const ListingDetailsRoute: React.FC<{
  listings: Listing[];
  user: User | null;
  onBook: (listing: Listing, dates: string[], duration: number, breakdown: any, selectedHours?: number[], guestCount?: number, selectedAddOns?: string[]) => Promise<Booking[]>;
  onVerify: () => void;
  onLogin: () => void;
  onRefreshUser: () => void;
}> = ({ user, onBook, onVerify, onLogin, onRefreshUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showSupportModal, setShowSupportModal] = useState(false);

  // IMPORTANT: Fetch listing directly from localStorage for freshest data
  // This ensures new tabs see the latest data, not stale React state
  const listing = React.useMemo(() => {
    if (!id) return undefined;
    const baseListing = getListings().find(l => l.id === id);

    // If user is host, check for local draft to show latest preview
    if (baseListing && user && baseListing.hostId === user.id) {
      try {
        const draftKey = `listing_draft_${user.id}_${baseListing.id}`;
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          // Merge draft data if it exists
          // We prioritize draft data for editable fields
          console.log('🎨 Showing draft preview for host');
          return {
            ...baseListing,
            title: draft.title || baseListing.title,
            description: draft.description || baseListing.description,
            // Use draft images if they exist, otherwise keep original
            images: (draft.images && draft.images.length > 0) ? draft.images : baseListing.images,
            price: draft.price || baseListing.price,
            location: draft.location || baseListing.location,
            amenities: draft.amenities || baseListing.amenities,
            houseRules: draft.houseRules || baseListing.houseRules,
            safetyItems: draft.safetyItems || baseListing.safetyItems,
            // Keep original status and id
          };
        }
      } catch (e) {
        console.error('Failed to load draft for preview', e);
      }
    }

    return baseListing;
  }, [id, user]);

  if (!listing) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {/* Illustration */}
          <div className="relative w-48 h-48 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-rose-100 rounded-full animate-pulse" />
            <div className="absolute inset-4 bg-white rounded-full shadow-lg flex items-center justify-center">
              <svg className="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          {/* Text Content */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Listing Not Found
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Oops! The space you're looking for doesn't exist or may have been removed by the host. Let's find you another amazing place.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
            >
              Explore Spaces
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>

          {/* Help Link */}
          <p className="mt-8 text-sm text-gray-400">
            Need help? <button onClick={() => setShowSupportModal(true)} className="text-brand-600 hover:underline">Contact Support</button>
          </p>

          {/* Support Modal */}
          <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
        </div>
      </div>
    );
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

import { useBookingExpiry } from './features/Bookings/hooks/useBookingExpiry';

const BecomeHostAction: React.FC<{ user: User; onSwitchRole: (role: Role) => void }> = ({ user, onSwitchRole }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user.role === Role.HOST) {
      // Already a host, go to host dashboard
      navigate('/host/dashboard', { replace: true });
    } else {
      // Switch role to HOST, then navigate
      onSwitchRole(Role.HOST);
    }
  }, [user.role, onSwitchRole, navigate]);
  
  // Show loading while switching
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
    </div>
  );
};

const App: React.FC = () => {
  useBookingExpiry();
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    initStorage();
    const storedUser = getCurrentUser();
    setUser(storedUser);
    const loadedListings = getListings();

    // Debug: Log listings to trace data persistence issues
    console.log('📋 App.tsx: Loaded listings from storage:', {
      count: loadedListings.length,
      userListings: loadedListings.filter(l => l.hostId === storedUser?.id).map(l => ({
        id: l.id,
        title: l.title,
        imageCount: l.images?.length || 0,
        firstImage: l.images?.[0]?.substring(0, 50)
      }))
    });

    setListings(loadedListings);
    setAllUsers(getAllUsers());
    setLoading(false);

    // Initialize analytics (add your GA4 ID here if you have one)
    analytics.init();

    // Start automated release scheduler
    startAutoReleaseScheduler((bookingId, amount) => {
      console.log(`🎉 Auto-released ${formatCurrency(amount)} for booking ${bookingId}`);
      refreshData();
    });

    return () => {
      stopAutoReleaseScheduler();
    };
  }, []);

  // Check if user needs to complete profile - REACTIVE to user state changes
  useEffect(() => {
    if (user) {
      // Migration: If user has name but no firstName/lastName, split it
      if (user.name && (!user.firstName || !user.lastName)) {
        const parts = user.name.split(' ');
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ') || parts[0]; // Fallback if single name

        // Update profile silently
        const result = updateUserProfile(user.id, { firstName, lastName });

        // Update local state if successful
        if (result.success && result.user) {
          setUser(result.user);
        } else {
          // Fallback to local update if storage update fails
          setUser(prev => prev ? { ...prev, firstName, lastName } : null);
        }
      }
      // Show modal only if NO name exists at all
      else if ((!user.firstName || !user.lastName) &&
        !user.name &&
        (user.authProvider === 'email' || user.authProvider === 'phone')) {
        setShowCompleteProfile(true);
      } else {
        // Hide modal if requirements are met
        setShowCompleteProfile(false);
      }
    }
  }, [user]);

  // Block navigation when profile is incomplete
  useEffect(() => {
    if (!showCompleteProfile) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block browser back button (Backspace outside inputs)
      if (e.key === 'Backspace' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
      }
      // Block refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showCompleteProfile]);

  // Listen for listing changes dispatched by other components and refresh
  useEffect(() => {
    const handler = () => {
      try {
        // detail may contain listing info, but we just refresh the app state
        refreshData();
      } catch (err) {
        console.error('Failed to refresh data on listings-updated event', err);
      }
    };

    window.addEventListener('fiilar:listings-updated', handler as EventListener);
    window.addEventListener('fiilar:user-updated', handler as EventListener);

    return () => {
      window.removeEventListener('fiilar:listings-updated', handler as EventListener);
      window.removeEventListener('fiilar:user-updated', handler as EventListener);
    };
  }, []);

  // Track page views
  useEffect(() => {
    analytics.pageView(location.pathname);
  }, [location.pathname]);

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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Navigate to home if not already there
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleLogin = (
    role: Role,
    provider: 'email' | 'google' | 'phone' = 'email',
    identifier?: string,
    profileData?: { firstName?: string; lastName?: string; avatar?: string }
  ) => {
    const u = loginUser(role, provider, identifier, profileData);
    console.log('LOGIN DEBUG:', {
      u,
      isProfileIncomplete: !u.firstName && !u.lastName && !u.name,
      firstName: u.firstName,
      lastName: u.lastName,
      name: u.name
    });
    setUser(u);

    // Check if profile is incomplete
    const isProfileIncomplete = !u.firstName && !u.lastName && !u.name;

    // Show appropriate toast based on profile status
    if (isProfileIncomplete) {
      showToast({ message: 'Verification successful! Please complete your profile.', type: 'success' });
      // Navigate to role-specific profile completion page
      navigate(role === Role.HOST ? '/complete-profile-host' : '/complete-profile');
      return;
    } else {
      showToast({ message: 'Welcome back!', type: 'success' });
    }

    analytics.trackLogin(provider);

    // Only navigate if profile is complete
    if (u.role === Role.HOST) {
      // If host is not verified, guide them
      if (!u.kycVerified && !u.identityDocument) {
        navigate('/kyc');
      } else {
        navigate('/host/dashboard');
      }
    } else if (u.role === Role.ADMIN) {
      navigate('/admin');
    } else {
      // Role.USER
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from);
    }
  };

  const handleLogout = () => {
    const wasHost = user?.role === Role.HOST;
    console.log('Logging out:', { wasHost, userRole: user?.role });
    logoutUser();
    setUser(null);
    showToast({ message: 'Logged out successfully', type: 'info' });
    const targetPath = wasHost ? '/login-host' : '/';
    console.log('Navigating to:', targetPath);
    navigate(targetPath, { replace: true });
  };

  const handleSwitchRole = (newRole: Role) => {
    if (!user) return;
    const updatedUser = { ...user, role: newRole, isHost: newRole === Role.HOST ? true : user.isHost };
    setUser(updatedUser);
    
    // Update session storage
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    
    // Also update users database to keep in sync
    const users = getAllUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
    }

    if (newRole === Role.HOST) {
      navigate('/host/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleKYCUpload = () => {
    const currentUser = user || getCurrentUser();

    if (!currentUser) {
      console.error('No user found for KYC upload');
      navigate('/login', { state: { from: location } });
      return;
    }

    // 1. Update Storage (Mock URL for ID)
    // TODO: Integrate Dojah here for real verification.
    // For now, we auto-approve (set true) to simulate a successful Dojah check.
    updateKYC(currentUser.id, 'verified', 'https://example.com/id_card_simulated.jpg');
    updateLiveness(currentUser.id, true);

    // 2. CRITICAL: Update Local State immediately so UI reflects the change
    const updatedUser = getCurrentUser();
    setUser(updatedUser);
    refreshData(); // Sync persistent DB state

    showToast({ message: 'Identity & Liveness Verified! (Dojah Simulation)', type: 'success' });
    navigate('/host/dashboard');
  };

  const handleUserVerification = async () => {
    if (!user) return;
    // Update persistent storage (mock DB)
    updateKYC(user.id, 'verified', 'https://example.com/id_card.jpg');

    // Update session state immediately so UI reflects verification
    const updatedUser = { ...user, kycVerified: true };
    setUser(updatedUser);
    refreshData();

    // Show a short notification and return once the store/state is updated.
    showToast({ message: 'Identity Verified! Proceeding with booking...', type: 'success' });

    // Wait a tick to ensure callers that await this function observe updated storage/state
    await new Promise((res) => setTimeout(res, 50));
  };

  const handleCompleteProfile = (firstName: string, lastName: string) => {
    if (!user) return;

    console.log('Completing profile:', { firstName, lastName, userRole: user.role, userId: user.id });

    const result = updateUserProfile(user.id, { firstName, lastName });
    if (result.success && result.user) {
      const updatedUser = result.user;
      console.log('Updated user:', { role: updatedUser.role, isHost: updatedUser.isHost });
      setUser(updatedUser);
      setShowCompleteProfile(false);
      showToast({ message: 'Profile completed! Welcome to Fiilar.', type: 'success' });

      // Navigate to appropriate page based on role
      if (updatedUser.role === Role.HOST) {
        console.log('Navigating HOST to:', !updatedUser.kycVerified && !updatedUser.identityDocument ? '/kyc' : '/host/dashboard');
        // Check if KYC is needed
        if (!updatedUser.kycVerified && !updatedUser.identityDocument) {
          navigate('/kyc');
        } else {
          navigate('/host/dashboard');
        }
      } else if (updatedUser.role === Role.ADMIN) {
        console.log('Navigating ADMIN to: /admin');
        navigate('/admin');
      } else {
        console.log('Navigating USER to: /dashboard');
        // Regular user
        navigate('/dashboard');
      }
    } else {
      showToast({ message: result.error || 'Failed to update profile', type: 'error' });
    }
  };



  const handleBookSpace = async (listing: Listing, dates: string[], duration: number, breakdown: { total: number, service: number, caution: number }, selectedHours?: number[], guestCount?: number, selectedAddOns?: string[]): Promise<Booking[]> => {
    if (!user || !listing) return [];

    const groupId = dates.length > 1 ? Math.random().toString(36).substr(2, 9) : undefined;

    // We split the total proportional to the number of dates for record keeping, 
    // but for this demo, we'll just divide evenly.
    // Note: Caution fee is technically 1-time per group, but for simplicity in data model we divide it or assign to first.
    // Let's divide evenly for simplicity in the booking records.
    const pricePerBooking = breakdown.total / dates.length;
    const serviceFeePerBooking = breakdown.service / dates.length;
    const cautionFeePerBooking = breakdown.caution / dates.length;

    const createdBookings: Booking[] = [];

    // Process bookings sequentially to ensure order and correct return
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      // Include index in ID to guarantee uniqueness even within the same millisecond
      const bookingId = `bk_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;

      // Determine booking status: Confirmed for instant book, Pending otherwise
      const bookingStatus = listing.settings?.instantBook ? 'Confirmed' : 'Pending';

      const newBooking: Booking = {
        id: bookingId,
        listingId: listing.id,
        userId: user.id,
        date: date,
        duration: duration,
        hours: selectedHours, // Store the specific hours
        bookingType: listing.priceUnit, // Use the listing's pricing model
        totalPrice: pricePerBooking,
        serviceFee: serviceFeePerBooking,
        cautionFee: cautionFeePerBooking,
        status: bookingStatus,
        groupId: groupId,
        guestCount: guestCount || 1,
        selectedAddOns: selectedAddOns || [],
        paymentStatus: 'Paid - Escrow',
        escrowReleaseDate: escrowService.calculateReleaseDate(date, selectedHours, duration),
        transactionIds: []
      };

      // Process payment through escrow service
      const paymentResult = await escrowService.processGuestPayment(newBooking, user.id);

      if (paymentResult.success) {
        newBooking.transactionIds = paymentResult.transactionIds;
      }

      // Use secure booking creation with price validation
      const bookingResult = createSecureBooking(newBooking, {
        listing: listing,
        datesCount: dates.length
      });

      if (!bookingResult.success) {
        // Security error - log and show error to user
        console.error('Booking creation failed:', bookingResult.error);
        showToast({
          message: bookingResult.securityError
            ? 'Booking failed: Security validation error. Please try again.'
            : `Booking failed: ${bookingResult.error}`,
          type: 'error'
        });
        return createdBookings; // Return what we've created so far
      }

      if (bookingResult.booking) {
        createdBookings.push(bookingResult.booking);
      }
    }

    // Only show success toast if at least one booking was created
    if (createdBookings.length > 0) {
      const isInstantBook = listing.settings?.instantBook;
      const message = dates.length > 1
        ? isInstantBook 
          ? `Recurring Booking Confirmed! (${createdBookings.length} of ${dates.length} dates)`
          : `Recurring Booking Request Sent! (${createdBookings.length} of ${dates.length} dates)`
        : isInstantBook
          ? `Booking Confirmed! Total: ${formatCurrency(breakdown.total)}`
          : `Booking Request Sent! Total: ${formatCurrency(breakdown.total)}`;

      showToast({ message, type: 'success' });
    }

    return createdBookings;
  };

  const validRoutes = ['/', '/kyc', '/dashboard', '/host/dashboard', '/admin', '/verify-email', '/terms', '/privacy', '/demo/glass-slider'];
  const isValidRoute = validRoutes.includes(location.pathname);
  const isDashboardRoute = location.pathname === '/dashboard' || location.pathname === '/host/dashboard';

  return (
    <LocaleProvider>
      <ErrorBoundary>
        {loading ? (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          </div>
        ) : (
          <div className="min-h-screen bg-gray-50">
            <ScrollToTop />
            {/* Show navbar only on valid routes, hide on dashboard */}
            {isValidRoute && !showCompleteProfile && !isDashboardRoute && (
              <Navbar
                user={user}
                onLogin={() => navigate('/login', { state: { from: location } })}
                onLogout={handleLogout}
                onBecomeHost={() => navigate('/login-host')}
                onNavigate={handleNavigate}
                onSearch={handleSearch}
                searchTerm={searchTerm}
                onSwitchRole={handleSwitchRole}
              />
            )}

            {/* Email Verification Banner */}
            {user && !user.emailVerified && !user.phoneVerified && (
              <EmailVerificationBanner
                userId={user.id}
                userEmail={user.email}
              />
            )}



            <main className="grow">
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div></div>}>
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
                  <Route path="/login" element={<Login onLogin={handleLogin} onBack={() => {
                    const from = (location.state as any)?.from?.pathname || '/';
                    navigate(from);
                  }} />} />
                  <Route path="/login-host" element={
                    user ? (
                      user.role === Role.ADMIN ? <Navigate to="/admin" replace /> :
                        <BecomeHostAction user={user} onSwitchRole={handleSwitchRole} />
                    ) : (
                      <HostOnboarding onLogin={handleLogin} onBack={() => navigate('/')} />
                    )
                  } />
                  <Route path="/complete-profile" element={
                    !user ? <Navigate to="/login" replace /> :
                      user.role === Role.HOST ? <Navigate to="/complete-profile-host" replace /> :
                        <CompleteProfile user={user} onComplete={handleCompleteProfile} />
                  } />
                  <Route path="/complete-profile-host" element={
                    !user ? <Navigate to="/login-host" replace /> :
                      user.role !== Role.HOST ? <Navigate to="/complete-profile" replace /> :
                        <CompleteProfileHost user={user} onComplete={handleCompleteProfile} />
                  } />
                  <Route path="/kyc" element={
                    !user ? <Navigate to="/login-host" replace /> :
                      user.role !== Role.HOST ? <Navigate to="/" replace /> :
                        <KYCUpload onUpload={handleKYCUpload} onSkip={() => navigate('/host/dashboard')} />
                  } />
                  <Route path="/dashboard" element={
                    !user ? <Navigate to="/login" replace /> :
                      (!user.firstName || !user.lastName) && !user.name ? <Navigate to="/complete-profile" replace /> :
                        <UserDashboard
                          user={user}
                          listings={listings}
                          onRefreshUser={refreshData}
                          onLogout={handleLogout}
                          onSwitchRole={handleSwitchRole}
                        />
                  } />
                  <Route path="/host/dashboard" element={
                    !user ? <Navigate to="/login-host" replace /> :
                      user.role === Role.ADMIN ? <Navigate to="/admin" replace /> :
                        user.role !== Role.HOST ? <Navigate to="/dashboard" replace /> :
                          (!user.firstName || !user.lastName) && !user.name ? <Navigate to="/complete-profile-host" replace /> :
                            <HostDashboard
                              user={user}
                              listings={listings}
                              refreshData={refreshData}
                              hideUI={showCompleteProfile}
                              onLogout={handleLogout}
                              onSwitchRole={handleSwitchRole}
                              onUpdateListing={(updated) => {
                                // Just update React state - localStorage is already updated by saveListing()
                                // DON'T write to localStorage here - it would overwrite raw data with transformed data
                                setListings(prev => prev.map(l => l.id === updated.id ? updated : l));
                              }}
                              onCreateListing={(newListing) => {
                                // Just update React state - localStorage is already updated by saveListing()
                                setListings(prev => [...prev, newListing]);
                              }}
                            />
                  } />
                  <Route path="/admin" element={
                    !user ? <Navigate to="/login" replace /> :
                      user.role !== Role.ADMIN ? <Navigate to="/" replace /> :
                        (!user.firstName || !user.lastName) && !user.name ? <Navigate to="/complete-profile" replace /> :
                          <AdminPanel
                            users={allUsers}
                            listings={listings}
                            refreshData={refreshData}
                          />
                  } />
                  <Route path="/listing/:id" element={
                    <ListingDetailsRoute
                      listings={listings}
                      user={user}
                      onBook={handleBookSpace}
                      onVerify={handleUserVerification}
                      onLogin={() => navigate('/login', { state: { from: location } })}
                      onRefreshUser={refreshData}
                    />
                  } />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/demo/glass-slider" element={<GlassSliderDemo />} />
                  <Route path="/health" element={
                    !user ? <Navigate to="/login" replace /> :
                      user.role !== Role.ADMIN ? <Navigate to="/" replace /> :
                        <SystemHealthCheck />
                  } />
                  <Route path="/fix-wallet" element={
                    !user ? <Navigate to="/login" replace /> :
                      user.role !== Role.ADMIN ? <Navigate to="/" replace /> :
                        <FixWallet />
                  } />

                  {/* 404 Catch-all Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes >
              </Suspense >
            </main >
            {/* Footer - Hide on Listing Details */}
            {
              (location.pathname === '/' || (location.pathname.startsWith('/listing/') && false)) && (
                <footer className="bg-[#1f2937] text-white py-12 mt-20 mb-20 lg:mb-0">
                  <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                      {/* Company Info */}
                      <div className="col-span-1">
                        <img
                          src="https://drive.google.com/thumbnail?id=11AM3I7DLtyDpwgduNdtbUaZXJUYpvruC&sz=w400"
                          alt="Fiilar"
                          className="h-6 mb-4 object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <p className="text-gray-400 text-sm">
                          Your trusted marketplace for booking unique spaces and experiences.
                        </p>
                      </div>

                      {/* Quick Links */}
                      <div>
                        <h4 className="font-semibold mb-4 text-white">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li><a href="#" className="hover:text-white transition">About Us</a></li>
                          <li><a href="#" className="hover:text-white transition">Careers</a></li>
                          <li><a href="#" className="hover:text-white transition">Press</a></li>
                          <li><a href="#" className="hover:text-white transition">Blog</a></li>
                        </ul>
                      </div>

                      {/* Support */}
                      <div>
                        <h4 className="font-semibold mb-4 text-white">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                          <li><a href="#" className="hover:text-white transition">Safety</a></li>
                          <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                          <li><a href="#" className="hover:text-white transition">Trust & Safety</a></li>
                        </ul>
                      </div>

                      {/* Legal */}
                      <div>
                        <h4 className="font-semibold mb-4 text-white">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li>
                            <button onClick={() => navigate('/terms')} className="hover:text-white transition text-left">
                              Terms & Conditions
                            </button>
                          </li>
                          <li>
                            <button onClick={() => navigate('/privacy')} className="hover:text-white transition text-left">
                              Privacy Policy
                            </button>
                          </li>
                          <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
                          <li><a href="#" className="hover:text-white transition">Sitemap</a></li>
                        </ul>
                      </div>
                    </div>

                    {/* Social Media & Copyright */}
                    <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
                      <p className="text-gray-400 text-sm mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} Fiilar. All rights reserved.
                      </p>
                      <div className="flex gap-6">
                        <a href="https://twitter.com/fiilar" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition" title="Twitter">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </a>
                        <a href="https://instagram.com/fiilar" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition" title="Instagram">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </a>
                        <a href="https://facebook.com/fiilar" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition" title="Facebook">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </a>
                        <a href="https://linkedin.com/company/fiilar" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition" title="LinkedIn">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </footer>
              )
            }

            {/* Guest Mobile Bottom Navigation */}
            {/* Show on home, dashboard (user), and other guest routes. Hide on host/admin/auth routes. */}
            {
              !location.pathname.startsWith('/host') &&
              !location.pathname.startsWith('/admin') &&
              !location.pathname.startsWith('/login') &&
              !location.pathname.startsWith('/complete-profile') &&
              !location.pathname.startsWith('/kyc') &&
              (
                <GuestBottomNav />
              )
            }
          </div >
        )}

      </ErrorBoundary >
    </LocaleProvider >
  );
};

export default App;
