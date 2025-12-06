import { useState, useMemo } from 'react';
import {
  DollarSign,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  Copy,
  ExternalLink,
  User,
  Building2,
  Shield,
  Search,
  X,
  Banknote,
  Activity,
  ChevronDown,
  ChevronUp,
  PanelLeft,
} from 'lucide-react';
import type { Listing, Booking, EscrowTransaction, User as UserType, PlatformFinancials } from '@fiilar/types';
import { cn } from '@fiilar/utils';

// ============================================================================
// TYPES
// ============================================================================

interface FinancialsTabProps {
  financials: PlatformFinancials;
  listings: Listing[];
  bookings: Booking[];
  escrowTransactions: EscrowTransaction[];
  onReleaseEscrow?: (bookingId: string) => void;
  onRefund?: (bookingId: string, amount: number) => void;
  users: UserType[];
  loading?: boolean;
}

type TransactionFilter = 'all' | 'payments' | 'payouts' | 'refunds';

const CURRENCY_SYMBOL = '₦';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FinancialsTab({
  listings,
  bookings,
  escrowTransactions,
  onRefund,
  users,
}: FinancialsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [txFilter, setTxFilter] = useState<TransactionFilter>('all');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTransactionPanelOpen, setIsTransactionPanelOpen] = useState(true);
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(true);

  // Helpers
  const getUserById = (userId: string) => users.find(u => u.id === userId);
  const getListingById = (listingId: string) => listings.find(l => l.id === listingId);

  const formatCurrency = (amount: number) => {
    return `${CURRENCY_SYMBOL}${new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const formatDate = (date: string | Date, includeTime = false) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (includeTime) {
      return d.toLocaleDateString('en-NG', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
    return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // ============================================================================
  // COMPUTED DATA
  // ============================================================================

  const metrics = useMemo(() => {
    const safeBookings = bookings || [];
    const safeTx = escrowTransactions || [];

    const completed = safeBookings.filter(b => b.status === 'Completed');
    const active = safeBookings.filter(b => ['Pending', 'Confirmed', 'Started'].includes(b.status));

    // Calculate time-based metrics for period comparison (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentBookings = completed.filter(b => new Date(b.createdAt || b.date) >= thirtyDaysAgo);
    const previousBookings = completed.filter(b => {
      const date = new Date(b.createdAt || b.date);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });

    const recentTx = safeTx.filter(t => new Date(t.timestamp) >= thirtyDaysAgo);
    const previousTx = safeTx.filter(t => {
      const date = new Date(t.timestamp);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });

    const grossVolume = completed.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const guestFees = completed.reduce((sum, b) => sum + (b.userServiceFee || 0), 0);
    const hostFees = completed.reduce((sum, b) => sum + (b.hostServiceFee || 0), 0);
    const platformRevenue = guestFees + hostFees;
    const hostPayouts = completed.reduce((sum, b) => sum + (b.hostPayout || 0), 0);
    const escrowBalance = active.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const refunds = safeTx.filter(t => t.type === 'REFUND').reduce((sum, t) => sum + t.amount, 0);
    const pendingPayouts = active.filter(b => b.paymentStatus === 'Paid - Escrow').length;

    // Caution/Security Deposit tracking
    const cautionHeld = active.reduce((sum, b) => sum + (b.cautionFee || 0), 0);
    const cautionReleased = completed.filter(b => b.cautionStatus === 'RELEASED').reduce((sum, b) => sum + (b.cautionFee || 0), 0);
    const cautionClaimed = completed.filter(b => b.cautionStatus === 'CLAIMED' || b.cautionStatus === 'PARTIAL_CLAIM').reduce((sum, b) => sum + (b.cautionClaimAmount || b.cautionFee || 0), 0);

    // Extra guest fees tracking
    const extraGuestFees = completed.reduce((sum, b) => sum + (b.extraGuestFees || 0), 0);
    const extrasTotal = completed.reduce((sum, b) => sum + (b.extrasTotal || 0), 0);

    // Calculate period-over-period changes
    const recentVolume = recentBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const previousVolume = previousBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    const recentRevenue = recentBookings.reduce((sum, b) => sum + (b.userServiceFee || 0) + (b.hostServiceFee || 0), 0);
    const previousRevenue = previousBookings.reduce((sum, b) => sum + (b.userServiceFee || 0) + (b.hostServiceFee || 0), 0);

    const recentRefunds = recentTx.filter(t => t.type === 'REFUND').reduce((sum, t) => sum + t.amount, 0);
    const previousRefunds = previousTx.filter(t => t.type === 'REFUND').reduce((sum, t) => sum + t.amount, 0);

    // Calculate percentage changes (only if there's previous data to compare)
    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      grossVolume,
      platformRevenue,
      guestFees,
      hostFees,
      hostPayouts,
      escrowBalance,
      refunds,
      pendingPayouts,
      totalBookings: safeBookings.length,
      completedBookings: completed.length,
      activeBookings: active.length,
      // Caution tracking
      cautionHeld,
      cautionReleased,
      cautionClaimed,
      // Extra charges
      extraGuestFees,
      extrasTotal,
      // Period changes
      grossVolumeChange: calcChange(recentVolume, previousVolume),
      revenueChange: calcChange(recentRevenue, previousRevenue),
      refundsChange: calcChange(recentRefunds, previousRefunds),
      // Has data flags
      hasVolumeData: grossVolume > 0,
      hasRevenueData: platformRevenue > 0,
      hasRefundsData: refunds > 0,
    };
  }, [bookings, escrowTransactions]);

  const transactions = useMemo(() => {
    const safeTx = escrowTransactions || [];

    return safeTx.map(tx => {
      const booking = bookings?.find(b => b.id === tx.bookingId);
      const listing = booking ? getListingById(booking.listingId) : undefined;
      const guest = tx.fromUserId ? getUserById(tx.fromUserId) : undefined;
      const host = tx.toUserId ? getUserById(tx.toUserId) : (listing ? getUserById(listing.hostId) : undefined);
      return { ...tx, booking, listing, guest, host };
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [escrowTransactions, bookings, listings, users]);

  const filteredTx = useMemo(() => {
    return transactions.filter(tx => {
      if (txFilter === 'payments' && tx.type !== 'GUEST_PAYMENT') return false;
      if (txFilter === 'payouts' && tx.type !== 'HOST_PAYOUT') return false;
      if (txFilter === 'refunds' && tx.type !== 'REFUND') return false;

      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        if (!tx.id.toLowerCase().includes(s) &&
          !tx.paystackReference?.toLowerCase().includes(s) &&
          !tx.listing?.title?.toLowerCase().includes(s) &&
          !tx.guest?.name?.toLowerCase().includes(s)) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, txFilter, searchTerm]);

  const selectedTx = selectedTxId ? transactions.find(t => t.id === selectedTxId) : null;

  const tabs = [
    { id: 'all' as const, label: 'All', count: transactions.length },
    { id: 'payments' as const, label: 'Payments', count: transactions.filter(t => t.type === 'GUEST_PAYMENT').length },
    { id: 'payouts' as const, label: 'Payouts', count: transactions.filter(t => t.type === 'HOST_PAYOUT').length },
    { id: 'refunds' as const, label: 'Refunds', count: transactions.filter(t => t.type === 'REFUND').length },
  ];

  const typeLabels: Record<string, string> = {
    GUEST_PAYMENT: 'Payment',
    HOST_PAYOUT: 'Payout',
    REFUND: 'Refund',
    SERVICE_FEE: 'Fee',
  };

  const typeColors: Record<string, { text: string; bg: string }> = {
    GUEST_PAYMENT: { text: 'text-emerald-700', bg: 'bg-emerald-50' },
    HOST_PAYOUT: { text: 'text-blue-700', bg: 'bg-blue-50' },
    REFUND: { text: 'text-rose-700', bg: 'bg-rose-50' },
    SERVICE_FEE: { text: 'text-violet-700', bg: 'bg-violet-50' },
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // State for active tooltip
  const [activeTooltip, setActiveTooltip] = useState<{
    label: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    details: { label: string; value: string }[];
  } | null>(null);

  // Metric Card component - Fixed width cards
  const MetricCard = ({ 
    label, 
    value, 
    icon: Icon, 
    iconBg, 
    iconColor,
    subLabel,
    tooltipDetails 
  }: { 
    label: string; 
    value: string; 
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    subLabel?: string;
    tooltipDetails?: { label: string; value: string }[];
  }) => (
    <div 
      className="relative bg-white border border-gray-100 rounded-xl p-3 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer"
      style={{ width: '160px', minWidth: '160px', flexShrink: 0 }}
      onClick={() => tooltipDetails && tooltipDetails.length > 0 && setActiveTooltip({
        label,
        icon: Icon,
        iconBg,
        iconColor,
        details: tooltipDetails
      })}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={cn("p-1.5 rounded-lg", iconBg)}>
          <Icon className={cn("h-3.5 w-3.5", iconColor)} />
        </div>
        <p className="text-xs text-gray-500 font-medium leading-tight">{label}</p>
      </div>
      <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
      {subLabel && <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>}
      {tooltipDetails && tooltipDetails.length > 0 && (
        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-400 rounded-full" />
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-visible">
      {/* Breakdown Modal */}
      {activeTooltip && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={() => setActiveTooltip(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          
          {/* Modal Card */}
          <div 
            className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={cn("px-5 py-4 border-b border-gray-100", activeTooltip.iconBg)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm">
                    <activeTooltip.icon className={cn("h-5 w-5", activeTooltip.iconColor)} />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">{activeTooltip.label}</p>
                    <p className="text-xs text-gray-500">Detailed Breakdown</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTooltip(null)}
                  className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                  aria-label="Close breakdown modal"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-3">
              {activeTooltip.details.map((detail, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-sm text-gray-600">{detail.label}</span>
                  <span className="text-lg font-bold text-gray-900">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header with metrics */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3 overflow-visible">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-base font-semibold text-gray-900">Financials</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
              aria-label={isMetricsExpanded ? "Collapse metrics" : "Expand metrics"}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              {isMetricsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              <span>{isMetricsExpanded ? 'Less' : 'More'}</span>
            </button>
            <button
              onClick={() => setIsTransactionPanelOpen(!isTransactionPanelOpen)}
              aria-label={isTransactionPanelOpen ? "Hide panel" : "Show panel"}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              {isTransactionPanelOpen ? <X className="h-3.5 w-3.5" /> : <PanelLeft className="h-3.5 w-3.5" />}
              <span>Panel</span>
            </button>
            <button
              onClick={handleRefresh}
              aria-label="Refresh data"
              className={cn(
                "p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors",
                isRefreshing && "animate-spin"
              )}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Metrics Row or Compact Summary */}
        {isMetricsExpanded ? (
          <div className="flex pt-2 pb-1 overflow-x-auto gap-3">
            <MetricCard
              label="Gross Volume"
            value={formatCurrency(metrics.grossVolume)}
            icon={Banknote}
            iconBg="bg-gray-100"
            iconColor="text-gray-600"
            subLabel={`${metrics.completedBookings} completed`}
            tooltipDetails={[
              { label: 'Total Bookings', value: metrics.totalBookings.toString() },
              { label: 'Completed', value: metrics.completedBookings.toString() },
              { label: 'Active', value: metrics.activeBookings.toString() },
              { label: 'Avg. Booking', value: metrics.completedBookings > 0 ? formatCurrency(metrics.grossVolume / metrics.completedBookings) : '₦0' },
            ]}
          />

          <MetricCard
            label="Platform Revenue"
            value={formatCurrency(metrics.platformRevenue)}
            icon={DollarSign}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            subLabel={`${metrics.totalBookings} bookings`}
            tooltipDetails={[
              { label: 'Guest Fees (10%)', value: formatCurrency(metrics.guestFees) },
              { label: 'Host Fees (3-5%)', value: formatCurrency(metrics.hostFees) },
              { label: 'Total Revenue', value: formatCurrency(metrics.platformRevenue) },
            ]}
          />

          <MetricCard
            label="Escrow Balance"
            value={formatCurrency(metrics.escrowBalance)}
            icon={Shield}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            subLabel={`${metrics.activeBookings} active`}
            tooltipDetails={[
              { label: 'Active Bookings', value: metrics.activeBookings.toString() },
              { label: 'Caution Held', value: formatCurrency(metrics.cautionHeld) },
              { label: 'Pending Payouts', value: metrics.pendingPayouts.toString() },
            ]}
          />

          <MetricCard
            label="Host Payouts"
            value={formatCurrency(metrics.hostPayouts)}
            icon={ArrowUpRight}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            subLabel={`${metrics.pendingPayouts} pending`}
            tooltipDetails={[
              { label: 'Total Released', value: formatCurrency(metrics.hostPayouts) },
              { label: 'Pending', value: metrics.pendingPayouts.toString() },
              { label: 'Caution Released', value: formatCurrency(metrics.cautionReleased) },
              { label: 'Caution Claimed', value: formatCurrency(metrics.cautionClaimed) },
            ]}
          />

          <MetricCard
            label="Refunds"
            value={formatCurrency(metrics.refunds)}
            icon={RefreshCw}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            subLabel={`${tabs.find(t => t.id === 'refunds')?.count || 0} issued`}
            tooltipDetails={[
              { label: 'Total Refunded', value: formatCurrency(metrics.refunds) },
              { label: 'Count', value: (tabs.find(t => t.id === 'refunds')?.count || 0).toString() },
            ]}
          />

          <MetricCard
            label="Guest Fees"
            value={formatCurrency(metrics.guestFees)}
            icon={User}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            subLabel="10% from guests"
          />

          <MetricCard
            label="Host Fees"
            value={formatCurrency(metrics.hostFees)}
            icon={Building2}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            subLabel="3-5% from hosts"
          />

          <MetricCard
            label="Caution Held"
            value={formatCurrency(metrics.cautionHeld)}
            icon={Shield}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            subLabel="Security deposits"
            tooltipDetails={[
              { label: 'Currently Held', value: formatCurrency(metrics.cautionHeld) },
              { label: 'Released', value: formatCurrency(metrics.cautionReleased) },
              { label: 'Claimed (Damages)', value: formatCurrency(metrics.cautionClaimed) },
            ]}
          />

          <MetricCard
            label="Extra Guests"
            value={formatCurrency(metrics.extraGuestFees)}
            icon={User}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            subLabel="Beyond max"
          />

          <MetricCard
            label="Add-ons"
            value={formatCurrency(metrics.extrasTotal)}
            icon={Receipt}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            subLabel="No platform fee"
          />
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm text-gray-600 pt-1">
            <span><span className="text-emerald-600 font-semibold">{formatCurrency(metrics.platformRevenue)}</span> revenue</span>
            <span className="text-gray-300">•</span>
            <span><span className="font-medium">{formatCurrency(metrics.escrowBalance)}</span> escrow</span>
            <span className="text-gray-300">•</span>
            <span><span className="font-medium">{metrics.totalBookings}</span> bookings</span>
            <span className="text-gray-300">•</span>
            <span><span className="text-rose-600 font-medium">{formatCurrency(metrics.refunds)}</span> refunds</span>
          </div>
        )}
      </div>

      {/* Main 2-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Transaction List */}
        {isTransactionPanelOpen && (
        <div className="w-96 border-r border-gray-200 flex flex-col bg-white">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded"
                >
                  <X className="h-3.5 w-3.5 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTxFilter(tab.id)}
                className={cn(
                  "flex-1 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  txFilter === tab.id
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {tab.label}
                <span className={cn(
                  "ml-1.5 px-1.5 py-0.5 text-xs rounded-full",
                  txFilter === tab.id ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-600"
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Transaction List */}
          <div className="flex-1 overflow-y-auto">
            {filteredTx.length === 0 ? (
              <div className="p-8 text-center">
                <Receipt className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900">No transactions</p>
                <p className="text-xs text-gray-500 mt-1">
                  {searchTerm ? "Try adjusting your search" : "Transactions will appear here"}
                </p>
              </div>
            ) : (
              filteredTx.map((tx) => {
                const isOutgoing = tx.type === 'HOST_PAYOUT' || tx.type === 'REFUND';
                const color = typeColors[tx.type] || { text: 'text-gray-700', bg: 'bg-gray-50' };

                return (
                  <button
                    key={tx.id}
                    onClick={() => setSelectedTxId(tx.id)}
                    className={cn(
                      "w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors border-l-2",
                      selectedTxId === tx.id ? "bg-gray-100 border-l-gray-400" : "border-l-transparent"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "p-2 rounded-lg",
                          tx.type === 'GUEST_PAYMENT' ? "bg-emerald-100" :
                          tx.type === 'HOST_PAYOUT' ? "bg-blue-100" :
                          tx.type === 'REFUND' ? "bg-rose-100" : "bg-gray-100"
                        )}>
                          {tx.type === 'GUEST_PAYMENT' ? (
                            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                          ) : tx.type === 'HOST_PAYOUT' ? (
                            <ArrowUpRight className="h-4 w-4 text-blue-600" />
                          ) : (
                            <RefreshCw className="h-4 w-4 text-rose-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {tx.listing?.title || 'Unknown Listing'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn("text-xs px-1.5 py-0.5 rounded", color.bg, color.text)}>
                              {typeLabels[tx.type]}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(tx.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={cn(
                          "text-sm font-semibold",
                          isOutgoing ? "text-gray-900" : "text-emerald-600"
                        )}>
                          {isOutgoing ? '-' : '+'}{formatCurrency(tx.amount)}
                        </p>
                        <span className={cn(
                          "text-xs",
                          tx.status === 'COMPLETED' ? "text-emerald-600" :
                          tx.status === 'PENDING' ? "text-amber-600" : "text-gray-500"
                        )}>
                          {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
        )}
        {/* Right Panel - Transaction Detail */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          {selectedTx ? (
            <div className="p-6">
              {/* Header */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      selectedTx.type === 'GUEST_PAYMENT' ? "bg-emerald-100" :
                      selectedTx.type === 'HOST_PAYOUT' ? "bg-blue-100" :
                      selectedTx.type === 'REFUND' ? "bg-rose-100" : "bg-gray-100"
                    )}>
                      {selectedTx.type === 'GUEST_PAYMENT' ? (
                        <ArrowDownLeft className="h-6 w-6 text-emerald-600" />
                      ) : selectedTx.type === 'HOST_PAYOUT' ? (
                        <ArrowUpRight className="h-6 w-6 text-blue-600" />
                      ) : (
                        <RefreshCw className="h-6 w-6 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {typeLabels[selectedTx.type]}
                        {selectedTx.type === 'GUEST_PAYMENT' && ' Received'}
                        {selectedTx.type === 'HOST_PAYOUT' && ' to Host'}
                        {selectedTx.type === 'REFUND' && ' Issued'}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {formatDate(selectedTx.timestamp, true)}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                    selectedTx.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-700" :
                    selectedTx.status === 'PENDING' ? "bg-amber-50 text-amber-700" :
                    "bg-rose-50 text-rose-700"
                  )}>
                    {selectedTx.status === 'COMPLETED' ? <CheckCircle className="h-4 w-4" /> :
                     selectedTx.status === 'PENDING' ? <Clock className="h-4 w-4" /> :
                     <XCircle className="h-4 w-4" />}
                    {selectedTx.status.charAt(0) + selectedTx.status.slice(1).toLowerCase()}
                  </span>
                </div>

                <div className={cn(
                  "text-3xl font-bold",
                  selectedTx.type === 'HOST_PAYOUT' || selectedTx.type === 'REFUND'
                    ? "text-gray-900"
                    : "text-emerald-600"
                )}>
                  {selectedTx.type === 'HOST_PAYOUT' || selectedTx.type === 'REFUND' ? '-' : '+'}
                  {formatCurrency(selectedTx.amount)}
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Transaction Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Transaction ID</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {selectedTx.id.slice(0, 16)}...
                      </code>
                      <button
                        onClick={() => copyText(selectedTx.id)}
                        aria-label="Copy transaction ID"
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Copy className="h-3.5 w-3.5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {selectedTx.paystackReference && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Paystack Reference</span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {selectedTx.paystackReference}
                        </code>
                        <button
                          onClick={() => copyText(selectedTx.paystackReference!)}
                          aria-label="Copy Paystack reference"
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Copy className="h-3.5 w-3.5 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Type</span>
                    <span className={cn(
                      "text-sm px-2 py-0.5 rounded",
                      typeColors[selectedTx.type]?.bg,
                      typeColors[selectedTx.type]?.text
                    )}>
                      {typeLabels[selectedTx.type]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-500">Timestamp</span>
                    <span className="text-sm text-gray-900">{formatDate(selectedTx.timestamp, true)}</span>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown - Show for GUEST_PAYMENT transactions with metadata */}
              {selectedTx.type === 'GUEST_PAYMENT' && (selectedTx.breakdown || selectedTx.metadata?.breakdown) && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment Breakdown</h3>
                  <div className="space-y-3">
                    {/* Base Amount */}
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Listing Price</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(selectedTx.breakdown?.baseAmount || selectedTx.metadata?.breakdown?.listingPrice || selectedTx.metadata?.baseAmount || 0)}
                      </span>
                    </div>

                    {/* Guest Service Fee */}
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Guest Service Fee</span>
                        <span className="text-xs text-gray-400">(10%)</span>
                      </div>
                      <span className="text-sm font-medium text-emerald-600">
                        +{formatCurrency(selectedTx.breakdown?.guestServiceFee || selectedTx.metadata?.breakdown?.userServiceFee || selectedTx.metadata?.userServiceFee || 0)}
                      </span>
                    </div>

                    {/* Host Service Fee */}
                    {(selectedTx.breakdown?.hostServiceFee || selectedTx.metadata?.breakdown?.hostServiceFee || selectedTx.metadata?.hostServiceFee) ? (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Host Service Fee</span>
                          <span className="text-xs text-gray-400">(3-5%)</span>
                        </div>
                        <span className="text-sm font-medium text-violet-600">
                          {formatCurrency(selectedTx.breakdown?.hostServiceFee || selectedTx.metadata?.breakdown?.hostServiceFee || selectedTx.metadata?.hostServiceFee || 0)}
                        </span>
                      </div>
                    ) : null}

                    {/* Caution Fee */}
                    {(selectedTx.breakdown?.cautionFee || selectedTx.metadata?.breakdown?.cautionFee || selectedTx.metadata?.cautionFee) ? (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-sm text-gray-600">Security Deposit</span>
                        </div>
                        <span className="text-sm font-medium text-amber-600">
                          +{formatCurrency(selectedTx.breakdown?.cautionFee || selectedTx.metadata?.breakdown?.cautionFee || selectedTx.metadata?.cautionFee || 0)}
                        </span>
                      </div>
                    ) : null}

                    {/* Extra Guest Fees */}
                    {(selectedTx.breakdown?.extraGuestFees || selectedTx.metadata?.breakdown?.extraGuestFees || selectedTx.metadata?.extraGuestFees) ? (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-sm text-gray-600">Extra Guest Fees</span>
                        </div>
                        <span className="text-sm font-medium text-blue-600">
                          +{formatCurrency(selectedTx.breakdown?.extraGuestFees || selectedTx.metadata?.breakdown?.extraGuestFees || selectedTx.metadata?.extraGuestFees || 0)}
                        </span>
                      </div>
                    ) : null}

                    {/* Total */}
                    <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-gray-200">
                      <span className="text-sm font-semibold text-gray-900">Total Charged</span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(selectedTx.amount)}
                      </span>
                    </div>

                    {/* Platform Revenue Note */}
                    <div className="bg-violet-50 rounded-lg p-3 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-violet-700 font-medium">Platform Revenue</span>
                        <span className="text-sm font-semibold text-violet-700">
                          {formatCurrency(
                            (selectedTx.breakdown?.guestServiceFee || selectedTx.metadata?.breakdown?.userServiceFee || selectedTx.metadata?.userServiceFee || 0) +
                            (selectedTx.breakdown?.hostServiceFee || selectedTx.metadata?.breakdown?.hostServiceFee || selectedTx.metadata?.hostServiceFee || 0)
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-violet-600 mt-1">Guest fee + Host fee collected</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Info */}
              {selectedTx.listing && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Booking Information</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{selectedTx.listing.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedTx.listing.address || 'No address'}
                      </p>
                      {selectedTx.booking && (
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="text-gray-500">
                            Booking: <span className="text-gray-700 font-medium">{selectedTx.booking.id.slice(0, 8)}...</span>
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs",
                            selectedTx.booking.status === 'Completed' ? "bg-emerald-50 text-emerald-700" :
                            selectedTx.booking.status === 'Cancelled' ? "bg-rose-50 text-rose-700" :
                            "bg-amber-50 text-amber-700"
                          )}>
                            {selectedTx.booking.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Parties */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Parties Involved</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedTx.guest && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Guest</p>
                        <p className="text-sm font-medium text-gray-900">{selectedTx.guest.name}</p>
                      </div>
                    </div>
                  )}
                  {selectedTx.host && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Host</p>
                        <p className="text-sm font-medium text-gray-900">{selectedTx.host.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {selectedTx.paystackReference && (
                  <a
                    href={`https://dashboard.paystack.com/#/transactions/${selectedTx.paystackReference}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View in Paystack
                  </a>
                )}
                {selectedTx.type === 'GUEST_PAYMENT' && selectedTx.booking && onRefund && (
                  <button
                    onClick={() => onRefund(selectedTx.booking!.id, selectedTx.amount)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-rose-200 text-rose-600 text-sm font-medium rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Issue Refund
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Select a Transaction</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Choose a transaction from the list to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinancialsTab;
