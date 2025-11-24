import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HostDashboardPage from '../../../features/HostDashboard/pages/HostDashboardPage';
import { User, Role, Listing, ListingStatus, SpaceType, BookingType, CancellationPolicy } from '@fiilar/types';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock hooks - we need to mock them because they are called in the component
vi.mock('../../../features/HostDashboard/hooks/useListingActions', () => ({
  useListingActions: () => ({
    handleDeleteListing: vi.fn()
  })
}));

vi.mock('../../../features/HostDashboard/hooks/useHostBookings', () => ({
  useHostBookings: () => ({
    hostBookings: [],
    bookingFilter: 'all',
  })
}));

vi.mock('../../../features/HostDashboard/hooks/useHostFinancials', () => ({
  useHostFinancials: () => ({
    bankDetails: null,
    hostTransactions: [],
  })
}));

// Mock services
vi.mock('../../../services/storage', () => ({
  getConversations: vi.fn().mockReturnValue([]),
}));

// Mock HostListings to inspect props
const MockHostListings = vi.fn(({ listings }) => (
  <div data-testid="host-listings">
    Count: {listings.length}
    {listings.map((l: Listing) => (
      <div key={l.id} data-testid={`listing-${l.id}`}>{l.title}</div>
    ))}
  </div>
));

vi.mock('../../../features/HostDashboard/components/HostListings', () => ({
  default: (props: any) => MockHostListings(props)
}));

// Mock other components
vi.mock('../../../features/HostDashboard/components/HostOverview', () => ({ default: () => <div>Overview</div> }));
vi.mock('../../../features/HostDashboard/components/HostBookings', () => ({ default: () => <div>Bookings</div> }));
vi.mock('../../../features/HostDashboard/components/HostEarnings', () => ({ default: () => <div>Earnings</div> }));
vi.mock('../../../features/HostDashboard/components/HostFinancials', () => ({ default: () => <div>Financials</div> }));
vi.mock('../../../features/HostDashboard/components/CreateListingWizard', () => ({ default: () => <div>Wizard</div> }));
vi.mock('../../../features/HostDashboard/components/HostSettings', () => ({ default: () => <div>Settings</div> }));
vi.mock('../../Notifications/pages/NotificationsPage', () => ({ default: () => <div>Notifications</div> }));
vi.mock('../../Messaging/components/ChatList', () => ({ ChatList: () => <div>ChatList</div> }));
vi.mock('../../Messaging/components/ChatWindow', () => ({ ChatWindow: () => <div>ChatWindow</div> }));


const mockUser: User = {
  id: 'host1',
  name: 'Host User',
  email: 'host@example.com',
  role: Role.HOST,
  kycVerified: true,
  favorites: [],
  walletBalance: 0,
  emailVerified: true,
  phoneVerified: true,
  createdAt: new Date().toISOString()
} as unknown as User;

const mockListings: Listing[] = [
  {
    id: 'l1',
    hostId: 'host1', // Belongs to user
    title: 'Host Listing 1',
    description: 'Desc',
    type: SpaceType.APARTMENT,
    price: 100,
    priceUnit: BookingType.DAILY,
    location: 'Loc',
    status: ListingStatus.LIVE,
    images: [],
    tags: [],
    availability: {},
    requiresIdentityVerification: false,
    settings: { allowRecurring: true, minDuration: 1, instantBook: false },
    capacity: 2,
    includedGuests: 1,
    pricePerExtraGuest: 0,
    cautionFee: 0,
    addOns: [],
    cancellationPolicy: CancellationPolicy.MODERATE,
    houseRules: [],
    safetyItems: []
  },
  {
    id: 'l2',
    hostId: 'host2', // Belongs to OTHER user
    title: 'Other Listing',
    description: 'Desc',
    type: SpaceType.APARTMENT,
    price: 100,
    priceUnit: BookingType.DAILY,
    location: 'Loc',
    status: ListingStatus.LIVE,
    images: [],
    tags: [],
    availability: {},
    requiresIdentityVerification: false,
    settings: { allowRecurring: true, minDuration: 1, instantBook: false },
    capacity: 2,
    includedGuests: 1,
    pricePerExtraGuest: 0,
    cautionFee: 0,
    addOns: [],
    cancellationPolicy: CancellationPolicy.MODERATE,
    houseRules: [],
    safetyItems: []
  },
  {
    id: 'l3',
    hostId: 'host1', // Belongs to user
    title: 'Host Listing 2',
    description: 'Desc',
    type: SpaceType.APARTMENT,
    price: 100,
    priceUnit: BookingType.DAILY,
    location: 'Loc',
    status: ListingStatus.LIVE,
    images: [],
    tags: [],
    availability: {},
    requiresIdentityVerification: false,
    settings: { allowRecurring: true, minDuration: 1, instantBook: false },
    capacity: 2,
    includedGuests: 1,
    pricePerExtraGuest: 0,
    cautionFee: 0,
    addOns: [],
    cancellationPolicy: CancellationPolicy.MODERATE,
    houseRules: [],
    safetyItems: []
  }
];

describe('HostDashboardPage Filtering', () => {
  it('filters listings to only show those belonging to the current user', () => {
    render(
      <MemoryRouter initialEntries={['/host/dashboard?view=listings']}>
        <Routes>
          <Route path="/host/dashboard" element={
            <HostDashboardPage user={mockUser} listings={mockListings} refreshData={vi.fn()} />
          } />
        </Routes>
      </MemoryRouter>
    );

    // Check that HostListings is rendered
    expect(screen.getByTestId('host-listings')).toBeInTheDocument();

    // Check that only host1's listings are passed
    expect(screen.getByText('Count: 2')).toBeInTheDocument();
    expect(screen.getByTestId('listing-l1')).toBeInTheDocument();
    expect(screen.getByTestId('listing-l3')).toBeInTheDocument();

    // Ensure l2 (host2) is NOT present
    expect(screen.queryByTestId('listing-l2')).not.toBeInTheDocument();
  });
});
