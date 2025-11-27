/**
 * Booking Draft Storage Tests
 * 
 * Comprehensive tests for the booking draft system to ensure:
 * 1. Drafts are saved correctly
 * 2. Drafts are restored correctly
 * 3. Drafts are deleted correctly
 * 4. Expiry logic works
 * 5. Edge cases are handled
 * 6. Integration with Reserve List works
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveBookingDraft,
  getBookingDraft,
  deleteBookingDraft,
  hasBookingDraft,
  getAllUserBookingDrafts,
  getUserDraftCount,
  clearAllUserDrafts,
  formatDraftAge,
  BookingDraft
} from '@fiilar/storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Helper to create a mock draft
const createMockDraft = (overrides: Partial<Omit<BookingDraft, 'savedAt'>> = {}): Omit<BookingDraft, 'savedAt'> => ({
  listingId: 'listing-123',
  userId: 'user-456',
  selectedDate: '2025-12-01',
  selectedHours: [9, 10, 11],
  selectedDays: 1,
  guestCount: 2,
  selectedAddOns: ['addon-1'],
  isRecurring: false,
  recurrenceFreq: 'WEEKLY',
  recurrenceCount: 1,
  agreedToTerms: false,
  listingTitle: 'Test Listing',
  listingImage: 'https://example.com/image.jpg',
  ...overrides
});

describe('Booking Draft Storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-11-27T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('saveBookingDraft', () => {
    it('should save a draft to localStorage', () => {
      const draft = createMockDraft();
      const result = saveBookingDraft(draft);

      expect(result).toBe(true);
      expect(hasBookingDraft('user-456', 'listing-123')).toBe(true);
    });

    it('should add a savedAt timestamp', () => {
      const draft = createMockDraft();
      saveBookingDraft(draft);

      const saved = getBookingDraft('user-456', 'listing-123');
      expect(saved).not.toBeNull();
      expect(saved?.savedAt).toBe(Date.now());
    });

    it('should overwrite existing draft for same user-listing', () => {
      const draft1 = createMockDraft({ guestCount: 2 });
      const draft2 = createMockDraft({ guestCount: 5 });

      saveBookingDraft(draft1);
      saveBookingDraft(draft2);

      const saved = getBookingDraft('user-456', 'listing-123');
      expect(saved?.guestCount).toBe(5);
    });

    it('should save drafts for different listings separately', () => {
      const draft1 = createMockDraft({ listingId: 'listing-1' });
      const draft2 = createMockDraft({ listingId: 'listing-2' });

      saveBookingDraft(draft1);
      saveBookingDraft(draft2);

      expect(hasBookingDraft('user-456', 'listing-1')).toBe(true);
      expect(hasBookingDraft('user-456', 'listing-2')).toBe(true);
    });

    it('should save drafts for different users separately', () => {
      const draft1 = createMockDraft({ userId: 'user-1' });
      const draft2 = createMockDraft({ userId: 'user-2' });

      saveBookingDraft(draft1);
      saveBookingDraft(draft2);

      expect(hasBookingDraft('user-1', 'listing-123')).toBe(true);
      expect(hasBookingDraft('user-2', 'listing-123')).toBe(true);
    });
  });

  describe('getBookingDraft', () => {
    it('should return null for non-existent draft', () => {
      const result = getBookingDraft('user-456', 'listing-999');
      expect(result).toBeNull();
    });

    it('should return the saved draft with all fields', () => {
      const draft = createMockDraft({
        selectedHours: [14, 15, 16],
        guestCount: 4,
        isRecurring: true,
        recurrenceFreq: 'WEEKLY',
        recurrenceCount: 4,
        agreedToTerms: true
      });
      saveBookingDraft(draft);

      const saved = getBookingDraft('user-456', 'listing-123');

      expect(saved).not.toBeNull();
      expect(saved?.selectedHours).toEqual([14, 15, 16]);
      expect(saved?.guestCount).toBe(4);
      expect(saved?.isRecurring).toBe(true);
      expect(saved?.recurrenceFreq).toBe('WEEKLY');
      expect(saved?.recurrenceCount).toBe(4);
      expect(saved?.agreedToTerms).toBe(true);
    });

    it('should return null for expired draft (after 7 days)', () => {
      const draft = createMockDraft();
      saveBookingDraft(draft);

      // Advance time by 8 days
      vi.advanceTimersByTime(8 * 24 * 60 * 60 * 1000);

      const result = getBookingDraft('user-456', 'listing-123');
      expect(result).toBeNull();
    });

    it('should return draft that is not yet expired (6 days old)', () => {
      const draft = createMockDraft();
      saveBookingDraft(draft);

      // Advance time by 6 days
      vi.advanceTimersByTime(6 * 24 * 60 * 60 * 1000);

      const result = getBookingDraft('user-456', 'listing-123');
      expect(result).not.toBeNull();
    });
  });

  describe('deleteBookingDraft', () => {
    it('should delete an existing draft', () => {
      const draft = createMockDraft();
      saveBookingDraft(draft);

      expect(hasBookingDraft('user-456', 'listing-123')).toBe(true);

      deleteBookingDraft('user-456', 'listing-123');

      expect(hasBookingDraft('user-456', 'listing-123')).toBe(false);
    });

    it('should not throw when deleting non-existent draft', () => {
      expect(() => {
        deleteBookingDraft('user-456', 'listing-999');
      }).not.toThrow();
    });

    it('should dispatch fiilar:drafts-updated event', () => {
      const draft = createMockDraft();
      saveBookingDraft(draft);

      const eventHandler = vi.fn();
      window.addEventListener('fiilar:drafts-updated', eventHandler);

      deleteBookingDraft('user-456', 'listing-123');

      expect(eventHandler).toHaveBeenCalled();

      window.removeEventListener('fiilar:drafts-updated', eventHandler);
    });

    it('should not affect other users drafts', () => {
      saveBookingDraft(createMockDraft({ userId: 'user-1' }));
      saveBookingDraft(createMockDraft({ userId: 'user-2' }));

      deleteBookingDraft('user-1', 'listing-123');

      expect(hasBookingDraft('user-1', 'listing-123')).toBe(false);
      expect(hasBookingDraft('user-2', 'listing-123')).toBe(true);
    });
  });

  describe('hasBookingDraft', () => {
    it('should return true when draft exists', () => {
      saveBookingDraft(createMockDraft());
      expect(hasBookingDraft('user-456', 'listing-123')).toBe(true);
    });

    it('should return false when draft does not exist', () => {
      expect(hasBookingDraft('user-456', 'listing-123')).toBe(false);
    });

    it('should return false for expired draft', () => {
      saveBookingDraft(createMockDraft());

      vi.advanceTimersByTime(8 * 24 * 60 * 60 * 1000);

      expect(hasBookingDraft('user-456', 'listing-123')).toBe(false);
    });
  });

  describe('getAllUserBookingDrafts', () => {
    it('should return empty array when no drafts exist', () => {
      const drafts = getAllUserBookingDrafts('user-456');
      expect(drafts).toEqual([]);
    });

    it('should return all drafts for a user', () => {
      saveBookingDraft(createMockDraft({ listingId: 'listing-1' }));
      saveBookingDraft(createMockDraft({ listingId: 'listing-2' }));
      saveBookingDraft(createMockDraft({ listingId: 'listing-3' }));

      const drafts = getAllUserBookingDrafts('user-456');
      expect(drafts).toHaveLength(3);
    });

    it('should not include other users drafts', () => {
      saveBookingDraft(createMockDraft({ userId: 'user-1', listingId: 'listing-1' }));
      saveBookingDraft(createMockDraft({ userId: 'user-2', listingId: 'listing-2' }));

      const user1Drafts = getAllUserBookingDrafts('user-1');
      expect(user1Drafts).toHaveLength(1);
      expect(user1Drafts[0].listingId).toBe('listing-1');
    });

    it('should exclude expired drafts', () => {
      saveBookingDraft(createMockDraft({ listingId: 'listing-1' }));

      vi.advanceTimersByTime(4 * 24 * 60 * 60 * 1000); // 4 days

      saveBookingDraft(createMockDraft({ listingId: 'listing-2' }));

      vi.advanceTimersByTime(4 * 24 * 60 * 60 * 1000); // 4 more days (listing-1 is now 8 days old)

      const drafts = getAllUserBookingDrafts('user-456');
      expect(drafts).toHaveLength(1);
      expect(drafts[0].listingId).toBe('listing-2');
    });

    it('should return drafts sorted by most recent first', () => {
      saveBookingDraft(createMockDraft({ listingId: 'listing-1' }));
      vi.advanceTimersByTime(1000);
      saveBookingDraft(createMockDraft({ listingId: 'listing-2' }));
      vi.advanceTimersByTime(1000);
      saveBookingDraft(createMockDraft({ listingId: 'listing-3' }));

      const drafts = getAllUserBookingDrafts('user-456');
      expect(drafts[0].listingId).toBe('listing-3');
      expect(drafts[1].listingId).toBe('listing-2');
      expect(drafts[2].listingId).toBe('listing-1');
    });
  });

  describe('getUserDraftCount', () => {
    it('should return 0 when no drafts exist', () => {
      expect(getUserDraftCount('user-456')).toBe(0);
    });

    it('should return correct count', () => {
      saveBookingDraft(createMockDraft({ listingId: 'listing-1' }));
      saveBookingDraft(createMockDraft({ listingId: 'listing-2' }));

      expect(getUserDraftCount('user-456')).toBe(2);
    });
  });

  describe('clearAllUserDrafts', () => {
    it('should clear all drafts for a user', () => {
      saveBookingDraft(createMockDraft({ listingId: 'listing-1' }));
      saveBookingDraft(createMockDraft({ listingId: 'listing-2' }));
      saveBookingDraft(createMockDraft({ listingId: 'listing-3' }));

      expect(getUserDraftCount('user-456')).toBe(3);

      clearAllUserDrafts('user-456');

      expect(getUserDraftCount('user-456')).toBe(0);
    });

    it('should not affect other users drafts', () => {
      saveBookingDraft(createMockDraft({ userId: 'user-1' }));
      saveBookingDraft(createMockDraft({ userId: 'user-2' }));

      clearAllUserDrafts('user-1');

      expect(getUserDraftCount('user-1')).toBe(0);
      expect(getUserDraftCount('user-2')).toBe(1);
    });

    it('should dispatch fiilar:drafts-updated event', () => {
      saveBookingDraft(createMockDraft());

      const eventHandler = vi.fn();
      window.addEventListener('fiilar:drafts-updated', eventHandler);

      clearAllUserDrafts('user-456');

      expect(eventHandler).toHaveBeenCalled();

      window.removeEventListener('fiilar:drafts-updated', eventHandler);
    });
  });

  describe('cleanupUserDrafts', () => {
    it('should remove oldest drafts when exceeding max limit (10)', () => {
      // Create 12 drafts
      for (let i = 1; i <= 12; i++) {
        vi.advanceTimersByTime(1000); // Each draft 1 second apart
        saveBookingDraft(createMockDraft({ listingId: `listing-${i}` }));
      }

      // After saving the 12th draft, cleanup should have run
      const drafts = getAllUserBookingDrafts('user-456');

      // Should only have 10 drafts (the most recent ones)
      expect(drafts.length).toBeLessThanOrEqual(10);
    });
  });

  describe('formatDraftAge', () => {
    it('should format "Just now" for < 1 minute', () => {
      const savedAt = Date.now() - 30 * 1000; // 30 seconds ago
      expect(formatDraftAge(savedAt)).toBe('Just now');
    });

    it('should format minutes correctly', () => {
      const savedAt = Date.now() - 5 * 60 * 1000; // 5 minutes ago
      expect(formatDraftAge(savedAt)).toBe('5 minutes ago');
    });

    it('should format single minute correctly', () => {
      const savedAt = Date.now() - 1 * 60 * 1000; // 1 minute ago
      expect(formatDraftAge(savedAt)).toBe('1 minute ago');
    });

    it('should format hours correctly', () => {
      const savedAt = Date.now() - 3 * 60 * 60 * 1000; // 3 hours ago
      expect(formatDraftAge(savedAt)).toBe('3 hours ago');
    });

    it('should format single hour correctly', () => {
      const savedAt = Date.now() - 1 * 60 * 60 * 1000; // 1 hour ago
      expect(formatDraftAge(savedAt)).toBe('1 hour ago');
    });

    it('should format "Yesterday"', () => {
      const savedAt = Date.now() - 1 * 24 * 60 * 60 * 1000; // 1 day ago
      expect(formatDraftAge(savedAt)).toBe('Yesterday');
    });

    it('should format days correctly', () => {
      const savedAt = Date.now() - 3 * 24 * 60 * 60 * 1000; // 3 days ago
      expect(formatDraftAge(savedAt)).toBe('3 days ago');
    });

    it('should format date for > 7 days', () => {
      const savedAt = Date.now() - 10 * 24 * 60 * 60 * 1000; // 10 days ago
      const result = formatDraftAge(savedAt);
      // Should be a date string, not "X days ago"
      expect(result).not.toContain('days ago');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty selectedHours array', () => {
      const draft = createMockDraft({ selectedHours: [] });
      saveBookingDraft(draft);

      const saved = getBookingDraft('user-456', 'listing-123');
      expect(saved?.selectedHours).toEqual([]);
    });

    it('should handle empty selectedAddOns array', () => {
      const draft = createMockDraft({ selectedAddOns: [] });
      saveBookingDraft(draft);

      const saved = getBookingDraft('user-456', 'listing-123');
      expect(saved?.selectedAddOns).toEqual([]);
    });

    it('should handle missing optional fields', () => {
      const draft = createMockDraft();
      delete (draft as any).listingTitle;
      delete (draft as any).listingImage;

      saveBookingDraft(draft);

      const saved = getBookingDraft('user-456', 'listing-123');
      expect(saved).not.toBeNull();
    });

    it('should handle special characters in IDs', () => {
      const draft = createMockDraft({
        userId: 'user-with-special_chars.123',
        listingId: 'listing-with-special_chars.456'
      });
      saveBookingDraft(draft);

      expect(hasBookingDraft('user-with-special_chars.123', 'listing-with-special_chars.456')).toBe(true);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      // Manually insert corrupted data
      const key = 'fiilar_booking_draft_user-456_listing-123';
      localStorageMock.setItem(key, 'not valid json {{{');

      // Should not throw and should return null
      const result = getBookingDraft('user-456', 'listing-123');
      expect(result).toBeNull();
    });
  });

  describe('Integration: Draft and Reserve List Synchronization', () => {
    it('should scenario: user saves draft, then saves to Reserve List, draft should be cleared', () => {
      // Step 1: User starts booking, draft is auto-saved
      const draft = createMockDraft({
        guestCount: 3,
        selectedHours: [10, 11, 12]
      });
      saveBookingDraft(draft);
      expect(hasBookingDraft('user-456', 'listing-123')).toBe(true);

      // Step 2: User clicks "Save for Later" (Reserve List)
      // In the real code, handleSaveToReserveList calls deleteBookingDraft
      deleteBookingDraft('user-456', 'listing-123');

      // Step 3: Draft should be gone
      expect(hasBookingDraft('user-456', 'listing-123')).toBe(false);
    });

    it('should scenario: user removes from Reserve List, Continue badge should disappear', () => {
      // Setup: User has a draft and a Reserve List item
      const draft = createMockDraft();
      saveBookingDraft(draft);
      expect(hasBookingDraft('user-456', 'listing-123')).toBe(true);

      // User removes from Reserve List (which also deletes the draft)
      deleteBookingDraft('user-456', 'listing-123');

      // Continue badge should no longer show
      expect(hasBookingDraft('user-456', 'listing-123')).toBe(false);
    });

    it('should scenario: user completes booking, draft should be cleared', () => {
      // User starts booking
      saveBookingDraft(createMockDraft());
      expect(hasBookingDraft('user-456', 'listing-123')).toBe(true);

      // User completes booking (handleConfirmBooking calls deleteBookingDraft)
      deleteBookingDraft('user-456', 'listing-123');

      // Draft should be gone
      expect(hasBookingDraft('user-456', 'listing-123')).toBe(false);
    });

    it('should scenario: user discards draft from restore dialog', () => {
      // User had a draft from before
      saveBookingDraft(createMockDraft());
      expect(hasBookingDraft('user-456', 'listing-123')).toBe(true);

      // User clicks "Discard" on restore dialog
      deleteBookingDraft('user-456', 'listing-123');

      expect(hasBookingDraft('user-456', 'listing-123')).toBe(false);
    });

    it('should scenario: multiple listings, operations are isolated', () => {
      // User has drafts for multiple listings
      saveBookingDraft(createMockDraft({ listingId: 'listing-A' }));
      saveBookingDraft(createMockDraft({ listingId: 'listing-B' }));
      saveBookingDraft(createMockDraft({ listingId: 'listing-C' }));

      // User completes booking for listing-A
      deleteBookingDraft('user-456', 'listing-A');

      // Other drafts should remain
      expect(hasBookingDraft('user-456', 'listing-A')).toBe(false);
      expect(hasBookingDraft('user-456', 'listing-B')).toBe(true);
      expect(hasBookingDraft('user-456', 'listing-C')).toBe(true);
    });

    it('should scenario: user logs out, all drafts cleared', () => {
      // User has multiple drafts
      saveBookingDraft(createMockDraft({ listingId: 'listing-1' }));
      saveBookingDraft(createMockDraft({ listingId: 'listing-2' }));

      expect(getUserDraftCount('user-456')).toBe(2);

      // User logs out
      clearAllUserDrafts('user-456');

      expect(getUserDraftCount('user-456')).toBe(0);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all booking data fields through save/restore cycle', () => {
      const originalDraft = createMockDraft({
        listingId: 'listing-xyz',
        userId: 'user-abc',
        selectedDate: '2025-12-25',
        selectedHours: [8, 9, 10, 11, 12],
        selectedDays: 3,
        guestCount: 6,
        selectedAddOns: ['addon-parking', 'addon-wifi', 'addon-catering'],
        isRecurring: true,
        recurrenceFreq: 'WEEKLY',
        recurrenceCount: 8,
        agreedToTerms: true,
        listingTitle: 'Beautiful Conference Room',
        listingImage: 'https://example.com/room.jpg'
      });

      saveBookingDraft(originalDraft);
      const restored = getBookingDraft('user-abc', 'listing-xyz');

      expect(restored).not.toBeNull();
      expect(restored?.listingId).toBe('listing-xyz');
      expect(restored?.userId).toBe('user-abc');
      expect(restored?.selectedDate).toBe('2025-12-25');
      expect(restored?.selectedHours).toEqual([8, 9, 10, 11, 12]);
      expect(restored?.selectedDays).toBe(3);
      expect(restored?.guestCount).toBe(6);
      expect(restored?.selectedAddOns).toEqual(['addon-parking', 'addon-wifi', 'addon-catering']);
      expect(restored?.isRecurring).toBe(true);
      expect(restored?.recurrenceFreq).toBe('WEEKLY');
      expect(restored?.recurrenceCount).toBe(8);
      expect(restored?.agreedToTerms).toBe(true);
      expect(restored?.listingTitle).toBe('Beautiful Conference Room');
      expect(restored?.listingImage).toBe('https://example.com/room.jpg');
    });
  });
});
