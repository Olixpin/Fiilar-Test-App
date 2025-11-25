import { Review } from '@fiilar/types';

const STORAGE_KEYS = {
    REVIEWS: 'fiilar_reviews',
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

export const getReviews = (listingId?: string): Review[] => {
    const reviews = getStorageData<Review[]>(STORAGE_KEYS.REVIEWS, []);
    if (listingId) {
        return reviews.filter(r => r.listingId === listingId);
    }
    return reviews;
};

export const addReview = (review: Omit<Review, 'id' | 'createdAt'>): Review => {
    const reviews = getReviews();
    const newReview: Review = {
        ...review,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
    };

    reviews.push(newReview);
    setStorageData(STORAGE_KEYS.REVIEWS, reviews);
    return newReview;
};

export const getAverageRating = (listingId: string): number => {
    const reviews = getReviews(listingId);
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
};
