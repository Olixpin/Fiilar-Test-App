import { User, Role } from '@fiilar/types';
import { STORAGE_KEYS } from '../constants';
import { logAuditEvent } from '../security/authSecurity';

/**
 * Get all users from the database
 */
export const getAllUsers = (): User[] => {
    const u = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    try {
        return u ? JSON.parse(u) : [];
    } catch (error) {
        console.error('Failed to parse users DB, resetting:', error);
        return [];
    }
};

/**
 * Get a user by ID
 */
export const getUserById = (id: string): User | undefined => {
    const users = getAllUsers();
    return users.find(u => u.id === id);
};

/**
 * Get the currently logged-in user
 */
export const getCurrentUser = (): User | null => {
    const u = localStorage.getItem(STORAGE_KEYS.USER);
    try {
        return u ? JSON.parse(u) : null;
    } catch (error) {
        console.error('Failed to parse current user, resetting:', error);
        return null;
    }
};

/**
 * Internal function to save user without authorization check
 * Used by auth flows and internal operations
 */
const saveUserInternal = (user: User) => {
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
    if (currentUser && currentUser.id === user.id) {
        console.log('Updating session user storage');
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        // Dispatch event to notify app of user update
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('fiilar:user-updated', { detail: { user } }));
        }
    }
};

/**
 * Save a user to the database
 * SECURITY: Validates that the current user is authorized to modify the target user
 * Users can only modify themselves, admins can modify anyone
 */
export const saveUser = (user: User): { success: boolean; error?: string } => {
    const currentUser = getCurrentUser();

    // Allow if not logged in (during registration flow)
    if (!currentUser) {
        saveUserInternal(user);
        return { success: true };
    }

    // Users can modify their own profile
    if (currentUser.id === user.id) {
        saveUserInternal(user);
        return { success: true };
    }

    // Admins can modify any user
    if (currentUser.role === Role.ADMIN) {
        saveUserInternal(user);
        return { success: true };
    }

    // Unauthorized modification attempt
    logAuditEvent({
        action: 'SECURITY_VIOLATION',
        userId: currentUser.id,
        success: false,
        metadata: {
            type: 'UNAUTHORIZED_USER_MODIFICATION',
            targetUserId: user.id,
            attemptedBy: currentUser.id
        }
    });

    console.error('🚨 SECURITY: Unauthorized user modification attempt', {
        targetUserId: user.id,
        attemptedBy: currentUser.id
    });

    return { success: false, error: 'Not authorized to modify this user' };
};

/**
 * Toggle a listing in user's favorites
 * SECURITY: Users can only toggle favorites for themselves
 */
export const toggleFavorite = (userId: string, listingId: string): string[] => {
    console.log('Toggling favorite. User:', userId, 'Listing:', listingId);

    const currentUser = getCurrentUser();

    // SECURITY CHECK: User can only toggle their own favorites
    if (!currentUser || currentUser.id !== userId) {
        console.error('🚨 SECURITY: Unauthorized favorites toggle attempt', {
            targetUserId: userId,
            currentUserId: currentUser?.id
        });
        logAuditEvent({
            action: 'SECURITY_VIOLATION',
            userId: currentUser?.id,
            success: false,
            metadata: {
                type: 'UNAUTHORIZED_FAVORITES_TOGGLE',
                targetUserId: userId
            }
        });
        return currentUser?.favorites || [];
    }

    const favorites = currentUser.favorites || [];
    const idx = favorites.indexOf(listingId);

    let newFavorites;
    if (idx >= 0) {
        newFavorites = favorites.filter(id => id !== listingId);
    } else {
        newFavorites = [...favorites, listingId];
    }

    currentUser.favorites = newFavorites;
    console.log('New favorites list:', newFavorites);
    saveUserInternal(currentUser);

    return newFavorites;
};

/**
 * Update a user's wallet balance
 * SECURITY: Only admins or system operations can modify wallet balances
 * For regular user operations, use the payment service which validates transactions
 */
export const updateUserWalletBalance = (userId: string, amount: number, skipAuth: boolean = false): { success: boolean; error?: string } => {
    const currentUser = getCurrentUser();

    // Only admins can directly modify wallet balances
    // Regular users must go through payment service
    // skipAuth allows system operations (like refunds) to bypass this check
    if (!skipAuth && (!currentUser || currentUser.role !== Role.ADMIN)) {
        console.error('🚨 SECURITY: Unauthorized wallet balance modification attempt', {
            targetUserId: userId,
            amount,
            attemptedBy: currentUser?.id
        });
        logAuditEvent({
            action: 'SECURITY_VIOLATION',
            userId: currentUser?.id,
            success: false,
            metadata: {
                type: 'UNAUTHORIZED_WALLET_MODIFICATION',
                targetUserId: userId,
                amount
            }
        });
        return { success: false, error: 'Admin access required for direct wallet modifications' };
    }

    const users = getAllUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
        user.walletBalance = (user.walletBalance || 0) + amount;
        saveUserInternal(user);
        return { success: true };
    }
    return { success: false, error: 'User not found' };
};

/**
 * Update a user's profile information
 * SECURITY: Users can only update their own profile, admins can update any profile
 */
export const updateUserProfile = (
    userId: string,
    updates: {
        firstName?: string;
        lastName?: string;
        avatar?: string;
        bio?: string;
        name?: string;
        phone?: string;
    }
): { success: boolean; user?: User; error?: string } => {
    const currentUser = getCurrentUser();

    // SECURITY CHECK: User can only update their own profile (unless admin)
    if (!currentUser) {
        return { success: false, error: 'Not authenticated' };
    }

    if (currentUser.id !== userId && currentUser.role !== Role.ADMIN) {
        console.error('🚨 SECURITY: Unauthorized profile update attempt', {
            targetUserId: userId,
            attemptedBy: currentUser.id
        });
        logAuditEvent({
            action: 'SECURITY_VIOLATION',
            userId: currentUser.id,
            success: false,
            metadata: {
                type: 'UNAUTHORIZED_PROFILE_UPDATE',
                targetUserId: userId
            }
        });
        return { success: false, error: 'Not authorized to update this profile' };
    }

    const users = getAllUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
        console.error('User not found:', userId);
        return { success: false, error: 'User not found' };
    }

    // Apply updates
    const updatedUser = { ...user, ...updates };

    // Auto-generate full name if firstName/lastName provided
    if (updates.firstName || updates.lastName) {
        const firstName = updates.firstName || user.firstName || '';
        const lastName = updates.lastName || user.lastName || '';
        updatedUser.name = `${firstName} ${lastName}`.trim();
    }

    saveUserInternal(updatedUser);
    return { success: true, user: updatedUser };
};

