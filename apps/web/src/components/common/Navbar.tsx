
import React, { useState, useRef, useEffect } from 'react';
import { User, Role } from '@fiilar/types';
import { X, Bell, Menu, LogOut, Sparkles, ArrowRight, Home as HomeIcon, Briefcase, User as UserIcon, LayoutDashboard, Shield, Camera, List, DollarSign, CreditCard, Settings, RefreshCw, Heart, LogIn, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllUsers, STORAGE_KEYS, getCurrentUser } from '@fiilar/storage';
import { getUnreadCount } from '@fiilar/notifications';
import NotificationCenter from '../../features/Notifications/components/NotificationCenter';
import { UserAvatar, useToast } from '@fiilar/ui';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onSearch?: (term: string) => void;
  searchTerm?: string;
  onLogin?: () => void;
  onBecomeHost?: () => void;
  onNavigate?: (path: string) => void;
  onSwitchRole?: (role: Role) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onSearch, searchTerm, onLogin, onBecomeHost, onNavigate, onSwitchRole }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const accountToggleRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [avatarSrc, setAvatarSrc] = useState<string | null>(
    user?.avatar || (user ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}` : null)
  );

  const [savedCount, setSavedCount] = useState<number>(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // If logged in, use user's favorites. If logged out, read guest favorites from localStorage.
    if (user) {
      setSavedCount(user.favorites?.length || 0);
    } else {
      try {
        const g = localStorage.getItem('fiilar_guest_favorites');
        const arr = g ? JSON.parse(g) : [];
        setSavedCount(Array.isArray(arr) ? arr.length : 0);
      } catch (err) {
        setSavedCount(0);
      }
    }
  }, [user, isAccountOpen]);

  useEffect(() => {
    setAvatarSrc(user?.avatar || (user ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}` : null));
  }, [user?.id, user?.avatar]);

  useEffect(() => {
    if (!isAccountOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAccountOpen(false);
        // return focus to toggle
        setTimeout(() => accountToggleRef.current?.focus(), 0);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isAccountOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!isAccountOpen) return;
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target) && accountToggleRef.current && !accountToggleRef.current.contains(target)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isAccountOpen]);

  const NavItem = ({ label, to, icon: Icon }: any) => (
    <Link
      to={to}
      onClick={() => setIsMobileOpen(false)}
      className="flex items-center space-x-2 text-gray-600 hover:text-black font-medium px-3 py-2 rounded-full hover:bg-gray-50 transition-colors text-sm"
    >
      {Icon && <Icon size={18} />}
      <span>{label}</span>
    </Link>
  );

  // Poll for notifications every 30 seconds
  useEffect(() => {
    if (!user) return;

    const updateNotificationCount = () => {
      const count = getUnreadCount(user.id);
      setUnreadCount(count);
    };

    updateNotificationCount();
    const interval = setInterval(updateNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Close notification dropdown when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotificationOpen(false);
        setIsAccountOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNotificationOpen]);

  return (
    <nav className="sticky top-0 z-50 glass-premium shadow-none border-none h-20 flex items-center transition-all duration-300">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center gap-4">

          {/* Logo */}
          <div className="flex items-center min-w-[150px] lg:min-w-[200px] xl:min-w-[250px]">
            <Link to="/" className="flex items-center cursor-pointer">
              <img
                src="/assets/logo.png"
                alt="Fiilar"
                className="h-6 object-contain"
              />
            </Link>
          </div>

          {/* Search Pill (Desktop) */}
          <div className="hidden md:flex items-center bg-white border border-gray-100 rounded-full shadow-faint hover:shadow-lg transition-all duration-300 py-2.5 px-4 divide-x divide-gray-200 w-full max-w-md cursor-pointer group focus-within:border-gray-300">
            <input
              type="text"
              placeholder="Try 'Studio in Lagos for 20 people...'"
              className="bg-transparent outline-none text-sm text-gray-900 placeholder-gray-500 font-medium px-2 w-full truncate"
              value={searchTerm || ''}
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
            <div className="pl-2">
              <div className="bg-brand-600 text-white p-1.5 rounded-full group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-sm">
                <Sparkles size={14} strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-2 justify-end min-w-[150px] lg:min-w-[200px] xl:min-w-[250px]">
            {!user ? (
              <>
                <button
                  onClick={onBecomeHost}
                  className="text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                >
                  Host your home
                </button>
                <button
                  onClick={onLogin}
                  className="text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                >
                  Log in
                </button>
              </>
            ) : user.role === Role.USER ? (
              <button
                onClick={() => onSwitchRole?.(Role.HOST)}
                className="text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                Switch to hosting
              </button>
            ) : null}

            {/* Notification Bell */}
            {user && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 hover:bg-gray-100 rounded-full transition"
                  title="Notifications"
                >
                  <Bell size={20} className="text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {isNotificationOpen && (
                  <NotificationCenter
                    userId={user.id}
                    onClose={() => setIsNotificationOpen(false)}
                  />
                )}
              </div>
            )}

            {/* Account Menu */}
            <div className="relative">
              <button
                type="button"
                ref={accountToggleRef}
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                aria-haspopup="menu"
                aria-label={user ? `Account menu — ${user.firstName || user.name}` : "Account — Sign in or create an account"}
                title={user ? `Account menu — ${user.firstName || user.name}` : "Account — Sign in or create an account"}
                className={`flex items-center gap-2 rounded-full hover:bg-gray-100 transition ${user ? 'p-1.5 pr-3' : 'p-2'}`}
              >
                {!user ? (
                  <div className="flex items-center">
                    <Menu size={20} className="text-gray-700" />
                  </div>
                ) : (
                  <UserAvatar
                    src={avatarSrc || user.avatar}
                    firstName={user.firstName}
                    lastName={user.lastName}
                    size="sm"
                  />
                )}
                {user && <span className="hidden sm:inline text-sm font-medium">{user.firstName || user.email?.split('@')[0] || 'Account'}</span>}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                aria-label="Upload profile photo"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f || !user) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const dataUrl = String(reader.result);
                    try {
                      const users = getAllUsers();
                      const idx = users.findIndex(u => u.id === user.id);
                      if (idx >= 0) {
                        users[idx].avatar = dataUrl;
                        localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
                      }
                      const session = getCurrentUser();
                      if (session && session.id === user.id) {
                        session.avatar = dataUrl;
                        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session));
                      }
                      setAvatarSrc(dataUrl);
                      showToast({ message: 'Profile picture updated successfully', type: 'success' });
                    } catch (err) {
                      console.error('Failed to save avatar', err);
                      showToast({ message: 'Failed to update profile picture', type: 'error' });
                    }
                  };
                  reader.readAsDataURL(f);
                  setIsAccountOpen(false);
                  if (e.target) e.target.value = '';
                }}
              />

              {isAccountOpen && user && (
                <>
                  {/* Invisible overlay to capture clicks outside */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsAccountOpen(false)}
                    aria-hidden="true"
                  />
                  <div ref={menuRef} aria-label="Account menu" className="absolute right-0 mt-6 w-64 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3">
                    <Camera size={16} className="text-gray-500 group-hover:text-black transition-colors" />
                    Change photo
                  </button>
                  <Link to={user.role === Role.HOST ? "/host/dashboard" : user.role === Role.ADMIN ? "/admin" : "/dashboard"} onClick={() => setIsAccountOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3">
                    <LayoutDashboard size={16} className="text-gray-500 transition-colors" />
                    Dashboard
                  </Link>
                  {user.role === Role.HOST ? (
                    <>
                      <Link to="/host/dashboard?view=listings" onClick={() => setIsAccountOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3">
                        <List size={16} className="text-gray-500 transition-colors" />
                        Listings
                      </Link>
                      <Link to="/host/dashboard?view=earnings" onClick={() => setIsAccountOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3">
                        <DollarSign size={16} className="text-gray-500 transition-colors" />
                        Earnings
                      </Link>
                    </>
                  ) : user.role === Role.USER ? (
                    <>
                      <Link to="/dashboard?tab=bookings" onClick={() => setIsAccountOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3">
                        <Briefcase size={16} className="text-gray-500 transition-colors" />
                        Bookings
                      </Link>
                      <Link to="/dashboard?tab=wallet" onClick={() => setIsAccountOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3">
                        <CreditCard size={16} className="text-gray-500 transition-colors" />
                        Wallet
                      </Link>
                    </>
                  ) : null}
                  <Link to={user.role === Role.HOST ? "/host/dashboard?view=settings" : "/dashboard?tab=settings"} onClick={() => setIsAccountOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3">
                    <Settings size={16} className="text-gray-500 transition-colors" />
                    Settings
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  {user.role === Role.HOST ? (
                    <button onClick={() => { onSwitchRole?.(Role.USER); setIsAccountOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3">
                      <RefreshCw size={16} className="text-gray-500 transition-colors" />
                      Switch to traveling
                    </button>
                  ) : user.role === Role.USER ? (
                    <button onClick={() => { onSwitchRole?.(Role.HOST); setIsAccountOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3">
                      <RefreshCw size={16} className="text-gray-500 transition-colors" />
                      Switch to hosting
                    </button>
                  ) : null}
                  <hr className="my-1 border-gray-100" />
                  <button onClick={() => { setIsAccountOpen(false); onLogout(); }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-3">
                    <LogOut size={16} className="text-red-500 transition-colors" />
                    Log out
                  </button>
                </div>
                </>  
              )}

              {isAccountOpen && !user && (
                <>
                  {/* Invisible overlay to capture clicks outside */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsAccountOpen(false)}
                    aria-hidden="true"
                  />
                  <div ref={menuRef} aria-label="Account menu" className="absolute right-0 mt-6 w-64 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="mb-1">
                    <button onClick={() => { setIsAccountOpen(false); navigate('/login'); }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-colors flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        <Heart size={16} className="text-gray-500 group-hover:text-red-500 transition-colors" />
                        <span>Saved</span>
                      </div>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs group-hover:bg-white group-hover:shadow-sm transition-all">{savedCount}</span>
                    </button>
                    <div className="px-4 pb-1 text-[11px] font-medium text-gray-400 uppercase tracking-wide pl-11">Sign in to save favorites</div>
                  </div>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={() => { onLogin?.(); setIsAccountOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3">
                    <LogIn size={16} className="text-gray-500 transition-colors" />
                    Log in
                  </button>
                  <button onClick={() => { onLogin?.(); setIsAccountOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3">
                    <UserPlus size={16} className="text-gray-500 transition-colors" />
                    Create an account
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={() => { onBecomeHost?.(); setIsAccountOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3">
                    <HomeIcon size={16} className="text-gray-500 transition-colors" />
                    Become a host
                  </button>
                </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center md:hidden gap-3">
            {!user ? (
              <button 
                type="button" 
                onClick={onBecomeHost} 
                title="Host your home"
                aria-label="Host your home"
                className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <HomeIcon size={20} />
              </button>
            ) : (
              <button type="button" onClick={() => setIsMobileSearchOpen(true)} title="AI Search" aria-label="AI Search" className="p-2 text-gray-900">
                <Sparkles size={20} />
              </button>
            )}
            <button type="button" onClick={() => setIsMobileOpen(!isMobileOpen)} title="Toggle menu" aria-label="Toggle menu" className="text-gray-900 p-2 border border-gray-200 rounded-full">
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-4 space-y-2 shadow-xl md:hidden z-40 animate-in slide-in-from-top-5">
          <NavItem label="Explore" to="/" icon={HomeIcon} />
          {!user ? (
            <>
              <NavItem label="Become a host" to="/login-host" icon={Briefcase} />
              <hr className="my-2" />
              <NavItem label="Sign In" to="/login" icon={UserIcon} />
            </>
          ) : (
            <>
              {user.role === Role.HOST && <NavItem label="Dashboard" to="/host/dashboard" icon={LayoutDashboard} />}
              {user.role === Role.USER && <NavItem label="My Bookings" to="/dashboard" icon={Briefcase} />}
              {user.role === Role.ADMIN && <NavItem label="Admin Panel" to="/admin" icon={Shield} />}
              <button onClick={onLogout} className="flex w-full items-center space-x-2 text-red-600 font-medium px-3 py-2">
                <LogOut size={18} /> <span>Log Out</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Mobile Search Full Screen Modal */}
      {isMobileSearchOpen && (
        <div
          className="fixed inset-0 z-9999 md:hidden bg-white flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-search-title"
        >
          {/* Header Area */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="relative flex-1">
              <Sparkles size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-600 animate-pulse" />
              <input
                type="text"
                placeholder="Try 'Studio in Lagos for 20 people...'"
                value={searchTerm || ''}
                onChange={(e) => {
                  if (onSearch) {
                    onSearch(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsMobileSearchOpen(false);
                  } else if (e.key === 'Enter' && searchTerm) {
                    setIsMobileSearchOpen(false);
                    if (onNavigate) onNavigate('home');
                  }
                }}
                autoFocus
                className="w-full pl-10 pr-10 py-3 bg-gray-100 border-none rounded-xl text-base outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearch && onSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-200 text-gray-600"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="text-base font-semibold text-gray-600 px-2"
            >
              Cancel
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {searchTerm && (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    if (onNavigate) onNavigate('home');
                  }}
                  className="w-full flex items-center justify-between p-4 bg-brand-50 text-brand-700 rounded-xl font-medium"
                >
                  <span>See results for "{searchTerm}"</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
