import { User, Role } from '@fiilar/types';
import { safeJSONParse } from '@fiilar/utils';
import { STORAGE_KEYS } from '../constants';
import { db } from '../mockDb';
import { generateVerificationToken, getTokenExpiry, sendVerificationEmail } from '../emailService';
import {
    createSession,
    invalidateSession,
    validateSession,
    logAuditEvent
} from '../security/authSecurity';
import { DEMO_CONFIG } from '../config/appConfig';

// Session storage key
const SESSION_KEY = 'fiilar_current_session';

/**
 * Get current session ID
 */
export const getCurrentSessionId = (): string | null => {
    return localStorage.getItem(SESSION_KEY);
};

/**
 * Validate current session and return user if valid
 */
export const validateCurrentSession = (): { valid: boolean; user?: User; reason?: string } => {
    const sessionId = getCurrentSessionId();
    if (!sessionId) {
        return { valid: false, reason: 'No session' };
    }

    const sessionResult = validateSession(sessionId);
    if (!sessionResult.valid || !sessionResult.session) {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(STORAGE_KEYS.USER);
        return { valid: false, reason: sessionResult.reason };
    }

    const user = db.users.findById(sessionResult.session.userId);
    if (!user) {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(STORAGE_KEYS.USER);
        return { valid: false, reason: 'User not found' };
    }

    return { valid: true, user };
};

import { isAdminEmail } from '../config/appConfig';

// isAdminEmail is now imported from centralized config

/**
 * Login a user with the specified role and provider
 * Creates a new user if one doesn't exist
 * 
 * SECURITY: Now creates a proper session with expiry
 * Admin access is granted only through verified admin emails
 */
export const loginUser = (
    role: Role,
    provider: 'email' | 'google' | 'phone' = 'email',
    identifier?: string, // Email or Phone
    profileData?: { firstName?: string; lastName?: string; avatar?: string }
): User => {
    console.log('🔵 loginUser called with:', { role, provider, identifier, hasProfileData: !!profileData });

    // SECURITY: Auto-detect admin role from admin email domain
    let effectiveRole = role;
    if (identifier && (provider === 'email' || provider === 'google') && isAdminEmail(identifier)) {
        console.log('🔐 Admin email detected, setting admin role');
        effectiveRole = Role.ADMIN;
    }

    // 1. Try to find existing user by identifier (if provided)
    if (identifier) {
        const users = db.users.findAll();
        const existingUser = users.find(u =>
            ((provider === 'email' || provider === 'google') && u.email === identifier) ||
            (provider === 'phone' && u.phone === identifier)
        );

        if (existingUser) {
            console.log('🟢 Found existing user:', { existingRole: existingUser.role, newRole: effectiveRole });

            // Update role if different (e.g., user becoming a host or admin email detected)
            const updates: Partial<User> = {};
            if (existingUser.role !== effectiveRole) {
                console.log('🔄 Updating user role from', existingUser.role, 'to', effectiveRole);
                updates.role = effectiveRole;
                updates.isHost = effectiveRole === Role.HOST;
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

                // SECURITY: Create proper session
                const session = createSession(updatedUser.id);
                localStorage.setItem(SESSION_KEY, session.id);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

                logAuditEvent({
                    action: 'LOGIN',
                    userId: updatedUser.id,
                    identifier: identifier,
                    success: true,
                    metadata: { provider, role: effectiveRole, existing: true }
                });

                return updatedUser;
            }

            // SECURITY: Create proper session
            const session = createSession(existingUser.id);
            localStorage.setItem(SESSION_KEY, session.id);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(existingUser));

            logAuditEvent({
                action: 'LOGIN',
                userId: existingUser.id,
                identifier: identifier,
                success: true,
                metadata: { provider, role: effectiveRole, existing: true }
            });

            return existingUser;
        }
    }

    // 2. If no identifier provided, use legacy demo accounts (Fallback)
    // SECURITY: Admin bypass has been removed - admins must authenticate via email
    let userId = '';
    let name = '';
    let email = '';
    let phone = '';

    if (!identifier) {
        switch (role) {
            case Role.HOST: userId = DEMO_CONFIG.MOCK_HOST_ID; name = 'Jane Host'; email = DEMO_CONFIG.DEMO_EMAILS.HOST; break;
            case Role.USER: userId = DEMO_CONFIG.MOCK_USER_ID; name = 'John User'; email = DEMO_CONFIG.DEMO_EMAILS.USER; break;
            case Role.ADMIN:
                // SECURITY: Admin must authenticate with proper credentials
                // Logging attempted admin bypass
                logAuditEvent({
                    action: 'ADMIN_BYPASS_ATTEMPT',
                    userId: 'unknown',
                    success: false,
                    metadata: { reason: 'Admin login attempted without credentials' }
                });
                throw new Error('Admin authentication requires email verification. Please use admin@fiilar.com.');
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
            role: effectiveRole,
            isHost: effectiveRole === Role.HOST,
            createdAt: new Date().toISOString(),
            kycVerified: effectiveRole === Role.ADMIN, // Admin verified by default
            walletBalance: effectiveRole === Role.HOST ? 0 : 0, // Start with 0 balance
            avatar: profileData?.avatar || (name ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}` : undefined),
            favorites: [],
            authProvider: provider,
            // Google is auto-verified. Admin is auto-verified.
            emailVerified: effectiveRole === Role.ADMIN || isGoogle || provider === 'email', // Assume verified if logging in via email (OTP passed)
            phoneVerified: provider === 'phone', // Assume verified if logging in via phone
            verificationToken: (effectiveRole !== Role.ADMIN && !isGoogle) ? token : undefined,
            verificationTokenExpiry: (effectiveRole !== Role.ADMIN && !isGoogle) ? getTokenExpiry() : undefined
        };

        db.users.create(user);

        // Send verification email for new non-admin users who didn't use Google
        if (effectiveRole !== Role.ADMIN && !isGoogle && provider === 'email' && !user.emailVerified) {
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

    // SECURITY: Create proper session with expiry
    const session = createSession(user.id);
    localStorage.setItem(SESSION_KEY, session.id);

    // Set as active session
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    // Log successful login
    logAuditEvent({
        action: 'LOGIN',
        userId: user.id,
        identifier: identifier || email,
        success: true,
        metadata: { provider, role: effectiveRole }
    });

    return user as User;
};

/**
 * Logout the current user
 * SECURITY: Properly invalidates session
 */
export const logoutUser = () => {
    const sessionId = getCurrentSessionId();
    const user = safeJSONParse<User | null>(localStorage.getItem(STORAGE_KEYS.USER), null);

    if (sessionId) {
        invalidateSession(sessionId);
        localStorage.removeItem(SESSION_KEY);
    }

    localStorage.removeItem(STORAGE_KEYS.USER);

    // Log logout
    if (user) {
        logAuditEvent({
            action: 'LOGOUT',
            userId: user.id,
            success: true
        });
    }
};
