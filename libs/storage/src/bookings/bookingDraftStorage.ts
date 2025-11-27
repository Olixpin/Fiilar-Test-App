/**
 * Booking Draft Storage
 * 
 * Saves and restores incomplete booking sessions for users.
 * Allows users to resume a booking they started but didn't complete.
 */

export interface BookingDraft {
  listingId: string;
  userId: string;
  selectedDate: string;
  selectedHours: number[];
  selectedDays: number; // For daily/nightly bookings
  guestCount: number;
  selectedAddOns: string[];
  isRecurring: boolean;
  recurrenceFreq: 'DAILY' | 'WEEKLY';
  recurrenceCount: number;
  agreedToTerms: boolean;
  savedAt: number; // timestamp
  listingTitle?: string; // for display purposes
  listingImage?: string; // thumbnail for display
}

const DRAFT_KEY_PREFIX = 'fiilar_booking_draft_';
const DRAFT_EXPIRY_DAYS = 7;
const MAX_DRAFTS_PER_USER = 10;

/**
 * Get the storage key for a specific user-listing draft
 */
const getDraftKey = (userId: string, listingId: string): string => {
  return `${DRAFT_KEY_PREFIX}${userId}_${listingId}`;
};

/**
 * Get all draft keys for a user
 */
const getUserDraftKeys = (userId: string): string[] => {
  const keys: string[] = [];
  const prefix = `${DRAFT_KEY_PREFIX}${userId}_`;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keys.push(key);
    }
  }
  
  return keys;
};

/**
 * Check if a draft has expired
 */
const isDraftExpired = (draft: BookingDraft): boolean => {
  const expiryTime = draft.savedAt + (DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  return Date.now() > expiryTime;
};

/**
 * Save a booking draft
 */
export const saveBookingDraft = (draft: Omit<BookingDraft, 'savedAt'>): boolean => {
  try {
    const key = getDraftKey(draft.userId, draft.listingId);
    const draftWithTimestamp: BookingDraft = {
      ...draft,
      savedAt: Date.now()
    };
    
    localStorage.setItem(key, JSON.stringify(draftWithTimestamp));
    
    // Clean up old drafts to prevent storage bloat
    cleanupUserDrafts(draft.userId);
    
    return true;
  } catch (error) {
    console.warn('Failed to save booking draft:', error);
    return false;
  }
};

/**
 * Get a booking draft for a specific listing
 */
export const getBookingDraft = (userId: string, listingId: string): BookingDraft | null => {
  try {
    const key = getDraftKey(userId, listingId);
    const data = localStorage.getItem(key);
    
    if (!data) return null;
    
    const draft: BookingDraft = JSON.parse(data);
    
    // Check if draft has expired
    if (isDraftExpired(draft)) {
      localStorage.removeItem(key);
      return null;
    }
    
    return draft;
  } catch (error) {
    console.warn('Failed to get booking draft:', error);
    return null;
  }
};

/**
 * Dispatch event to notify components that drafts have been updated
 */
const dispatchDraftsUpdatedEvent = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fiilar:drafts-updated'));
  }
};

/**
 * Delete a booking draft
 */
export const deleteBookingDraft = (userId: string, listingId: string): void => {
  try {
    const key = getDraftKey(userId, listingId);
    localStorage.removeItem(key);
    dispatchDraftsUpdatedEvent();
  } catch (error) {
    console.warn('Failed to delete booking draft:', error);
  }
};

/**
 * Get all booking drafts for a user
 */
export const getAllUserBookingDrafts = (userId: string): BookingDraft[] => {
  try {
    const keys = getUserDraftKeys(userId);
    const drafts: BookingDraft[] = [];
    
    for (const key of keys) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const draft: BookingDraft = JSON.parse(data);
          
          // Skip expired drafts
          if (!isDraftExpired(draft)) {
            drafts.push(draft);
          } else {
            // Clean up expired draft
            localStorage.removeItem(key);
          }
        } catch {
          // Invalid data, remove it
          localStorage.removeItem(key);
        }
      }
    }
    
    // Sort by most recent first
    return drafts.sort((a, b) => b.savedAt - a.savedAt);
  } catch (error) {
    console.warn('Failed to get user booking drafts:', error);
    return [];
  }
};

/**
 * Check if a user has a draft for a specific listing
 */
export const hasBookingDraft = (userId: string, listingId: string): boolean => {
  return getBookingDraft(userId, listingId) !== null;
};

/**
 * Get the count of drafts a user has
 */
export const getUserDraftCount = (userId: string): number => {
  return getAllUserBookingDrafts(userId).length;
};

/**
 * Clean up old/expired drafts for a user
 */
export const cleanupUserDrafts = (userId: string): void => {
  try {
    const drafts = getAllUserBookingDrafts(userId); // This already removes expired ones
    
    // If user has too many drafts, remove the oldest ones
    if (drafts.length > MAX_DRAFTS_PER_USER) {
      const draftsToRemove = drafts.slice(MAX_DRAFTS_PER_USER);
      for (const draft of draftsToRemove) {
        deleteBookingDraft(userId, draft.listingId);
      }
    }
  } catch (error) {
    console.warn('Failed to cleanup user drafts:', error);
  }
};

/**
 * Clear all booking drafts for a user (e.g., on logout)
 */
export const clearAllUserDrafts = (userId: string): void => {
  try {
    const keys = getUserDraftKeys(userId);
    for (const key of keys) {
      localStorage.removeItem(key);
    }
    dispatchDraftsUpdatedEvent();
  } catch (error) {
    console.warn('Failed to clear user drafts:', error);
  }
};

/**
 * Format the saved time for display (e.g., "2 hours ago", "Yesterday")
 */
export const formatDraftAge = (savedAt: number): string => {
  const now = Date.now();
  const diffMs = now - savedAt;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return new Date(savedAt).toLocaleDateString();
};
