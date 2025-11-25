import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminPanel } from '@fiilar/admin';
import { User, Listing, ListingStatus, Role, BookingType, SpaceType } from '@fiilar/types';
import * as storageService from '@fiilar/storage';
import { escrowService } from '@fiilar/escrow';
import * as kycService from '@fiilar/kyc';

// Mock dependencies
vi.mock('@fiilar/storage', () => ({
  saveListing: vi.fn(),
  getBookings: vi.fn().mockReturnValue([]),
}));

vi.mock('@fiilar/kyc', () => ({
  updateKYC: vi.fn(),
}));

vi.mock('@fiilar/escrow', () => ({
  escrowService: {
    getPlatformFinancials: vi.fn().mockResolvedValue({}),
    getEscrowTransactions: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../../features/Admin/components/FinancialsTab', () => ({
  default: () => <div data-testid="financials-tab">Financials Tab Content</div>,
}));

const mockUsers: User[] = [
  { id: '1', name: 'Host 1', email: 'host1@example.com', role: Role.HOST, kycStatus: 'pending', kycDocument: 'doc.pdf', favorites: [], walletBalance: 0, createdAt: new Date().toISOString(), isHost: true, emailVerified: true, password: 'pass' },
  { id: '2', name: 'User 1', email: 'user1@example.com', role: Role.USER, kycStatus: 'verified', favorites: [], walletBalance: 0, createdAt: new Date().toISOString(), isHost: false, emailVerified: true, password: 'pass' },
];

const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Pending Listing',
    description: 'Desc',
    location: 'Loc',
    price: 100,
    priceUnit: BookingType.HOURLY,
    images: ['img.jpg'],
    hostId: '1',
    status: ListingStatus.PENDING_APPROVAL,
    amenities: [],
    tags: [],
    type: SpaceType.STUDIO,
    requiresIdentityVerification: false,
    rating: 0,
    reviewCount: 0
  },
  {
    id: '2',
    title: 'Live Listing',
    description: 'Desc',
    location: 'Loc',
    price: 200,
    priceUnit: BookingType.HOURLY,
    images: ['img.jpg'],
    hostId: '1',
    status: ListingStatus.LIVE,
    amenities: [],
    tags: [],
    type: SpaceType.STUDIO,
    requiresIdentityVerification: false,
    rating: 5,
    reviewCount: 1
  }
];

