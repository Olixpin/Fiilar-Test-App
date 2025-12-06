import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  RefreshCw,
  Bell,
  Search,
  UserCheck,
  Users,
  Home,
  DollarSign,
  Scale,
  Settings,
  HelpCircle,
  Wrench,
  ListChecks,
  LogOut,
  User as UserIcon,
  Camera,
  ChevronDown,
  Check,
  X,
  Activity,
} from 'lucide-react';
import { User, Listing } from '@fiilar/types';
import FinancialsTab from './FinancialsTab';
import EscrowManager from './EscrowManager';
import DisputeCenter from './DisputeCenter';
import { AdminSidebar } from './AdminSidebar';
import { AdminKYC } from './AdminKYC';
import { AdminHosts } from './AdminHosts';
import { AdminListings } from './AdminListings';
import { AdminSeriesDebug } from './AdminSeriesDebug';
import { AdminTasks } from './AdminTasks';
import { AdminSettings } from './AdminSettings';
import { AdminHelpSupport } from './AdminHelpSupport';
import { AdminOverview } from './AdminOverview';
import { useAdminData } from './useAdminData';
import { cn } from '@fiilar/utils';
import { useToast } from '@fiilar/ui';

interface AdminPanelProps {
  users: User[];
  listings: Listing[];
  refreshData: () => void;
  currentUser?: User | null;
  onLogout?: () => void;
  onUpdateProfile?: (updates: Partial<User>) => void;
}

interface AdminNotification {
  id: string;
  type: 'kyc' | 'listing' | 'dispute' | 'payment' | 'system';
  title: string;
  message: string;
  time: Date;
  read: boolean;
  actionUrl?: string;
}

// Page title mapping
const pageTitles: Record<string, { title: string; description: string; icon: React.ElementType }> = {
  overview: { title: 'Overview', description: 'Platform analytics and key metrics', icon: Activity },
  kyc: { title: 'KYC Verification', description: 'Review and approve identity verification requests', icon: UserCheck },
  hosts: { title: 'Host Management', description: 'Manage host accounts, badges and permissions', icon: Users },
  listings: { title: 'Listings', description: 'Review, approve and manage property listings', icon: Home },
  financials: { title: 'Financials', description: 'Platform revenue, transactions and payouts', icon: DollarSign },
  escrow: { title: 'Escrow Manager', description: 'Monitor and manage payment holds', icon: Scale },
  disputes: { title: 'Dispute Center', description: 'Handle booking disputes and resolutions', icon: AlertTriangle },
  tasks: { title: 'Tasks', description: 'Manage admin tasks and assignments', icon: ListChecks },
  settings: { title: 'Settings', description: 'Configure admin panel preferences', icon: Settings },
  help: { title: 'Help & Support', description: 'Find answers and get help', icon: HelpCircle },
  'series-debug': { title: 'Dev Tools', description: 'Debug recurring booking series and developer utilities', icon: Wrench },
};

