import { User, KYCStatus } from '@fiilar/types';

export const STORAGE_KEYS = {
    USERS_DB: 'fiilar_users',
};

// Helper to get users (duplicated from storage for now to avoid circular deps, or we could pass it in)
// Ideally, we should have a user service, but for now we'll read from local storage directly
const getUsers = (): User[] => {
    const u = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    return u ? JSON.parse(u) : [];
};

const saveUsers = (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
};

export const updateKYC = (userId: string, status: KYCStatus, documentUrl?: string) => {
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

        // Update current user session if it matches
        const currentUser = localStorage.getItem('fiilar_user');
        if (currentUser) {
            const parsed = JSON.parse(currentUser);
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
    }
};

export const updateLiveness = (userId: string, isVerified: boolean) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) {
        users[idx].livenessVerified = isVerified;
        saveUsers(users);

        // Update current user session if it matches
        const currentUser = localStorage.getItem('fiilar_user');
        if (currentUser) {
            const parsed = JSON.parse(currentUser);
            if (parsed.id === userId) {
                parsed.livenessVerified = isVerified;
                localStorage.setItem('fiilar_user', JSON.stringify(parsed));
            }
        }
    }
};
