import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ListingCard from '../../features/Listings/components/ListingCard';
import { Listing, BookingType, ListingStatus } from '@fiilar/types';
import { BrowserRouter } from 'react-router-dom';
import * as storageService from '../../services/storage';

// Mock storage service
vi.mock('../../services/storage', () => ({
  getCurrentUser: vi.fn(),
  toggleFavorite: vi.fn(),
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
  status: ListingStatus.PUBLISHED,
  amenities: [],
  category: 'Studio',
  type: 'Studio',
  requiresIdentityVerification: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  rating: 4.9,
  reviewsCount: 10
};

describe('ListingCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders listing details correctly', () => {
    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Listing')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('/ hour')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'img1.jpg');
  });

  it('shows ID REQ badge when requiresIdentityVerification is true', () => {
    const listingWithIdReq = { ...mockListing, requiresIdentityVerification: true };
    render(
      <BrowserRouter>
        <ListingCard listing={listingWithIdReq} />
      </BrowserRouter>
    );

    expect(screen.getByText('ID REQ')).toBeInTheDocument();
  });

  it('toggles favorite status when heart icon is clicked', () => {
    const mockUser = { id: 'user1', name: 'User', email: 'user@example.com', role: 'USER', favorites: [] };
    (storageService.getCurrentUser as any).mockReturnValue(mockUser);
    (storageService.toggleFavorite as any).mockReturnValue(['1']);

    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} />
      </BrowserRouter>
    );

    const heartButton = screen.getByRole('button', { name: /add to favorites/i });
    fireEvent.click(heartButton);

    expect(storageService.toggleFavorite).toHaveBeenCalledWith('user1', '1');
  });

  it('redirects to login if user is not logged in when clicking favorite', () => {
    (storageService.getCurrentUser as any).mockReturnValue(null);
    
    // We can't easily test navigation with BrowserRouter, but we can check if toggleFavorite was NOT called
    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} />
      </BrowserRouter>
    );

    const heartButton = screen.getByRole('button', { name: /add to favorites/i });
    fireEvent.click(heartButton);

    expect(storageService.toggleFavorite).not.toHaveBeenCalled();
  });

  it('shows filled heart if listing is already in favorites', () => {
    const mockUser = { id: 'user1', name: 'User', email: 'user@example.com', role: 'USER', favorites: ['1'] };
    (storageService.getCurrentUser as any).mockReturnValue(mockUser);

    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /remove from favorites/i })).toBeInTheDocument();
  });

  it('cycles through images automatically', () => {
    vi.useFakeTimers();
    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} />
      </BrowserRouter>
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'img1.jpg');

    // Advance time by 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    // Should show second image
    expect(img).toHaveAttribute('src', 'img2.jpg');

    // Advance time by another 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    // Should loop back to first image
    expect(img).toHaveAttribute('src', 'img1.jpg');

    vi.useRealTimers();
  });

  it('handles image load state', () => {
    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} />
      </BrowserRouter>
    );

    const img = screen.getByRole('img');
    // Initially opacity-0 (not loaded)
    expect(img).toHaveClass('opacity-0');

    // Simulate load
    fireEvent.load(img);

    // Should be opacity-100
    expect(img).toHaveClass('opacity-100');
  });

  it('does not cycle images if only one image exists', () => {
    vi.useFakeTimers();
    const singleImageListing = { ...mockListing, images: ['img1.jpg'] };
    render(
      <BrowserRouter>
        <ListingCard listing={singleImageListing} />
      </BrowserRouter>
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'img1.jpg');

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Should still be first image
    expect(img).toHaveAttribute('src', 'img1.jpg');
    vi.useRealTimers();
  });

  it('does not render type badge if type is missing', () => {
    const noTypeListing = { ...mockListing, type: undefined };
    render(
      <BrowserRouter>
        <ListingCard listing={noTypeListing} />
      </BrowserRouter>
    );

    expect(screen.queryByText('Studio')).not.toBeInTheDocument();
  });

  it('handles user with undefined favorites gracefully', () => {
    const mockUser = { id: 'user1', name: 'User', email: 'user@example.com', role: 'USER', favorites: undefined };
    (storageService.getCurrentUser as any).mockReturnValue(mockUser);

    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} />
      </BrowserRouter>
    );

    // Should not crash and show empty heart
    expect(screen.getByRole('button', { name: /add to favorites/i })).toBeInTheDocument();
  });

  it('shows fallback when image fails to load', () => {
    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} />
      </BrowserRouter>
    );

    const img = screen.getByRole('img');
    fireEvent.error(img);

    expect(screen.getByText('No Image')).toBeInTheDocument();
  });
});
