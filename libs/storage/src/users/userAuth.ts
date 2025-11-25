import { User, Role } from '@fiilar/types';
import { STORAGE_KEYS } from '../constants';
import { db } from '../mockDb';
import { generateVerificationToken, getTokenExpiry, sendVerificationEmail } from '../emailService';

/**
 * Login a user with the specified role and provider
 * Creates a new user if one doesn't exist
 */
export const loginUser = (role: Role, provider: 'email' | 'google' | 'phone' = 'email'): User => {
    // Standardize IDs to ensure persistence across logins for the demo
    let userId = '';
    let name = '';
    let email = '';

    switch (role) {
        case Role.HOST: userId = 'host_123'; name = 'Jane Host'; email = 'jane@example.com'; break;
        case Role.USER: userId = 'user_123'; name = 'John User'; email = 'john@example.com'; break;
        case Role.ADMIN: userId = 'admin_001'; name = 'Super Admin'; email = 'admin@fiilar.com'; break;
    }

    // Ensure host2 exists for the mock listing
    if (!db.users.findById('host2')) {
        const host2: User = {
            id: 'host2',
            name: 'Sarah Chen',
            email: 'sarah@example.com',
            password: 'password',
            role: Role.HOST,
            isHost: true,
            createdAt: new Date().toISOString(),
            kycVerified: true,
            walletBalance: 0,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            favorites: [],
            authProvider: 'email',
            emailVerified: true,
            phoneVerified: true
        };
        db.users.create(host2);
    }

    let user = db.users.findById(userId);

    if (!user) {
        const token = generateVerificationToken();
        const isGoogle = provider === 'google';

        user = {
            id: userId,
            name: name,
            email: email,
            password: 'password', // Mock password
            role: role,
            isHost: role === Role.HOST,
            createdAt: new Date().toISOString(),
            kycVerified: role === Role.ADMIN, // Admin verified by default
            walletBalance: role === Role.HOST ? 1250.00 : 0,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
            favorites: [],
            authProvider: provider,
            // Google is auto-verified. Admin is auto-verified.
            emailVerified: role === Role.ADMIN || isGoogle,
            phoneVerified: provider === 'phone',
            verificationToken: (role !== Role.ADMIN && !isGoogle) ? token : undefined,
            verificationTokenExpiry: (role !== Role.ADMIN && !isGoogle) ? getTokenExpiry() : undefined
        };

        db.users.create(user);

        // Send verification email for new non-admin users who didn't use Google
        if (role !== Role.ADMIN && !isGoogle && provider === 'email') {
            sendVerificationEmail(email, token, name);
        }
    } else {
        // User exists, update verification if using trusted provider
        let updated = false;
        const updates: Partial<User> = {};

        if (provider === 'google' && !user.emailVerified) {
            updates.emailVerified = true;
            updated = true;
        }
        if (provider === 'phone' && !user.phoneVerified) {
            updates.phoneVerified = true;
            updated = true;
        }

        if (updated) {
            db.users.update(user.id, updates);
            user = { ...user, ...updates };
        }
    }

    // Set as active session
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
};

/**
 * Logout the current user
 */
export const logoutUser = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
};
