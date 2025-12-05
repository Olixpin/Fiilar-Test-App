import { Listing, SpaceType, BookingType, ListingStatus, CancellationPolicy } from '@fiilar/types';

/**
 * Utility to add mock listings with different badge variants to localStorage
 * Run this in the browser console: addBadgeVariantMocks()
 */
export const addBadgeVariantMocks = () => {
    const existingListings = JSON.parse(localStorage.getItem('fiilar_listings') || '[]');

    // Gold Badge Mock - Super Host Listing
    const goldListing: Listing = {
        id: 'gold-badge-demo-001',
        title: '⭐ Super Host - Luxury Penthouse',
        description: 'Premium listing from a verified Super Host. Stunning views, modern amenities, and exceptional service.',
        type: SpaceType.APARTMENT,
        price: 25000,
        priceUnit: BookingType.DAILY,
        location: 'Victoria Island, Lagos',
        images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        ],
        hostId: 'host-super-001',
        status: ListingStatus.LIVE,
        tags: ['Luxury', 'Penthouse', 'SuperHost'],
        maxGuests: 4,
        allowExtraGuests: true,
        extraGuestLimit: 2,
        extraGuestFee: 5000,
        // Legacy fields
        capacity: 4,
        includedGuests: 4,
        pricePerExtraGuest: 5000,
        amenities: [
            { name: 'WiFi', icon: 'wifi' },
            { name: 'Air Conditioning', icon: 'ac' },
            { name: 'Kitchen', icon: 'kitchen' },
            { name: 'Pool', icon: 'pool' },
            { name: 'Gym', icon: 'gym' },
            { name: 'Parking', icon: 'parking' }
        ],
        houseRules: ['No smoking', 'No pets', 'No parties'],
        cancellationPolicy: CancellationPolicy.MODERATE,
        requiresIdentityVerification: true,
        settings: {
            instantBook: true,
            allowRecurring: false,
            minDuration: 1
        },
        rating: 4.9,
        reviewCount: 127,
        // This listing should use badgeVariant="gold"
    };

    // Premium Badge Mock - VIP Listing
    const premiumListing: Listing = {
        id: 'premium-badge-demo-001',
        title: '💜 Premium VIP - Executive Suite',
        description: 'Exclusive premium listing with concierge service. Perfect for business executives and VIP guests.',
        type: SpaceType.APARTMENT,
        price: 35000,
        priceUnit: BookingType.DAILY,
        location: 'Ikoyi, Lagos',
        images: [
            'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        ],
        hostId: 'host-premium-001',
        status: ListingStatus.LIVE,
        tags: ['VIP', 'Executive', 'Premium'],
        maxGuests: 6,
        allowExtraGuests: true,
        extraGuestLimit: 3,
        extraGuestFee: 7500,
        // Legacy fields
        capacity: 6,
        includedGuests: 6,
        pricePerExtraGuest: 7500,
        amenities: [
            { name: 'WiFi', icon: 'wifi' },
            { name: 'Air Conditioning', icon: 'ac' },
            { name: 'Kitchen', icon: 'kitchen' },
            { name: 'Pool', icon: 'pool' },
            { name: 'Gym', icon: 'gym' },
            { name: 'Parking', icon: 'parking' },
            { name: 'Concierge', icon: 'concierge' },
            { name: 'Security', icon: 'security' }
        ],
        houseRules: ['No smoking', 'No pets'],
        cancellationPolicy: CancellationPolicy.FLEXIBLE,
        requiresIdentityVerification: true,
        settings: {
            instantBook: true,
            allowRecurring: false,
            minDuration: 1
        },
        rating: 5.0,
        reviewCount: 89,
        // This listing should use badgeVariant="premium"
    };

    // Add to existing listings
    const updatedListings = [...existingListings, goldListing, premiumListing];
    localStorage.setItem('fiilar_listings', JSON.stringify(updatedListings));

    console.log('✅ Added 2 badge variant mock listings:');
    console.log('🟡 Gold Badge:', goldListing.title);
    console.log('🟣 Premium Badge:', premiumListing.title);
    console.log('\nTo use these with badge variants, update the component:');
    console.log('<ListingCard listing={listing} badgeVariant={listing.id.includes("gold") ? "gold" : listing.id.includes("premium") ? "premium" : "white"} />');

    return { goldListing, premiumListing };
};

// Make it available globally for console use
if (typeof window !== 'undefined') {
    (window as any).addBadgeVariantMocks = addBadgeVariantMocks;
}