const AdminPanel: React.FC<AdminPanelProps> = ({ users, listings, refreshData, currentUser, onLogout, onUpdateProfile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    rejectionModal,
    setRejectionModal,
    financials,
    bookings,
    transactions,
    loading,
    authError,
    unverifiedHosts,
    pendingListings,
    openDisputes,
    loadFinancialData,
    handleVerifyUser,
    handleUpdateBadgeStatus,
    handleApproveListing,
    handleDeleteListing,
    openRejectionModal,
    handleRejectionSubmit,
    presetPhotographyOffer,
    seriesCount,
  } = useAdminData({ users: users || [], listings: listings || [], refreshData });

  // Determine active tab from URL
  const path = location.pathname.split('/admin/')[1] || 'kyc';
  const activeTab = path.split('/')[0];
  const pageInfo = pageTitles[activeTab] || pageTitles.kyc;

  const totalAlerts = unverifiedHosts.length + pendingListings.length + openDisputes.length;

  // Get pending bookings for notifications
  const pendingBookings = bookings.filter(b => b.status === 'Pending').slice(0, 3);

  // Generate admin notifications from real data
  const adminNotifications: AdminNotification[] = [
    ...unverifiedHosts.slice(0, 3).map((user, idx) => ({
      id: `kyc-${user.id}`,
      type: 'kyc' as const,
      title: 'KYC Verification Pending',
      message: `${user.name || user.firstName || 'A user'} is waiting for identity verification`,
      time: new Date(Date.now() - idx * 3600000),
      read: false,
      actionUrl: '/admin/kyc',
    })),
    ...pendingListings.slice(0, 3).map((listing, idx) => ({
      id: `listing-${listing.id}`,
      type: 'listing' as const,
      title: 'Listing Awaiting Approval',
      message: `"${listing.title}" needs review`,
      time: new Date(Date.now() - (idx + 3) * 3600000),
      read: false,
      actionUrl: '/admin/listings',
    })),
    ...pendingBookings.map((booking, idx) => ({
      id: `booking-${booking.id}`,
      type: 'payment' as const,
      title: 'New Booking Request',
      message: `Booking for ${booking.date} awaiting host confirmation`,
      time: new Date(booking.createdAt || Date.now() - (idx + 3) * 3600000),
      read: false,
      actionUrl: '/admin/financials',
    })),
    ...openDisputes.slice(0, 3).map((dispute, idx) => ({
      id: `dispute-${dispute.id}`,
      type: 'dispute' as const,
      title: 'Open Dispute',
      message: `Dispute requires attention`,
      time: new Date(Date.now() - (idx + 6) * 3600000),
      read: false,
      actionUrl: '/admin/disputes',
    })),
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'kyc': return <UserCheck size={16} className="text-blue-500" />;
      case 'listing': return <Home size={16} className="text-green-500" />;
      case 'dispute': return <AlertTriangle size={16} className="text-orange-500" />;
      case 'payment': return <DollarSign size={16} className="text-purple-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleLogout = () => {
    setShowProfileDropdown(false);
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/login';
    }
  };

  const handleGoToSettings = () => {
    setShowProfileDropdown(false);
    navigate('/admin/settings');
  };

  const getUserInitials = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();
    }
    if (currentUser?.name) {
      const parts = currentUser.name.split(' ');
      return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0][0].toUpperCase();
    }
    return 'A';
  };

  const getUserDisplayName = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    return currentUser?.name || 'Admin';
  };

  // Show error state if authorization failed
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h1>
          <p className="text-gray-600 mb-8">{authError}. Please log in with an admin account.</p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-all"
          >
            <RefreshCw size={18} />
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        kycCount={unverifiedHosts.length}
        listingsCount={pendingListings.length}
        disputesCount={openDisputes.length}
        seriesCount={seriesCount}
        isCollapsed={sidebarCollapsed}
        onCollapseChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          {/* Left side - Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search or type a command"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 ml-4">
            {/* Refresh */}
            <button 
              onClick={() => loadFinancialData()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh data"
              aria-label="Refresh data"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "relative p-2 rounded-lg transition-colors",
                  showNotifications ? "bg-gray-100 text-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                )}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {totalAlerts > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-medium">
                    {totalAlerts > 9 ? '9+' : totalAlerts}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    <span className="text-xs text-gray-500">{adminNotifications.filter(n => !n.read).length} unread</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {adminNotifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell size={20} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {adminNotifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => {
                              if (notification.actionUrl) {
                                navigate(notification.actionUrl);
                              }
                              setShowNotifications(false);
                            }}
                            className={cn(
                              "w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-start gap-3",
                              !notification.read && "bg-blue-50/50"
                            )}
                          >
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-500 truncate">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.time)}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <button 
                      onClick={() => {
                        navigate('/admin/kyc');
                        setShowNotifications(false);
                      }}
                      className="w-full text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      View all activity
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative ml-2 pl-4 border-l border-gray-200" ref={profileDropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1.5 pr-2 transition-colors"
              >
                {currentUser?.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={getUserDisplayName()}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-sm font-medium">
                    {getUserInitials()}
                  </div>
                )}
                <ChevronDown size={16} className={cn(
                  "text-gray-400 transition-transform",
                  showProfileDropdown && "rotate-180"
                )} />
              </button>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                  {/* User Info */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      {currentUser?.avatar ? (
                        <img 
                          src={currentUser.avatar} 
                          alt={getUserDisplayName()}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-lg font-medium">
                          {getUserInitials()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser?.email || 'admin@fiilar.com'}</p>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full text-xs font-medium">
                          <Check size={10} />
                          Admin
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={handleGoToSettings}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <UserIcon size={18} className="text-gray-400" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setShowPhotoModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Camera size={18} className="text-gray-400" />
                      <span>Change Photo</span>
                    </button>
                    <button
                      onClick={handleGoToSettings}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Settings size={18} className="text-gray-400" />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Breadcrumb Bar */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <button 
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Go back"
            >
              ←
            </button>
            <span className="text-gray-600">{pageInfo.title}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Last Activity: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 min-h-0">
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route
              path="overview"
              element={
                <AdminOverview
                  users={users}
                  listings={listings}
                  bookings={bookings}
                  financials={financials}
                  transactions={transactions}
                  unverifiedHosts={unverifiedHosts}
                  pendingListings={pendingListings}
                  openDisputes={openDisputes}
                  loading={loading}
                />
              }
            />
            <Route
              path="kyc"
              element={
                <AdminKYC
                  unverifiedHosts={unverifiedHosts}
                  users={users}
                  handleVerifyUser={handleVerifyUser}
                  handleUpdateBadgeStatus={handleUpdateBadgeStatus}
                />
              }
            />
            <Route
              path="hosts"
              element={
                <AdminHosts
                  users={users}
                  listings={listings}
                  handleUpdateBadgeStatus={handleUpdateBadgeStatus}
                />
              }
            />
            <Route
              path="listings"
              element={
                <AdminListings
                  listings={listings}
                  users={users}
                  handleApproveListing={handleApproveListing}
                  handleDeleteListing={handleDeleteListing}
                  openRejectionModal={openRejectionModal}
                  rejectionModal={rejectionModal}
                  setRejectionModal={setRejectionModal}
                  handleRejectionSubmit={handleRejectionSubmit}
                  presetPhotographyOffer={presetPhotographyOffer}
                />
              }
            />
            <Route
              path="financials"
              element={
                <FinancialsTab
                  financials={
                    financials || {
                      totalEscrow: 0,
                      totalReleased: 0,
                      totalRevenue: 0,
                      pendingPayouts: 0,
                      totalRefunded: 0,
                      revenue: {
                        guestServiceFees: 0,
                        hostServiceFees: 0,
                        cancellationFees: 0,
                        extrasCommission: 0,
                        totalGross: 0,
                        processingFees: 0,
                        netRevenue: 0,
                      },
                      cashFlow: {
                        inflows: 0,
                        outflows: 0,
                        netFlow: 0,
                        processingCosts: 0,
                      },
                      escrow: {
                        heldForBookings: 0,
                        heldCautionFees: 0,
                        pendingRelease: 0,
                        totalHeld: 0,
                      },
                      payables: {
                        dueToHosts: 0,
                        pendingRefunds: 0,
                        cautionFeesToReturn: 0,
                        totalPayables: 0,
                      },
                      period: {
                        startDate: new Date().toISOString(),
                        endDate: new Date().toISOString(),
                        totalBookings: 0,
                        completedBookings: 0,
                        cancelledBookings: 0,
                        disputedBookings: 0,
                        averageBookingValue: 0,
                        conversionRate: 0,
                      },
                      settlements: {
                        pendingSettlement: 0,
                        settledThisPeriod: 0,
                        reconciledAmount: 0,
                        unreconciledAmount: 0,
                      },
                    }
                  }
                  bookings={bookings}
                  escrowTransactions={transactions}
                  listings={listings}
                  users={users}
                  loading={loading}
                />
              }
            />
            <Route
              path="escrow"
              element={<EscrowManager financials={financials} transactions={transactions} loading={loading} />}
            />
            <Route
              path="disputes"
              element={<DisputeCenter bookings={bookings} listings={listings} refreshData={loadFinancialData} />}
            />
            <Route
              path="series-debug"
              element={<AdminSeriesDebug bookings={bookings} listings={listings} />}
            />
            <Route
              path="tasks"
              element={<AdminTasks />}
            />
            <Route
              path="settings"
              element={<AdminSettings />}
            />
            <Route
              path="help"
              element={<AdminHelpSupport />}
            />
          </Routes>
        </main>
      </div>

      {/* Change Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Change Profile Photo</h3>
              <button
                onClick={() => {
                  setShowPhotoModal(false);
                  setSelectedPhoto(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Current/Preview Photo */}
              <div className="flex flex-col items-center mb-6">
                {selectedPhoto ? (
                  <img
                    src={selectedPhoto}
                    alt="New profile preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-brand-100"
                  />
                ) : currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt="Current profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-4xl font-medium border-4 border-brand-100">
                    {getUserInitials()}
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-3">
                  {selectedPhoto ? 'Preview of new photo' : 'Current profile photo'}
                </p>
              </div>

              {/* Upload Options */}
              <div className="space-y-3">
                <input
                  type="file"
                  id="profile-photo-upload"
                  ref={fileInputRef}
                  accept="image/*"
                  aria-label="Upload profile photo"
                  title="Upload profile photo"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        alert('File size must be less than 5MB');
                        return;
                      }
                      // Create preview URL
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setSelectedPhoto(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
                >
                  <Camera size={20} className="text-gray-500" />
                  <span>Upload from Device</span>
                </button>

                {selectedPhoto && (
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="w-full px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Remove selected photo
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50">
              <button
                onClick={() => {
                  setShowPhotoModal(false);
                  setSelectedPhoto(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (selectedPhoto && onUpdateProfile && currentUser) {
                    setUploadingPhoto(true);
                    try {
                      // In a real app, you'd upload to a server and get a URL back
                      // For now, we'll store the base64 directly (not ideal for production)
                      onUpdateProfile({ avatar: selectedPhoto });
                      showToast({ message: 'Profile photo updated successfully', type: 'success' });
                      setShowPhotoModal(false);
                      setSelectedPhoto(null);
                    } catch (error) {
                      console.error('Failed to update photo:', error);
                      showToast({ message: 'Failed to update photo. Please try again.', type: 'error' });
                    } finally {
                      setUploadingPhoto(false);
                    }
                  }
                }}
                disabled={!selectedPhoto || uploadingPhoto}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  selectedPhoto && !uploadingPhoto
                    ? "bg-brand-500 text-white hover:bg-brand-600"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                {uploadingPhoto ? 'Saving...' : 'Save Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
