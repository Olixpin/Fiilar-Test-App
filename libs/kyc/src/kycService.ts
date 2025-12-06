import { User, KYCStatus, Role, Listing, ListingStatus } from '@fiilar/types';

export const STORAGE_KEYS = {
    USERS_DB: 'fiilar_users',
    USER: 'fiilar_user',
    LISTINGS: 'fiilar_listings',
};

// Development/Simulation mode flag - set to true to bypass security for testing
// In production, Dojah integration would handle verification
const SIMULATION_MODE = true;

// Helper to get users (duplicated from storage for now to avoid circular deps, or we could pass it in)
// Ideally, we should have a user service, but for now we'll read from local storage directly
const getUsers = (): User[] => {
    const u = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    return u ? JSON.parse(u) : [];
};

const saveUsers = (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
};

const getListings = (): Listing[] => {
    const l = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    return l ? JSON.parse(l) : [];
};

const saveListings = (listings: Listing[]) => {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
};

const getCurrentUser = (): User | null => {
    const u = localStorage.getItem(STORAGE_KEYS.USER);
    return u ? JSON.parse(u) : null;
};

/**
 * Update KYC status for a user
 * SECURITY: Only admins can update KYC status, or users can submit their own documents
 * SIMULATION_MODE: Bypasses security for development/testing (simulates Dojah auto-approval)
 */
export const updateKYC = (userId: string, status: KYCStatus, documentUrl?: string): { success: boolean; error?: string } => {
    const currentUser = getCurrentUser();
    
    // SECURITY CHECK
    if (!currentUser) {
        console.error('🚨 SECURITY: Unauthenticated KYC update attempt');
        return { success: false, error: 'Not authenticated' };
    }
    
    // Users can only update their own KYC (submit documents)
    // Admins can update any user's KYC status (approve/reject)
    const isOwnKyc = currentUser.id === userId;
    const isAdmin = currentUser.role === Role.ADMIN;
    
    // SIMULATION MODE: Allow self-approval to simulate Dojah verification
    // In production, this would be handled by Dojah webhook callback
    if (!SIMULATION_MODE) {
        // If user is updating their own status, they can only submit (set to pending)
        if (isOwnKyc && status !== 'pending') {
            console.error('🚨 SECURITY: User tried to self-approve KYC');
            return { success: false, error: 'Cannot self-approve KYC' };
        }
        
        // Non-admins can't update other users' KYC
        if (!isOwnKyc && !isAdmin) {
            console.error('🚨 SECURITY: Unauthorized KYC update attempt', {
                attemptedBy: currentUser.id,
                targetUser: userId
            });
            return { success: false, error: 'Not authorized to update this user\'s KYC' };
        }
    } else {
        // In simulation mode, only allow users to verify themselves (not others)
        if (!isOwnKyc && !isAdmin) {
            console.error('🚨 SECURITY: Cannot update other user KYC even in simulation mode');
            return { success: false, error: 'Not authorized to update this user\'s KYC' };
        }
        console.log('🔧 SIMULATION MODE: Auto-approving KYC for user', userId);
    }

    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) {
        users[idx].kycStatus = status;
        users[idx].kycVerified = status === 'verified'; // Sync legacy boolean
        if (documentUrl) {
            users[idx].kycDocument = documentUrl;
            users[idx].identityDocument = documentUrl; // Sync legacy field
        }
        saveUsers(users);

        // When KYC is approved, update all PENDING_KYC listings to PENDING_APPROVAL
        if (status === 'verified') {
            const listings = getListings();
            let updatedCount = 0;
            const updatedListings = listings.map((listing: Listing) => {
                if (listing.hostId === userId && listing.status === ListingStatus.PENDING_KYC) {
                    updatedCount++;
                    return { ...listing, status: ListingStatus.PENDING_APPROVAL };
                }
                return listing;
            });
            if (updatedCount > 0) {
                saveListings(updatedListings);
                console.log(`✅ Updated ${updatedCount} listing(s) from PENDING_KYC to PENDING_APPROVAL for user ${userId}`);
            }
        }

        // Update current user session if it matches
        const sessionUser = localStorage.getItem('fiilar_user');
        if (sessionUser) {
            const parsed = JSON.parse(sessionUser);
            if (parsed.id === userId) {
                parsed.kycStatus = status;
                parsed.kycVerified = status === 'verified';
                if (documentUrl) {
                    parsed.kycDocument = documentUrl;
                    parsed.identityDocument = documentUrl;
                }
                localStorage.setItem('fiilar_user', JSON.stringify(parsed));
            }
        }

        // Dispatch event to notify admin of KYC update
        if (typeof window !== 'undefined') {
            const action = status === 'pending' ? 'kyc-submitted' : 'kyc-' + status;
            window.dispatchEvent(new CustomEvent('fiilar:user-updated', { 
                detail: { 
                    user: users[idx],
                    action
                } 
            }));
        }

        return { success: true };
    }
    return { success: false, error: 'User not found' };
};

/**
 * Update liveness verification status
 * SECURITY: Only admins can verify liveness, users can trigger the check
 * SIMULATION_MODE: Bypasses security for development/testing
 */
export const updateLiveness = (userId: string, isVerified: boolean): { success: boolean; error?: string } => {
    const currentUser = getCurrentUser();
    
    // SECURITY CHECK
    if (!currentUser) {
        console.error('🚨 SECURITY: Unauthenticated liveness update attempt');
        return { success: false, error: 'Not authenticated' };
    }
    
    const isOwnCheck = currentUser.id === userId;
    const isAdmin = currentUser.role === Role.ADMIN;
    
    // SIMULATION MODE: Allow self-verification to simulate Dojah liveness check
    if (!SIMULATION_MODE) {
        // Users cannot self-verify liveness
        if (isOwnCheck && isVerified) {
            console.error('🚨 SECURITY: User tried to self-verify liveness');
            return { success: false, error: 'Cannot self-verify liveness' };
        }
        
        // Non-admins can't verify other users' liveness
        if (!isOwnCheck && !isAdmin) {
            console.error('🚨 SECURITY: Unauthorized liveness update attempt', {
                attemptedBy: currentUser.id,
                targetUser: userId
            });
            return { success: false, error: 'Not authorized to update this user\'s liveness' };
        }
    } else {
        // In simulation mode, only allow users to verify themselves (not others)
        if (!isOwnCheck && !isAdmin) {
            console.error('🚨 SECURITY: Cannot update other user liveness even in simulation mode');
            return { success: false, error: 'Not authorized to update this user\'s liveness' };
        }
        console.log('🔧 SIMULATION MODE: Auto-approving liveness for user', userId);
    }

    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) {
        users[idx].livenessVerified = isVerified;
        saveUsers(users);

        // Update current user session if it matches
        const sessionUser = localStorage.getItem('fiilar_user');
        if (sessionUser) {
            const parsed = JSON.parse(sessionUser);
            if (parsed.id === userId) {
                parsed.livenessVerified = isVerified;
                localStorage.setItem('fiilar_user', JSON.stringify(parsed));
            }
        }
        return { success: true };
    }
    return { success: false, error: 'User not found' };
};
