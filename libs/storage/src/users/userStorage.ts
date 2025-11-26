import { User } from '@fiilar/types';
import { STORAGE_KEYS } from '../constants';

/**
 * Get all users from the database
 */
export const getAllUsers = (): User[] => {
    const u = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    return u ? JSON.parse(u) : [];
};

/**
 * Get a user by ID
 */
export const getUserById = (id: string): User | undefined => {
    const users = getAllUsers();
    return users.find(u => u.id === id);
};

/**
 * Save a user to the database
 * Also syncs with current session if applicable
 */
export const saveUser = (user: User) => {
    const users = getAllUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
        users[idx] = user;
    } else {
        users.push(user);
    }
    console.log('Saving user to DB:', user);
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));

    // Sync with current session if applicable
    const currentUser = getCurrentUser();
    console.log('Current session user:', currentUser);
    if (currentUser && currentUser.id === user.id) {
        console.log('Updating session user storage');
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
        console.log('Session user not updated. Current:', currentUser?.id, 'Target:', user.id);
    }
};

/**
 * Get the currently logged-in user
 */
export const getCurrentUser = (): User | null => {
    const u = localStorage.getItem(STORAGE_KEYS.USER);
    return u ? JSON.parse(u) : null;
};

/**
 * Toggle a listing in user's favorites
 */
export const toggleFavorite = (userId: string, listingId: string): string[] => {
    console.log('Toggling favorite. User:', userId, 'Listing:', listingId);
    const users = getAllUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
        console.error('User not found in DB:', userId);
        return [];
    }

    const favorites = user.favorites || [];
    const idx = favorites.indexOf(listingId);

    let newFavorites;
    if (idx >= 0) {
        newFavorites = favorites.filter(id => id !== listingId);
    } else {
        newFavorites = [...favorites, listingId];
    }

    user.favorites = newFavorites;
    console.log('New favorites list:', newFavorites);
    saveUser(user);

    // Force update session storage to ensure immediate UI reflection
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        console.log('Force updating session user in toggleFavorite');
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    return newFavorites;
};

/**
 * Update a user's wallet balance
 */
export const updateUserWalletBalance = (userId: string, amount: number) => {
    const users = getAllUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
        user.walletBalance = (user.walletBalance || 0) + amount;
        saveUser(user);
    }
};

/**
 * Update a user's profile information
 */
export const updateUserProfile = (
    userId: string,
    updates: {
        firstName?: string;
        lastName?: string;
        avatar?: string;
        bio?: string;
        name?: string;
    }
): User | null => {
    const users = getAllUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
        console.error('User not found:', userId);
        return null;
    }

    // Apply updates
    const updatedUser = { ...user, ...updates };

    // Auto-generate full name if firstName/lastName provided
    if (updates.firstName || updates.lastName) {
        const firstName = updates.firstName || user.firstName || '';
        const lastName = updates.lastName || user.lastName || '';
        updatedUser.name = `${firstName} ${lastName}`.trim();
    }

    saveUser(updatedUser);
    return updatedUser;
};

