import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HostDashboardPage from '../../../features/HostDashboard/pages/HostDashboardPage';
import { User, Role, ListingStatus } from '@fiilar/types';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@fiilar/ui';

// Helper to wrap component with necessary providers
const renderWithProviders = (ui: React.ReactElement, initialEntries: string[] = ['/host/dashboard']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ToastProvider>
        <Routes>
          <Route path="/host/dashboard" element={ui} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>
  );
};

// Mock hooks
const mockHandleDeleteListing = vi.fn();
const mockConfirmDelete = vi.fn();
const mockCancelDelete = vi.fn();

vi.mock('../../../features/HostDashboard/hooks/useListingActions', () => ({
  useListingActions: () => ({
    handleDeleteListing: mockHandleDeleteListing,
    deleteConfirm: { isOpen: false, listingId: null, message: '' },
    confirmDelete: mockConfirmDelete,
    cancelDelete: mockCancelDelete
  })
}));

vi.mock('../../../features/HostDashboard/hooks/useHostBookings', () => ({
  useHostBookings: () => ({
    hostBookings: [
      { id: 'b1', status: 'Pending' } // Mock one pending booking for badge
    ],
    bookingFilter: 'all',
    setBookingFilter: vi.fn(),
    bookingView: 'table',
    setBookingView: vi.fn(),
    handleAcceptBooking: vi.fn(),
    handleRejectBooking: vi.fn(),
    handleReleaseFunds: vi.fn(),
  })
}));

vi.mock('../../../features/HostDashboard/hooks/useHostFinancials', () => ({
  useHostFinancials: () => ({
    bankDetails: null,
    setBankDetails: vi.fn(),
    isVerifyingBank: false,
    hostTransactions: [],
    handleVerifyBank: vi.fn(),
    handleSaveBankDetails: vi.fn(),
  })
}));

// Mock components to avoid deep rendering and focus on navigation
vi.mock('../../../features/HostDashboard/components/HostOverview', () => ({
  default: ({ onNavigateToBooking }: { onNavigateToBooking: (booking: any) => void }) => (
    <div data-testid="host-overview">
      <button onClick={() => onNavigateToBooking({ id: 'b1' })}>Go to Booking</button>
    </div>
  )
}));
vi.mock('../../../features/HostDashboard/components/HostListings', () => ({
  default: ({ onEdit, onDelete, onCreate }: any) => (
    <div data-testid="host-listings">
      <button onClick={() => onEdit({ id: 'l1' })}>Edit Listing</button>
      <button onClick={() => onDelete('l1')}>Delete Listing</button>
      <button onClick={onCreate}>Create Listing</button>
    </div>
  )
}));
vi.mock('../../../features/HostDashboard/components/HostBookings', () => ({
  default: () => <div data-testid="host-bookings">Host Bookings</div>
}));
vi.mock('../../../features/HostDashboard/components/HostEarnings', () => ({
  default: () => <div data-testid="host-earnings">Host Earnings</div>
}));
vi.mock('../../../features/HostDashboard/components/HostFinancials', () => ({
  default: () => <div data-testid="host-financials">Host Financials</div>
}));
vi.mock('../../../features/HostDashboard/components/CreateListingWizard', () => ({
  default: () => <div data-testid="create-listing-wizard">Create Listing Wizard</div>
}));
vi.mock('../../../features/HostDashboard/components/HostSettings', () => ({
  default: () => <div data-testid="host-settings">Host Settings</div>
}));
vi.mock('../../../features/Notifications/pages/NotificationsPage', () => ({
  default: () => <div data-testid="notifications-page">Notifications Page</div>
}));
vi.mock('../../../features/Messaging/components/ChatList', () => ({
  ChatList: ({ onSelect }: { onSelect: (id: string) => void }) => (
    <div data-testid="chat-list">
      <button onClick={() => onSelect('c1')}>Select Conversation</button>
    </div>
  )
}));
vi.mock('../../../features/Messaging/components/ChatWindow', () => ({
  ChatWindow: () => <div data-testid="chat-window">Chat Window</div>
}));

// Mock services
vi.mock('@fiilar/messaging', () => ({
  getConversations: vi.fn().mockReturnValue([
    { id: 'c1', participants: ['host1', 'user2'], unreadCount: 2 }
  ]),
}));

const mockUser: User = {
  id: 'host1',
  name: 'Host User',
  email: 'host@example.com',
  role: Role.HOST,
  kycVerified: true,
  favorites: []
} as unknown as User;

