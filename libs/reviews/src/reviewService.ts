import { Review, User, Booking, Role } from '@fiilar/types';

const STORAGE_KEYS = {
    REVIEWS: 'fiilar_reviews',
    USER: 'fiilar_user',
    BOOKINGS: 'fiilar_bookings',
};

// Helper to get data from localStorage
const getStorageData = <T>(key: string, defaultValue: T): T => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error reading from storage key "${key}":`, error);
        return defaultValue;
    }
};

// Helper to set data to localStorage
const setStorageData = <T>(key: string, data: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        // Dispatch a storage event to notify other tabs/components
        window.dispatchEvent(new Event('storage'));
    } catch (error) {
        console.error(`Error writing to storage key "${key}":`, error);
    }
};

const getCurrentUser = (): User | null => {
    return getStorageData<User | null>(STORAGE_KEYS.USER, null);
};

const getBookings = (): Booking[] => {
    return getStorageData<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
};

export const getReviews = (listingId?: string): Review[] => {
    const reviews = getStorageData<Review[]>(STORAGE_KEYS.REVIEWS, []);
    if (listingId) {
        return reviews.filter(r => r.listingId === listingId);
    }
    return reviews;
};

/**
 * Add a review for a listing
 * SECURITY: Users can only review listings they have completed bookings for
 */
export const addReview = (review: Omit<Review, 'id' | 'createdAt'>): { success: boolean; review?: Review; error?: string } => {
    const currentUser = getCurrentUser();

    // SECURITY CHECK: Must be authenticated
    if (!currentUser) {
        console.error('🚨 SECURITY: Unauthenticated review attempt');
        return { success: false, error: 'Not authenticated' };
    }

    // SECURITY CHECK: The review must be from the current user
    if (review.userId !== currentUser.id) {
        console.error('🚨 SECURITY: User tried to submit review as another user', {
            currentUserId: currentUser.id,
            reviewUserId: review.userId
        });
        return { success: false, error: 'Cannot submit review as another user' };
    }

    // SECURITY CHECK: User must have a completed booking for this listing
    // (Admins are exempt for testing purposes)
    if (currentUser.role !== Role.ADMIN) {
        const bookings = getBookings();
        const hasCompletedBooking = bookings.some(b =>
            b.userId === currentUser.id &&
            b.listingId === review.listingId &&
            (b.status === 'Completed' || b.handshakeStatus === 'VERIFIED')
        );

        if (!hasCompletedBooking) {
            console.error('🚨 SECURITY: User tried to review without completed booking', {
                userId: currentUser.id,
                listingId: review.listingId
            });
            return { success: false, error: 'You can only review listings you have completed bookings for' };
        }
    }

    // Check for duplicate reviews
    const existingReviews = getReviews(review.listingId);
    const alreadyReviewed = existingReviews.some(r => r.userId === currentUser.id);
    if (alreadyReviewed) {
        return { success: false, error: 'You have already reviewed this listing' };
    }

    const reviews = getReviews();
    const newReview: Review = {
        ...review,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
    };

    reviews.push(newReview);
    setStorageData(STORAGE_KEYS.REVIEWS, reviews);
    return { success: true, review: newReview };
};

export const getAverageRating = (listingId: string): number => {
    const reviews = getReviews(listingId);
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
};