describe('AdminPanel', () => {
  const refreshData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.alert
    vi.stubGlobal('alert', vi.fn());
  });

  it('renders KYC tab by default', () => {
    render(<AdminPanel users={mockUsers} listings={mockListings} refreshData={refreshData} />);
    expect(screen.getByText('KYC Verification')).toBeInTheDocument();
    expect(screen.getByText('Host 1')).toBeInTheDocument();
  });

  it('switches to Listings tab', () => {
    render(<AdminPanel users={mockUsers} listings={mockListings} refreshData={refreshData} />);

    // Find the button that contains "Listings" text. 
    // Since there are multiple elements with "Listings" (sidebar, mobile header), we can use getAllByText and pick one, or be more specific.
    // The sidebar button has text "Listings" and an icon.
    const listingsTabs = screen.getAllByText('Listings');
    fireEvent.click(listingsTabs[0]); // Click the first one found (likely sidebar or mobile nav)

    expect(screen.getByText('Listing Approvals')).toBeInTheDocument();
    expect(screen.getByText('Pending Listing')).toBeInTheDocument();
  });

  it('switches to Financials tab', async () => {
    render(<AdminPanel users={mockUsers} listings={mockListings} refreshData={refreshData} />);

    const financialsTabs = screen.getAllByText('Financials');
    fireEvent.click(financialsTabs[0]);

    expect(screen.getByTestId('financials-tab')).toBeInTheDocument();
    await waitFor(() => expect(escrowService.getPlatformFinancials).toHaveBeenCalled());
  });



  // ... (inside describe block)

  it('approves user KYC', () => {
    render(<AdminPanel users={mockUsers} listings={mockListings} refreshData={refreshData} />);

    const approveButton = screen.getByRole('button', { name: /approve/i });
    fireEvent.click(approveButton);

    expect(kycService.updateKYC).toHaveBeenCalledWith('1', 'verified');
    expect(refreshData).toHaveBeenCalled();
  });

  it('rejects user KYC', () => {
    render(<AdminPanel users={mockUsers} listings={mockListings} refreshData={refreshData} />);

    const rejectButton = screen.getByRole('button', { name: /reject/i });
    fireEvent.click(rejectButton);

    // Based on current implementation, updateKYC is not called on rejection
    expect(kycService.updateKYC).not.toHaveBeenCalled();
    expect(refreshData).toHaveBeenCalled();
  });

  it('approves listing', () => {
    render(<AdminPanel users={mockUsers} listings={mockListings} refreshData={refreshData} />);

    const listingsTabs = screen.getAllByText('Listings');
    fireEvent.click(listingsTabs[0]);

    const approveButton = screen.getByRole('button', { name: /approve/i });
    fireEvent.click(approveButton);

    expect(storageService.saveListing).toHaveBeenCalledWith(expect.objectContaining({
      id: '1',
      status: ListingStatus.LIVE
    }));
    expect(refreshData).toHaveBeenCalled();
  });

  it('opens rejection modal and declines listing', () => {
    render(<AdminPanel users={mockUsers} listings={mockListings} refreshData={refreshData} />);

    const listingsTabs = screen.getAllByText('Listings');
    fireEvent.click(listingsTabs[0]);

    const declineButton = screen.getByRole('button', { name: /decline/i });
    fireEvent.click(declineButton);

    expect(screen.getByText('Decline Listing')).toBeInTheDocument();

    const reasonInput = screen.getByLabelText('Reason for rejection');
    fireEvent.change(reasonInput, { target: { value: 'Bad photos' } });

    const confirmButton = screen.getByRole('button', { name: /confirm decline/i });
    fireEvent.click(confirmButton);

    expect(storageService.saveListing).toHaveBeenCalledWith(expect.objectContaining({
      id: '1',
      status: ListingStatus.REJECTED,
      rejectionReason: 'Bad photos'
    }));
    expect(refreshData).toHaveBeenCalled();
  });

  it('uses preset photography offer in rejection modal', () => {
    render(<AdminPanel users={mockUsers} listings={mockListings} refreshData={refreshData} />);

    const listingsTabs = screen.getAllByText('Listings');
    fireEvent.click(listingsTabs[0]);

    const declineButton = screen.getByRole('button', { name: /decline/i });
    fireEvent.click(declineButton);

    const presetButton = screen.getByRole('button', { name: /offer free photography/i });
    fireEvent.click(presetButton);

    const reasonInput = screen.getByLabelText('Reason for rejection') as HTMLTextAreaElement;
    expect(reasonInput.value).toContain("Your space has great potential");
  });

  it('closes rejection modal without confirming', () => {
    render(<AdminPanel users={mockUsers} listings={mockListings} refreshData={refreshData} />);

    const listingsTabs = screen.getAllByText('Listings');
    fireEvent.click(listingsTabs[0]);

    const declineButton = screen.getByRole('button', { name: /decline/i });
    fireEvent.click(declineButton);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Decline Listing')).not.toBeInTheDocument();
    expect(storageService.saveListing).not.toHaveBeenCalled();
  });

  it('handles error when loading financial data', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    (escrowService.getPlatformFinancials as any).mockRejectedValue(new Error('Fetch failed'));

    render(<AdminPanel users={mockUsers} listings={mockListings} refreshData={refreshData} />);

    const financialsTabs = screen.getAllByText('Financials');
    fireEvent.click(financialsTabs[0]);

    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Failed to load financial data:', expect.any(Error)));
    consoleSpy.mockRestore();
  });

  it('renders empty state for KYC requests', () => {
    const verifiedUsers = mockUsers.map(u => ({ ...u, kycVerified: true }));
    render(<AdminPanel users={verifiedUsers} listings={mockListings} refreshData={refreshData} />);

    expect(screen.getByText('No pending KYC requests')).toBeInTheDocument();
  });

  it('renders empty state for pending listings', () => {
    const liveListings = mockListings.filter(l => l.status === ListingStatus.LIVE);
    render(<AdminPanel users={mockUsers} listings={liveListings} refreshData={refreshData} />);

    const listingsTabs = screen.getAllByText('Listings');
    fireEvent.click(listingsTabs[0]);

    expect(screen.getByText('No pending listings')).toBeInTheDocument();
  });
});
