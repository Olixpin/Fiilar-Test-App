import React, { useState, useRef, useEffect } from 'react';
import { User, Role, View } from '../types';
import { Menu, X, User as UserIcon, LogOut, Search, Bell, ArrowRight, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllUsers, STORAGE_KEYS, getCurrentUser, getUnreadCount } from '../services/storage';
import NotificationCenter from './NotificationCenter';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onSearch?: (term: string) => void;
  searchTerm?: string;
  onLogin?: () => void;
  onBecomeHost?: () => void;
  onNavigate?: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onSearch, searchTerm, onLogin, onBecomeHost, onNavigate }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const accountToggleRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

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

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 h-20 flex items-center">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center cursor-pointer flex-shrink-0">
            <img
              src="https://drive.google.com/thumbnail?id=11AM3I7DLtyDpwgduNdtbUaZXJUYpvruC&sz=w400"
              alt="Fiilar"
              className="h-5 md:h-6 object-contain"
              referrerPolicy="no-referrer"
            />
          </Link>

          {/* Search Pill (Desktop) */}
          <div className="hidden md:flex items-center bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow py-2.5 px-4 divide-x divide-gray-300 w-full max-w-md cursor-pointer">
            <input
              type="text"
              placeholder="Start your search"
              className="bg-transparent outline-none text-sm text-gray-900 placeholder-gray-600 font-medium px-2 w-full truncate"
              value={searchTerm || ''}
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
            <div className="pl-2">
              <div className="bg-brand-600 text-white p-1.5 rounded-full">
                <Search size={14} strokeWidth={3} />
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {!user && (
              <button
                onClick={onBecomeHost}
                className="text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                Become a host
              </button>
            )}

            <button title="Language" aria-label="Language" className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <Globe size={18} />
            </button>

            {/* Notification Bell */}
            {user && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 hover:bg-gray-100 rounded-full transition"
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
                aria-label="Account — Sign in or create an account"
                title="Account — Sign in or create an account"
                className="flex items-center gap-3 p-2 rounded-full hover:bg-gray-100 transition"
              >
                {!user ? (
                  <div className="flex items-center">
                    <Menu size={20} className="text-gray-700" />
                  </div>
                ) : (
                  <img
                    src={avatarSrc || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
                {user && <span className="hidden sm:inline text-sm font-medium">{user.name?.split(' ')[0]}</span>}
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
                    } catch (err) {
                      console.error('Failed to save avatar', err);
                    }
                  };
                  reader.readAsDataURL(f);
                  setIsAccountOpen(false);
                  if (e.target) e.target.value = '';
                }}
              />

              {isAccountOpen && user && (
                <div ref={menuRef} aria-label="Account menu" className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg py-1 z-50">
                  <button onClick={() => fileInputRef.current?.click()} className="block px-4 py-2 text-sm hover:bg-gray-100 text-left">Change photo</button>
                  <Link to={user.role === Role.HOST ? "/host/dashboard" : "/dashboard"} onClick={() => setIsAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Dashboard</Link>
                  {user.role === Role.HOST ? (
                    <>
                      <Link to="/host/dashboard?view=listings" onClick={() => setIsAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Listings</Link>
                      <Link to="/host/dashboard?view=earnings" onClick={() => setIsAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Earnings</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/dashboard?tab=bookings" onClick={() => setIsAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Bookings</Link>
                      <Link to="/dashboard?tab=wallet" onClick={() => setIsAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Wallet</Link>
                    </>
                  )}
                  <Link to={user.role === Role.HOST ? "/host/dashboard?view=settings" : "/dashboard?tab=settings"} onClick={() => setIsAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Settings</Link>
                  <button onClick={() => { setIsAccountOpen(false); onLogout(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Log out</button>
                </div>
              )}

              {isAccountOpen && !user && (
                <div ref={menuRef} aria-label="Account menu" className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-1 z-50">
                  <div className="px-2 py-1">
                    <button onClick={() => { setIsAccountOpen(false); navigate('/login'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex justify-between items-center">
                      <span>Saved</span>
                      <span className="text-gray-500 text-sm">({savedCount})</span>
                    </button>
                    <div className="px-4 pb-1 text-xs text-gray-500">Sign in to save favorites</div>
                  </div>
                  <button onClick={() => { onLogin?.(); setIsAccountOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Create an account</button>
                  <button onClick={() => { onLogin?.(); setIsAccountOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Log in</button>
                  <button onClick={() => { onBecomeHost?.(); setIsAccountOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Become a host</button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center md:hidden gap-4">
            <button type="button" onClick={() => setIsMobileSearchOpen(true)} title="Search" aria-label="Search" className="p-2 text-gray-900">
              <Search size={20} />
            </button>
            <button type="button" onClick={() => setIsMobileOpen(!isMobileOpen)} title="Toggle menu" aria-label="Toggle menu" className="text-gray-900 p-2 border border-gray-200 rounded-full">
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-4 space-y-2 shadow-xl md:hidden z-40 animate-in slide-in-from-top-5">
          <NavItem label="Explore" to="/" />
          {!user ? (
            <>
              <NavItem label="Become a host" to="/login-host" />
              <hr className="my-2" />
              <NavItem label="Sign In" to="/login" />
            </>
          ) : (
            <>
              {user.role === Role.HOST && <NavItem label="Dashboard" to="/host/dashboard" />}
              {user.role === Role.USER && <NavItem label="My Bookings" to="/dashboard" />}
              {user.role === Role.ADMIN && <NavItem label="Admin Panel" to="/admin" />}
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
          className="fixed inset-0 z-[9999] md:hidden bg-white flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-search-title"
        >
          {/* Header Area */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search spaces..."
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
                className="w-full pl-10 pr-10 py-3 bg-gray-100 border-none rounded-xl text-base focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearch && onSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-200 text-gray-600"
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
            {searchTerm ? (
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
            ) : (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Popular Categories
                </h3>
                <div className="space-y-2">
                  {['Studios', 'Conference Rooms', 'Co-working', 'Event Centers'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        if (onSearch) onSearch(term);
                      }}
                      className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                    >
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                        <Search size={18} />
                      </div>
                      <span className="text-gray-700 font-medium">{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
