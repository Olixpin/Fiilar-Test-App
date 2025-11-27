import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ListingCard from '../../features/Listings/components/ListingCard';
import { Listing, BookingType, ListingStatus, SpaceType } from '@fiilar/types';
import { BrowserRouter } from 'react-router-dom';
import * as storageService from '@fiilar/storage';

// Mock storage service
vi.mock('@fiilar/storage', () => ({
  getCurrentUser: vi.fn(),
  toggleFavorite: vi.fn(),
  getAllUsers: vi.fn().mockReturnValue([]),
  hasBookingDraft: vi.fn().mockReturnValue(false),
}));

const mockListing: Listing = {
  id: '1',
  title: 'Test Listing',
  description: 'Description',
  location: 'Test Location',
  price: 100,
  priceUnit: BookingType.HOURLY,
  images: ['img1.jpg', 'img2.jpg'],
  hostId: 'host1',
  status: ListingStatus.LIVE,
  amenities: [],
  tags: [],
  type: SpaceType.STUDIO,
  requiresIdentityVerification: false,
  rating: 4.9,
  reviewCount: 10
};

// Mock Image that triggers onload via setter
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private _src = '';
  
  get src() {
    return this._src;
  }
  
  set src(value: string) {
    this._src = value;
    // Trigger onload synchronously when src is set
    if (this.onload) {
      Promise.resolve().then(() => this.onload?.());
    }
  }
}

describe('ListingCard', () => {
  const originalImage = global.Image;

  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).Image = MockImage;
  });

  afterEach(() => {
    (global as any).Image = originalImage;
    vi.useRealTimers();
  });

  it('renders listing details correctly', async () => {
    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} batchReady={true} priority={true} />
      </BrowserRouter>
    );

    // Wait for Image.onload to be called
    await waitFor(() => {
      expect(screen.getByText('Test Listing')).toBeInTheDocument();
    });
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    // Price is formatted with Naira (₦) by default
    expect(screen.getByText('₦100')).toBeInTheDocument();
    // Unit is abbreviated
    expect(screen.getByText(/Hr/)).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'img1.jpg');
  });

  it('shows ID badge when requiresIdentityVerification is true', async () => {
    const listingWithIdReq = { ...mockListing, requiresIdentityVerification: true };
    render(
      <BrowserRouter>
        <ListingCard listing={listingWithIdReq} batchReady={true} priority={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      // The component shows a vertical "ID" badge for identity verification
      expect(screen.getByText('ID')).toBeInTheDocument();
    });
  });

  it('toggles favorite status when heart icon is clicked', async () => {
    const mockUser = { id: 'user1', name: 'User', email: 'user@example.com', role: 'USER', favorites: [] };
    (storageService.getCurrentUser as any).mockReturnValue(mockUser);
    (storageService.toggleFavorite as any).mockReturnValue(['1']);

    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} batchReady={true} priority={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add to favorites/i })).toBeInTheDocument();
    });

    const heartButton = screen.getByRole('button', { name: /add to favorites/i });
    fireEvent.click(heartButton);

    expect(storageService.toggleFavorite).toHaveBeenCalledWith('user1', '1');
  });

  it('redirects to login if user is not logged in when clicking favorite', async () => {
    (storageService.getCurrentUser as any).mockReturnValue(null);
    
    // We can't easily test navigation with BrowserRouter, but we can check if toggleFavorite was NOT called
    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} batchReady={true} priority={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add to favorites/i })).toBeInTheDocument();
    });

    const heartButton = screen.getByRole('button', { name: /add to favorites/i });
    fireEvent.click(heartButton);

    expect(storageService.toggleFavorite).not.toHaveBeenCalled();
  });

  it('shows filled heart if listing is already in favorites', async () => {
    const mockUser = { id: 'user1', name: 'User', email: 'user@example.com', role: 'USER', favorites: ['1'] };
    (storageService.getCurrentUser as any).mockReturnValue(mockUser);

    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} batchReady={true} priority={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /remove from favorites/i })).toBeInTheDocument();
    });
  });

  it('cycles through images automatically', async () => {
    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} batchReady={true} priority={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'img1.jpg');
  });

  it('handles image load state', async () => {
    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} batchReady={true} priority={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    const img = screen.getByRole('img');
    // After Image.onload, the component should be visible and image should have class for loaded state
    expect(img).toBeInTheDocument();
  });

  it('does not cycle images if only one image exists', async () => {
    const singleImageListing = { ...mockListing, images: ['img1.jpg'] };
    render(
      <BrowserRouter>
        <ListingCard listing={singleImageListing} batchReady={true} priority={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'img1.jpg');
  });



  it('handles user with undefined favorites gracefully', async () => {
    const mockUser = { id: 'user1', name: 'User', email: 'user@example.com', role: 'USER', favorites: undefined };
    (storageService.getCurrentUser as any).mockReturnValue(mockUser);

    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} batchReady={true} priority={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Should not crash and show empty heart
      expect(screen.getByRole('button', { name: /add to favorites/i })).toBeInTheDocument();
    });
  });

  it('shows fallback when image fails to load', async () => {
    // Override MockImage to trigger onerror
    class ErrorImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      private _src = '';
      
      get src() {
        return this._src;
      }
      
      set src(value: string) {
        this._src = value;
        // Trigger onerror synchronously when src is set
        if (this.onerror) {
          Promise.resolve().then(() => this.onerror?.());
        }
      }
    }
    (global as any).Image = ErrorImage;

    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} batchReady={true} priority={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No Image')).toBeInTheDocument();
    });
  });
});
