
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HostDashboard from './components/HostDashboard';
import UserDashboard from './components/UserDashboard';
import ListingCard from './components/ListingCard';
import AdminPanel from './components/AdminPanel';
import ListingDetails from './components/ListingDetails';
import { User, Role, Listing, ListingStatus, Booking, SpaceType, View } from './types';
import { getCurrentUser, loginUser, logoutUser, getListings, initStorage, updateKYC, createBooking, getAllUsers } from './services/storage';
import { UploadCloud, Check, Home, Camera, Users, Music, Briefcase, Sun, Search, Plus, X, Mail, ArrowLeft, AlertCircle, Clock, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [view, setView] = useState<View>('home');
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Search & Filter State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Host Onboarding State
  const [hostEmail, setHostEmail] = useState('');
  const [hostStep, setHostStep] = useState(0); // 0: Landing, 1: Email, 2: Phone, 3: Done

  // User Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginStep, setLoginStep] = useState(0); // 0: Landing, 1: Email, 2: Phone

  useEffect(() => {
    initStorage();
    const storedUser = getCurrentUser();
    setUser(storedUser);
    setListings(getListings());
    setAllUsers(getAllUsers());
  }, []);

  const refreshData = () => {
    setUser(getCurrentUser());
    setListings(getListings());
    setAllUsers(getAllUsers());
  };

  // Smart navigation handler
  const handleNavigate = (targetView: View) => {
    // If we are navigating back to home or dashboard, clear the selected listing
    // If we are navigating to login, we might want to preserve it to return later
    if (targetView === 'home' || targetView.startsWith('dashboard')) {
       setSelectedListing(null);
    }
    setView(targetView);
  };

  const handleLogin = (role: Role) => {
    const u = loginUser(role);
    setUser(u);
    if (role === Role.HOST) {
      // If host is not verified, guide them
      if (!u.kycVerified && !u.identityDocument) {
         setView('kyc-upload');
      } else {
         setView('dashboard-host');
      }
    } else if (role === Role.ADMIN) {
      setView('dashboard-admin');
    } else {
      // Role.USER
      // If we have a selected listing, return to it
      if (selectedListing) {
        setView('listing-details');
      } else {
        setView('home');
      }
    }
    // Reset auth steps
    setHostStep(0);
    setLoginStep(0);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    handleNavigate('home');
    setHostStep(0);
    setLoginStep(0);
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
    setView('dashboard-host');
    setTimeout(() => setNotification(null), 4000);
  };
  
  const handleUserVerification = () => {
    if (!user) return;
    // Simulate instant verification for the "Just-in-Time" flow
    updateKYC(user.id, true, 'https://example.com/id_card.jpg');
    const updatedUser = { ...user, kycVerified: true };
    setUser(updatedUser);
    refreshData();
    // Persist the change to local state object as well if needed by forcing a reload or just relying on state
    setNotification('Identity Verified! Proceeding with booking...');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing);
    setView('listing-details');
  };

  const handleBookSpace = (dates: string[], duration: number, breakdown: { total: number, service: number, caution: number }, selectedHours?: number[], guestCount?: number, selectedAddOns?: string[]) => {
    if (!user || !selectedListing) return;

    const groupId = dates.length > 1 ? Math.random().toString(36).substr(2, 9) : undefined;
    
    // We split the total proportional to the number of dates for record keeping, 
    // but for this demo, we'll just divide evenly.
    // Note: Caution fee is technically 1-time per group, but for simplicity in data model we divide it or assign to first.
    // Let's divide evenly for simplicity in the booking records.
    const pricePerBooking = breakdown.total / dates.length;
    const serviceFeePerBooking = breakdown.service / dates.length;
    const cautionFeePerBooking = breakdown.caution / dates.length;

    dates.forEach(date => {
        const newBooking: Booking = {
          id: Math.random().toString(36).substr(2, 9),
          listingId: selectedListing.id,
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
          selectedAddOns: selectedAddOns || []
        };
        createBooking(newBooking);
    });

    const message = dates.length > 1 
        ? `Recurring Booking Request Sent! (${dates.length} dates)` 
        : `Booking Request Sent! Total: $${breakdown.total.toFixed(2)}`;

    setNotification(message);
    
    setTimeout(() => {
       setNotification(null);
       handleNavigate('home');
    }, 2000);
  };

  // -- Views Renderers --

  const renderHome = () => {
    const categories = [
      { id: 'All', label: 'All', icon: null },
      { id: SpaceType.APARTMENT, label: 'Apartments', icon: Home },
      { id: SpaceType.STUDIO, label: 'Studios', icon: Camera },
      { id: SpaceType.CONFERENCE, label: 'Conference', icon: Users },
      { id: SpaceType.EVENT_CENTER, label: 'Events', icon: Music },
      { id: SpaceType.CO_WORKING, label: 'Co-working', icon: Briefcase },
      { id: SpaceType.OPEN_SPACE, label: 'Open Air', icon: Sun },
    ];

    const displayListings = listings.filter(l => {
         const matchesStatus = l.status === ListingStatus.LIVE;
         const matchesCategory = activeCategory === 'All' || l.type === activeCategory;
         const matchesSearch = !searchTerm || 
                              l.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              l.title.toLowerCase().includes(searchTerm.toLowerCase());
         return matchesStatus && matchesCategory && matchesSearch;
    });

    // Insert Host Promo at index 2 (3rd position) for visibility
    const renderListingsWithPromo = () => {
       const items = [];
       let promoAdded = false;
       
       if (displayListings.length === 0 && !user) {
           // If no listings, just show promo
           return (
               <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                    <Home size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No matches found</h3>
                    <p className="text-gray-500 mb-8">Try selecting a different category.</p>
                    <button onClick={() => setView('login-host')} className="bg-black text-white px-6 py-3 rounded-lg font-semibold">
                        Become a Host
                    </button>
               </div>
           );
       }

       displayListings.forEach((l, index) => {
           items.push(<ListingCard key={l.id} listing={l} onClick={() => handleListingClick(l)} />);
           
           // Insert Promo Card after 2nd item, or at end if fewer than 2
           if (!user && !promoAdded && (index === 1 || (displayListings.length < 2 && index === displayListings.length - 1))) {
                items.push(
                    <div 
                        key="promo"
                        onClick={() => setView('login-host')}
                        className="group cursor-pointer flex flex-col gap-2 h-full"
                    >
                         <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-center p-6 hover:bg-gray-100 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus size={24} className="text-brand-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Become a Host</h3>
                            <p className="text-gray-500 text-sm mb-4 leading-tight">Earn extra income by sharing your space.</p>
                         </div>
                         <div className="mt-1 opacity-0">Placeholder</div>
                    </div>
                );
                promoAdded = true;
           }
       });

       // Fallback if list is empty (handled above) but logic safety
       if (!user && !promoAdded && displayListings.length === 0) return null; 
       
       return items;
    };

    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 pb-20">
        
        {/* Categories Bar - Sticky Top */}
        <div className="flex items-center gap-8 overflow-x-auto pb-2 mb-6 no-scrollbar sticky top-[80px] bg-white z-30 pt-6">
            {categories.map(cat => (
                <button 
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex flex-col items-center min-w-[64px] gap-2 group cursor-pointer transition-colors relative pb-3 ${activeCategory === cat.id ? 'text-black' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg p-1'}`}
                >
                    {cat.icon ? <cat.icon size={24} strokeWidth={activeCategory === cat.id ? 2 : 1.5} /> : <Search size={24} strokeWidth={1.5} />}
                    <span className={`text-xs font-medium whitespace-nowrap ${activeCategory === cat.id ? 'font-bold' : ''}`}>{cat.label}</span>
                    {activeCategory === cat.id && (
                      <span className="absolute bottom-0 w-full h-0.5 bg-black animate-in fade-in zoom-in duration-200" />
                    )}
                </button>
            ))}
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10 animate-in fade-in duration-500">
            {renderListingsWithPromo()}
        </div>
      </div>
    );
  };

  const renderLogin = () => {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center pt-20 px-4 animate-in slide-in-from-bottom-8 duration-500">
          {loginStep === 0 && (
            <div className="max-w-[480px] w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <button onClick={() => handleNavigate('home')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                    <X size={18} />
                  </button>
                  <span className="font-bold text-base">Log in or sign up</span>
                  <div className="w-8"></div>
               </div>

               <div className="p-6">
                 <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to Fiilar</h2>

                 {/* Phone Input */}
                 <div className="mb-3">
                   <div className="border border-gray-300 rounded-t-lg px-3 py-2 relative hover:border-black focus-within:border-black focus-within:border-2 group">
                      <label className="text-xs text-gray-500 block">Country/Region</label>
                      <select className="w-full bg-transparent outline-none appearance-none text-gray-900 text-base pt-0.5">
                        <option>Nigeria (+234)</option>
                        <option>United States (+1)</option>
                        <option>United Kingdom (+44)</option>
                      </select>
                      <div className="absolute right-3 top-4 pointer-events-none">
                         {/* caret */}
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                      </div>
                   </div>
                   <div className="border border-gray-300 border-t-0 rounded-b-lg px-3 py-2 hover:border-black focus-within:border-black focus-within:border-2">
                      <label className="text-xs text-gray-500 block">Phone number</label>
                      <input 
                        type="tel" 
                        className="w-full bg-transparent outline-none text-gray-900 text-base pt-0.5"
                        placeholder="(555) 555-5555"
                      />
                   </div>
                 </div>

                 <p className="text-[11px] text-gray-500 leading-relaxed mb-5">
                   We’ll call or text you to confirm your number. Standard message and data rates apply. <a href="#" className="underline font-medium text-gray-800">Privacy Policy</a>
                 </p>

                 <button 
                   onClick={() => setLoginStep(2)}
                   className="w-full bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold text-lg py-3 rounded-lg hover:shadow-lg transition-all active:scale-[0.98]"
                 >
                   Continue
                 </button>

                 <div className="flex items-center gap-4 my-6">
                   <div className="h-[1px] bg-gray-200 flex-1"></div>
                   <span className="text-xs text-gray-500 font-medium">or</span>
                   <div className="h-[1px] bg-gray-200 flex-1"></div>
                 </div>

                 <div className="space-y-3">
                    <button 
                      onClick={() => handleLogin(Role.USER)}
                      className="w-full border border-gray-900 text-gray-900 font-medium py-3 rounded-lg hover:bg-gray-50 transition relative flex items-center justify-between px-4"
                    >
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                      <span className="text-center w-full">Continue with Google</span>
                      <div className="w-5"></div>
                    </button>

                    <button 
                      onClick={() => setLoginStep(1)}
                      className="w-full border border-gray-900 text-gray-900 font-medium py-3 rounded-lg hover:bg-gray-50 transition relative flex items-center justify-between px-4"
                    >
                      <Mail size={20} />
                      <span className="text-center w-full">Continue with email</span>
                      <div className="w-5"></div>
                    </button>
                 </div>
                 
                 <div className="mt-6 text-center">
                    <button onClick={() => handleLogin(Role.ADMIN)} className="text-xs text-gray-300 hover:text-gray-500 underline">Admin Login (Demo)</button>
                 </div>
               </div>
            </div>
          )}

          {loginStep === 1 && (
            <div className="max-w-[480px] w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <button onClick={() => setLoginStep(0)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                    <ArrowLeft size={18} />
                  </button>
                  <span className="font-bold text-base">Log in or sign up</span>
                  <div className="w-8"></div>
               </div>
               <div className="p-6">
                 <input 
                   type="email" 
                   autoFocus
                   className="w-full border border-gray-400 rounded-lg p-4 text-lg mb-6 outline-none focus:border-black focus:ring-1 focus:ring-black"
                   placeholder="Email address"
                   value={loginEmail}
                   onChange={(e) => setLoginEmail(e.target.value)}
                 />
                  <button 
                   onClick={() => handleLogin(Role.USER)}
                   className="w-full bg-brand-600 text-white font-bold text-lg py-3 rounded-lg hover:shadow-lg transition-all"
                 >
                   Continue
                 </button>
               </div>
            </div>
          )}

          {loginStep === 2 && (
             <div className="max-w-[480px] w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <button onClick={() => setLoginStep(0)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                    <ArrowLeft size={18} />
                  </button>
                  <span className="font-bold text-base">Confirm your number</span>
                  <div className="w-8"></div>
               </div>
               <div className="p-6">
                  <p className="text-gray-500 mb-6">Enter the code we sent to your phone.</p>
                  <div className="flex gap-3 mb-8">
                     {[1,2,3,4,5,6].map(i => (
                       <input key={i} type="text" className="w-12 h-14 border border-gray-300 rounded-lg text-center text-xl focus:border-black outline-none" />
                     ))}
                  </div>
                   <button 
                   onClick={() => handleLogin(Role.USER)}
                   className="w-full bg-brand-600 text-white font-bold text-lg py-3 rounded-lg hover:shadow-lg transition-all"
                 >
                   Verify
                 </button>
               </div>
             </div>
          )}
      </div>
    );
  };

  const renderHostFlow = () => {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center pt-20 px-4 animate-in slide-in-from-bottom-8 duration-500">
          {hostStep === 0 && (
            <div className="max-w-[480px] w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <button onClick={() => handleNavigate('home')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                    <X size={18} />
                  </button>
                  <span className="font-bold text-base">Log in or sign up</span>
                  <div className="w-8"></div>
               </div>

               <div className="p-6">
                 <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to Fiilar</h2>

                 {/* Phone Input */}
                 <div className="mb-3">
                   <div className="border border-gray-300 rounded-t-lg px-3 py-2 relative hover:border-black focus-within:border-black focus-within:border-2 group">
                      <label className="text-xs text-gray-500 block">Country/Region</label>
                      <select className="w-full bg-transparent outline-none appearance-none text-gray-900 text-base pt-0.5">
                        <option>Nigeria (+234)</option>
                        <option>United States (+1)</option>
                        <option>United Kingdom (+44)</option>
                      </select>
                      <div className="absolute right-3 top-4 pointer-events-none">
                         {/* caret */}
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                      </div>
                   </div>
                   <div className="border border-gray-300 border-t-0 rounded-b-lg px-3 py-2 hover:border-black focus-within:border-black focus-within:border-2">
                      <label className="text-xs text-gray-500 block">Phone number</label>
                      <input 
                        type="tel" 
                        className="w-full bg-transparent outline-none text-gray-900 text-base pt-0.5"
                        placeholder="(555) 555-5555"
                      />
                   </div>
                 </div>

                 <p className="text-[11px] text-gray-500 leading-relaxed mb-5">
                   We’ll call or text you to confirm your number. Standard message and data rates apply. <a href="#" className="underline font-medium text-gray-800">Privacy Policy</a>
                 </p>

                 <button 
                   onClick={() => setHostStep(2)}
                   className="w-full bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold text-lg py-3 rounded-lg hover:shadow-lg transition-all active:scale-[0.98]"
                 >
                   Continue
                 </button>

                 <div className="flex items-center gap-4 my-6">
                   <div className="h-[1px] bg-gray-200 flex-1"></div>
                   <span className="text-xs text-gray-500 font-medium">or</span>
                   <div className="h-[1px] bg-gray-200 flex-1"></div>
                 </div>

                 <div className="space-y-3">
                    <button 
                      onClick={() => handleLogin(Role.HOST)}
                      className="w-full border border-gray-900 text-gray-900 font-medium py-3 rounded-lg hover:bg-gray-50 transition relative flex items-center justify-between px-4"
                    >
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                      <span className="text-center w-full">Continue with Google</span>
                      <div className="w-5"></div>
                    </button>

                    <button 
                      onClick={() => setHostStep(1)}
                      className="w-full border border-gray-900 text-gray-900 font-medium py-3 rounded-lg hover:bg-gray-50 transition relative flex items-center justify-between px-4"
                    >
                      <Mail size={20} />
                      <span className="text-center w-full">Continue with email</span>
                      <div className="w-5"></div>
                    </button>
                 </div>

               </div>
            </div>
          )}

          {hostStep === 1 && (
            <div className="max-w-[480px] w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <button onClick={() => setHostStep(0)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                    <ArrowLeft size={18} />
                  </button>
                  <span className="font-bold text-base">Log in or sign up</span>
                  <div className="w-8"></div>
               </div>
               <div className="p-6">
                 <input 
                   type="email" 
                   autoFocus
                   className="w-full border border-gray-400 rounded-lg p-4 text-lg mb-6 outline-none focus:border-black focus:ring-1 focus:ring-black"
                   placeholder="Email address"
                   value={hostEmail}
                   onChange={(e) => setHostEmail(e.target.value)}
                 />
                  <button 
                   onClick={() => handleLogin(Role.HOST)}
                   className="w-full bg-brand-600 text-white font-bold text-lg py-3 rounded-lg hover:shadow-lg transition-all"
                 >
                   Continue
                 </button>
               </div>
            </div>
          )}

          {hostStep === 2 && (
             <div className="max-w-[480px] w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <button onClick={() => setHostStep(0)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                    <ArrowLeft size={18} />
                  </button>
                  <span className="font-bold text-base">Confirm your number</span>
                  <div className="w-8"></div>
               </div>
               <div className="p-6">
                  <p className="text-gray-500 mb-6">Enter the code we sent to your phone.</p>
                  <div className="flex gap-3 mb-8">
                     {[1,2,3,4,5,6].map(i => (
                       <input key={i} type="text" className="w-12 h-14 border border-gray-300 rounded-lg text-center text-xl focus:border-black outline-none" />
                     ))}
                  </div>
                   <button 
                   onClick={() => handleLogin(Role.HOST)}
                   className="w-full bg-brand-600 text-white font-bold text-lg py-3 rounded-lg hover:shadow-lg transition-all"
                 >
                   Verify
                 </button>
               </div>
             </div>
          )}
      </div>
    );
  };

  const renderKYCUpload = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
         <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
           <Shield size={32} />
         </div>
         <h2 className="text-2xl font-bold mb-2">Verify Identity</h2>
         <p className="text-gray-500 mb-6 text-sm">
           To ensure safety, we need to verify who you are. Please upload a valid Government ID.
         </p>
         
         <label className="block w-full border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6 cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition">
            <input type="file" className="hidden" onChange={handleKYCUpload} />
            <div className="text-gray-500 font-medium">Upload Government ID</div>
            <div className="text-xs text-gray-400 mt-1">(Passport, Driver's License, ID Card)</div>
         </label>

         <button onClick={() => setView('dashboard-host')} className="text-gray-400 hover:text-gray-600 text-sm">
           I'll do this later
         </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
      <Navbar 
        user={user} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout} 
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />
      
      {/* Host KYC Banner */}
      {user?.role === Role.HOST && !user.kycVerified && view !== 'kyc-upload' && (
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
                    onClick={() => setView('kyc-upload')}
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
        {(view === 'home' || view === 'browse') && renderHome()}
        {view === 'login' && renderLogin()}
        {view === 'login-host' && renderHostFlow()}
        {view === 'kyc-upload' && renderKYCUpload()}
        
        {view === 'listing-details' && selectedListing && (
          <ListingDetails 
            listing={selectedListing} 
            user={user}
            onBack={() => handleNavigate('home')}
            onBook={handleBookSpace}
            onVerify={handleUserVerification}
            onLogin={() => setView('login')}
          />
        )}

        {view === 'dashboard-host' && user?.role === Role.HOST && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <HostDashboard user={user} listings={listings} refreshData={refreshData} />
          </div>
        )}

        {view === 'dashboard-user' && user?.role === Role.USER && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <UserDashboard user={user} listings={listings} onListingClick={handleListingClick} />
          </div>
        )}

        {view === 'dashboard-admin' && user?.role === Role.ADMIN && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <AdminPanel users={allUsers} listings={listings} refreshData={refreshData} />
          </div>
        )}
      </main>

      <footer className="bg-gray-50 border-t border-gray-100 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <div className="mb-4 md:mb-0 font-bold text-gray-900 text-lg">Fiilar.</div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-gray-900">Mission</a>
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
          </div>
          <div className="mt-4 md:mt-0">&copy; 2023 Fiilar Spaces. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
