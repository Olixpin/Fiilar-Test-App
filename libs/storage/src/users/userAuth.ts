import { User, Role } from '@fiilar/types';
import { STORAGE_KEYS } from '../constants';
import { db } from '../mockDb';
import { generateVerificationToken, getTokenExpiry, sendVerificationEmail } from '../emailService';

/**
 * Login a user with the specified role and provider
 * Creates a new user if one doesn't exist
 */
/**
 * Login a user with the specified role and provider
 * Creates a new user if one doesn't exist
 */
export const loginUser = (
    role: Role,
    provider: 'email' | 'google' | 'phone' = 'email',
    identifier?: string, // Email or Phone
    profileData?: { firstName?: string; lastName?: string; avatar?: string }
): User => {
    console.log('🔵 loginUser called with:', { role, provider, identifier, hasProfileData: !!profileData });
    // 1. Try to find existing user by identifier (if provided)
    if (identifier) {
        const users = db.users.findAll();
        const existingUser = users.find(u =>
            ((provider === 'email' || provider === 'google') && u.email === identifier) ||
            (provider === 'phone' && u.phone === identifier)
        );

        if (existingUser) {
            console.log('🟢 Found existing user:', { existingRole: existingUser.role, newRole: role });

            // Update role if different (e.g., user becoming a host)
            const updates: Partial<User> = {};
            if (existingUser.role !== role) {
                console.log('🔄 Updating user role from', existingUser.role, 'to', role);
                updates.role = role;
                updates.isHost = role === Role.HOST;
            }

            // Update profile data if provided (e.g. Google login)
            if (profileData) {
                if (profileData.firstName) updates.firstName = profileData.firstName;
                if (profileData.lastName) updates.lastName = profileData.lastName;
                if (profileData.avatar) updates.avatar = profileData.avatar;

                // Auto-generate name if needed
                if (updates.firstName || updates.lastName) {
                    updates.name = `${updates.firstName || existingUser.firstName || ''} ${updates.lastName || existingUser.lastName || ''}`.trim();
                }
            }

            // Apply updates if any
            if (Object.keys(updates).length > 0) {
                db.users.update(existingUser.id, updates);
                const updatedUser = { ...existingUser, ...updates };
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
                return updatedUser;
            }

            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(existingUser));
            return existingUser;
        }
    }

    // 2. If no identifier provided, use legacy demo accounts (Fallback)
    let userId = '';
    let name = '';
    let email = '';
    let phone = '';

    if (!identifier) {
        switch (role) {
            case Role.HOST: userId = 'host_123'; name = 'Jane Host'; email = 'jane@example.com'; break;
            case Role.USER: userId = 'user_123'; name = 'John User'; email = 'john@example.com'; break;
            case Role.ADMIN: userId = 'admin_001'; name = 'Super Admin'; email = 'admin@fiilar.com'; break;
        }
    } else {
        // 3. Create NEW User (Dynamic)
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (provider === 'email' || provider === 'google') email = identifier;
        if (provider === 'phone') phone = identifier;
        // Name is intentionally LEFT BLANK for new sign-ups to trigger modal
        if (profileData?.firstName && profileData?.lastName) {
            name = `${profileData.firstName} ${profileData.lastName}`;
        }
    }

    // Ensure host2 exists for the mock listing (legacy support)
    if (!db.users.findById('host2')) {
        const host2: User = {
            id: 'host2',
            name: 'Sarah Chen',
            firstName: 'Sarah',
            lastName: 'Chen',
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

        console.log('DEBUG: Creating new user with name:', name);
        user = {
            id: userId,
            name: name, // Will be empty for new phone/email sign-ups
            firstName: profileData?.firstName,
            lastName: profileData?.lastName,
            email: email,
            phone: phone,
            password: provider === 'email' ? 'password' : undefined, // Only set password for email users (mock)
            role: role,
            isHost: role === Role.HOST,
            createdAt: new Date().toISOString(),
            kycVerified: role === Role.ADMIN, // Admin verified by default
            walletBalance: role === Role.HOST ? 0 : 0, // Start with 0 balance
            avatar: profileData?.avatar || (name ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}` : undefined),
            favorites: [],
            authProvider: provider,
            // Google is auto-verified. Admin is auto-verified.
            emailVerified: role === Role.ADMIN || isGoogle || provider === 'email', // Assume verified if logging in via email (OTP passed)
            phoneVerified: provider === 'phone', // Assume verified if logging in via phone
            verificationToken: (role !== Role.ADMIN && !isGoogle) ? token : undefined,
            verificationTokenExpiry: (role !== Role.ADMIN && !isGoogle) ? getTokenExpiry() : undefined
        };

        db.users.create(user);

        // Send verification email for new non-admin users who didn't use Google
        if (role !== Role.ADMIN && !isGoogle && provider === 'email' && !user.emailVerified) {
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

        // Update profile data if provided
        if (profileData) {
            if (profileData.firstName) updates.firstName = profileData.firstName;
            if (profileData.lastName) updates.lastName = profileData.lastName;
            if (profileData.avatar) updates.avatar = profileData.avatar;
            updated = true;
        }

        if (updated) {
            db.users.update(user.id, updates);
            user = { ...user, ...updates } as User;
        }
    }

    // Set as active session
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user as User;
};

/**
 * Logout the current user
 */
export const logoutUser = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
};