const mockListings = [
  { id: 'l1', hostId: 'host1', status: ListingStatus.PENDING_APPROVAL }
] as any[];

describe('HostDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders overview by default', () => {
    renderWithProviders(
      <HostDashboardPage user={mockUser} listings={[]} refreshData={vi.fn()} />
    );

    expect(screen.getByTestId('host-overview')).toBeInTheDocument();
  });

  it('navigates to listings view when tab is clicked', () => {
    renderWithProviders(
      <HostDashboardPage user={mockUser} listings={[]} refreshData={vi.fn()} />
    );

    const listingsTab = screen.getByRole('button', { name: /listings/i });
    fireEvent.click(listingsTab);

    expect(screen.getByTestId('host-listings')).toBeInTheDocument();
    expect(screen.queryByTestId('host-overview')).not.toBeInTheDocument();
  });

  it('navigates to bookings view when tab is clicked', () => {
    renderWithProviders(
      <HostDashboardPage user={mockUser} listings={[]} refreshData={vi.fn()} />
    );

    const bookingsTab = screen.getByRole('button', { name: /bookings/i });
    fireEvent.click(bookingsTab);

    expect(screen.getByTestId('host-bookings')).toBeInTheDocument();
  });

  it('renders correct view based on URL query param', () => {
    renderWithProviders(
      <HostDashboardPage user={mockUser} listings={[]} refreshData={vi.fn()} />,
      ['/host/dashboard?view=earnings']
    );

    expect(screen.getByTestId('host-earnings')).toBeInTheDocument();
  });

  // --- New Tests ---

  it('renders settings view', () => {
    renderWithProviders(
      <HostDashboardPage user={mockUser} listings={[]} refreshData={vi.fn()} />,
      ['/host/dashboard?view=settings']
    );
    expect(screen.getByTestId('host-settings')).toBeInTheDocument();
  });

  it('renders notifications view', () => {
    renderWithProviders(
      <HostDashboardPage user={mockUser} listings={[]} refreshData={vi.fn()} />,
      ['/host/dashboard?view=notifications']
    );
    expect(screen.getByTestId('notifications-page')).toBeInTheDocument();
  });

  it('renders create listing wizard', () => {
    renderWithProviders(
      <HostDashboardPage user={mockUser} listings={[]} refreshData={vi.fn()} />,
      ['/host/dashboard?view=create']
    );
    expect(screen.getByTestId('create-listing-wizard')).toBeInTheDocument();
  });

  it('renders messages view', () => {
    renderWithProviders(
      <HostDashboardPage user={mockUser} listings={[]} refreshData={vi.fn()} />,
      ['/host/dashboard?view=messages']
    );
    expect(screen.getByTestId('chat-list')).toBeInTheDocument();
    // Chat window is hidden initially on desktop if no conversation selected?
    // The code says: {selectedConversationId ? <ChatWindow ... /> : <div ...>No conversation selected</div>}
    expect(screen.getByText('No conversation selected')).toBeInTheDocument();
  });

  it('triggers new listing creation', () => {
    renderWithProviders(
      <HostDashboardPage user={mockUser} listings={[]} refreshData={vi.fn()} />
    );

    const newListingBtns = screen.getAllByRole('button', { name: /new listing/i });
    // Click the first one (desktop sidebar usually)
    fireEvent.click(newListingBtns[0]);
    expect(screen.getByTestId('create-listing-wizard')).toBeInTheDocument();
  });

  it('shows badges for pending items', () => {
    renderWithProviders(
      <HostDashboardPage user={mockUser} listings={mockListings} refreshData={vi.fn()} />
    );

    // Pending listings badge (1)
    // The badge is inside the button. We can check if text "1" exists.
    // But "1" might be ambiguous.
    // Let's check if the badge element exists.
    // The badge has class "bg-orange-100".
    // Or we can just check text content of the button.
    const listingsBtn = screen.getByRole('button', { name: /listings/i });
    expect(listingsBtn).toHaveTextContent('1');

    const bookingsBtn = screen.getByRole('button', { name: /bookings/i });
    expect(bookingsBtn).toHaveTextContent('1'); // From mock hook
  });

  it('toggles mobile menu and navigates', () => {
    renderWithProviders(
      <HostDashboardPage user={mockUser} listings={[]} refreshData={vi.fn()} />
    );

    const menuBtn = screen.getByLabelText('Toggle menu');

    // Initially mobile menu is closed
    // Desktop sidebar is visible (in jsdom), so 'Overview' is present once
    expect(screen.getAllByText('Overview')).toHaveLength(1);

    // Open menu
    fireEvent.click(menuBtn);

    // Now 'Overview' should be present twice (Desktop + Mobile)
    const overviewButtons = screen.getAllByText('Overview');
    expect(overviewButtons).toHaveLength(2);

    // Helper to click mobile item (the second one)
    const clickMobileItem = (text: string) => {
      const items = screen.getAllByText(text);
      expect(items.length).toBeGreaterThan(1); // Ensure mobile item exists
      fireEvent.click(items[1]); // Click the mobile one
    };

    // Click Listings (Mobile)
    clickMobileItem('Listings');
    expect(screen.getByTestId('host-listings')).toBeInTheDocument();
    // Menu should close after click?
    // The code: onClick={() => { setView('listings'); setIsMobileMenuOpen(false); }}
    // So now 'Overview' should be 1 again?
    // Wait, 'Overview' is always in sidebar. 'Listings' is in sidebar too.
    // If menu closed, mobile items are gone.
    expect(screen.getAllByText('Overview')).toHaveLength(1);

    // Re-open and click Bookings
    fireEvent.click(menuBtn);
    clickMobileItem('Bookings');
    expect(screen.getByTestId('host-bookings')).toBeInTheDocument();

    // Re-open and click Earnings
    fireEvent.click(menuBtn);
    clickMobileItem('Earnings');
    expect(screen.getByTestId('host-earnings')).toBeInTheDocument();

    // Re-open and click Messages
    fireEvent.click(menuBtn);
    clickMobileItem('Messages');
    expect(screen.getByTestId('chat-list')).toBeInTheDocument();

    // Re-open and click Settings
    fireEvent.click(menuBtn);
    clickMobileItem('Settings');
    expect(screen.getByTestId('host-settings')).toBeInTheDocument();

    // Re-open and click Overview
    fireEvent.click(menuBtn);
    clickMobileItem('Overview');
    expect(screen.getByTestId('host-overview')).toBeInTheDocument();
  });

  it('renders payouts view', () => {
    renderWithProviders(
      <HostDashboardPage user={mockUser} listings={[]} refreshData={vi.fn()} />,
      ['/host/dashboard?view=payouts']
    );
    expect(screen.getByTestId('host-financials')).toBeInTheDocument();
  });

  it('handles conversation selection in messages view', () => {
    renderWithProviders(
      <HostDashboardPage user={mockUser} listings={[]} refreshData={vi.fn()} />,
      ['/host/dashboard?view=messages']
    );

    // Initially no conversation selected
    expect(screen.getByText('No conversation selected')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-window')).not.toBeInTheDocument();

    // Simulate selecting a conversation
    fireEvent.click(screen.getByText('Select Conversation'));

    // Now ChatWindow should be visible
    expect(screen.getByTestId('chat-window')).toBeInTheDocument();
    expect(screen.queryByText('No conversation selected')).not.toBeInTheDocument();
  });

  it('navigates to specific booking from overview', () => {
    renderWithProviders(
      <HostDashboardPage user={mockUser} listings={[]} refreshData={vi.fn()} />
    );

    fireEvent.click(screen.getByText('Go to Booking'));

    // Should navigate to bookings view
    expect(screen.getByTestId('host-bookings')).toBeInTheDocument();
    // URL check is tricky with MemoryRouter inside the component, but we can check if the view changed.
  });

  it('passes actions to HostListings', () => {
    renderWithProviders(
      <HostDashboardPage user={mockUser} listings={[]} refreshData={vi.fn()} />,
      ['/host/dashboard?view=listings']
    );

    fireEvent.click(screen.getByText('Edit Listing'));
    expect(screen.getByTestId('create-listing-wizard')).toBeInTheDocument();

    // Reset view to listings for next assertions (simulating back or just re-rendering)
    // Since we can't easily reset view in this test setup without re-rendering, let's just check delete which is independent of view change (it's an action)

    fireEvent.click(screen.getByText('Delete Listing'));
    expect(mockHandleDeleteListing).toHaveBeenCalledWith('l1');

    // Create listing also changes view
    fireEvent.click(screen.getByText('Create Listing'));
    expect(screen.getByTestId('create-listing-wizard')).toBeInTheDocument();
  });
});
