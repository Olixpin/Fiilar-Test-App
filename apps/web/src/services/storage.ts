import { User, Listing, Booking, Role, Conversation, Message, Review, Notification } from '@fiilar/types';
import { MOCK_LISTINGS } from '../constants';

export const STORAGE_KEYS = {
  USER: 'fiilar_user',
  USERS_DB: 'fiilar_users_db', // New DB key for persistence
  LISTINGS: 'fiilar_listings',
  BOOKINGS: 'fiilar_bookings',
  CONVERSATIONS: 'fiilar_conversations',
  MESSAGES: 'fiilar_messages',
  REVIEWS: 'fiilar_reviews',
  NOTIFICATIONS: 'fiilar_notifications',
  DAMAGE_REPORTS: 'fiilar_damage_reports',
};

// Initialize mock data
export const initStorage = () => {
  const storedListingsStr = localStorage.getItem(STORAGE_KEYS.LISTINGS);
  let storedListings: Listing[] = storedListingsStr ? JSON.parse(storedListingsStr) : [];

  // Always update mock listings to ensure latest data/images
  // This merges the fresh MOCK_LISTINGS into the stored listings
  MOCK_LISTINGS.forEach(mockListing => {
    const index = storedListings.findIndex(l => l.id === mockListing.id);
    if (index >= 0) {
      storedListings[index] = mockListing;
    } else {
      storedListings.push(mockListing);
    }
  });

  localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(storedListings));

  // Initialize Users DB if empty
  if (!localStorage.getItem(STORAGE_KEYS.USERS_DB)) {
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify([]));
  }
};

export const getAllUsers = (): User[] => {
  const u = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  return u ? JSON.parse(u) : [];
};

const saveUserToDb = (user: User) => {
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

export const saveUser = saveUserToDb;

export const getCurrentUser = (): User | null => {
  const u = localStorage.getItem(STORAGE_KEYS.USER);
  return u ? JSON.parse(u) : null;
};

import { generateVerificationToken, getTokenExpiry, sendVerificationEmail } from './emailService';

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
  const users = getAllUsers();
  if (!users.find(u => u.id === 'host2')) {
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
    users.push(host2);
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  }
  let user = users.find(u => u.id === userId);

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

    saveUserToDb(user);

    // Send verification email for new non-admin users who didn't use Google
    if (role !== Role.ADMIN && !isGoogle && provider === 'email') {
      sendVerificationEmail(email, token, name);
    }
  } else {
    // User exists, update verification if using trusted provider
    let updated = false;
    if (provider === 'google' && !user.emailVerified) {
      user.emailVerified = true;
      updated = true;
    }
    if (provider === 'phone' && !user.phoneVerified) {
      user.phoneVerified = true;
      updated = true;
    }

    if (updated) {
      saveUserToDb(user);
    }
  }

  // Set as active session
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const getListings = (): Listing[] => {
  const l = localStorage.getItem(STORAGE_KEYS.LISTINGS);
  return l ? JSON.parse(l) : [];
};

export const saveListing = (listing: Listing) => {
  const listings = getListings();
  const idx = listings.findIndex(l => l.id === listing.id);
  if (idx >= 0) {
    listings[idx] = listing;
  } else {
    listings.push(listing);
  }
  localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
};

export const deleteListing = (id: string) => {
  const listings = getListings();
  // Filter out the listing with the matching ID
  const updatedListings = listings.filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updatedListings));
};

export const getBookings = (): Booking[] => {
  const b = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  return b ? JSON.parse(b) : [];
};

import { generateVerificationCode } from '../utils/verification';

export const createBooking = (booking: Booking): Booking => {
  const bookings = getBookings();

  // Generate Handshake Codes using the robust utility
  const guestCode = generateVerificationCode();
  const hostCode = generateVerificationCode();

  const newBooking: Booking = {
    ...booking,
    guestCode,
    hostCode,
    handshakeStatus: 'PENDING',
    disputeStatus: 'NONE',
    modificationAllowed: false
  };

  bookings.push(newBooking);
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

  return newBooking;
};

// Alias for consistency with other services
export const saveBooking = createBooking;

export const verifyHandshake = (bookingId: string, code: string): boolean => {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === bookingId);

  if (idx === -1) return false;

  const booking = bookings[idx];

  // Check if code matches guest code
  if (booking.guestCode === code) {
    booking.handshakeStatus = 'VERIFIED';
    booking.verifiedAt = new Date().toISOString();
    booking.status = 'Started';

    bookings[idx] = booking;
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return true;
  }

  return false;
};

export const findBookingByGuestCode = (hostId: string, code: string): Booking | undefined => {
  const bookings = getBookings();
  // Find a booking for this host with the matching guest code
  // We also check that the booking is not cancelled and is relevant (e.g. today or future)
  // For simplicity, we just match the code and hostId

  // We need to find the listing first to check hostId, OR check if we have hostId on booking?
  // Booking has listingId. Listing has hostId.
  // We need to join.
  const listings = getListings();
  const hostListingIds = listings.filter(l => l.hostId === hostId).map(l => l.id);

  return bookings.find(b =>
    hostListingIds.includes(b.listingId) &&
    b.guestCode === code &&
    b.status !== 'Cancelled' &&
    b.status !== 'Completed'
  );
};

export const updateBooking = (booking: Booking) => {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === booking.id);
  if (idx >= 0) {
    bookings[idx] = booking;
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }
};

export const setModificationAllowed = (bookingId: string, allowed: boolean) => {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === bookingId);
  if (idx >= 0) {
    bookings[idx].modificationAllowed = allowed;
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }
};

export const deleteBooking = (id: string) => {
  const bookings = getBookings();
  const updatedBookings = bookings.filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updatedBookings));
};

// Host/Admin Helpers
export const updateKYC = (userId: string, status: boolean, proofUrl?: string) => {
  // Update in DB to persist across logins
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.kycVerified = status;
    // Use identityDocument instead of proofOfAddress for User object
    if (proofUrl) user.identityDocument = proofUrl;
    saveUserToDb(user);
  }
};

export const updateLiveness = (userId: string, status: boolean) => {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.livenessVerified = status;
    saveUserToDb(user);
  }
};

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
  saveUserToDb(user);

  // Force update session storage to ensure immediate UI reflection
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    console.log('Force updating session user in toggleFavorite');
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  return newFavorites;
};

// Messaging System
export const getConversations = (userId: string): Conversation[] => {
  const c = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
  const m = localStorage.getItem(STORAGE_KEYS.MESSAGES);

  const conversations: Conversation[] = c ? JSON.parse(c) : [];
  const allMessages: Message[] = m ? JSON.parse(m) : [];

  const filtered = conversations.filter(conv => conv.participants.includes(userId));

  // Dynamically calculate unread counts
  const withCounts = filtered.map(conv => {
    const unreadCount = allMessages.filter(msg =>
      msg.conversationId === conv.id &&
      msg.senderId !== userId &&
      !msg.read
    ).length;

    return { ...conv, unreadCount };
  });

  return withCounts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const getMessages = (conversationId: string): Message[] => {
  const m = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  const messages: Message[] = m ? JSON.parse(m) : [];
  return messages.filter(msg => msg.conversationId === conversationId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const sendMessage = (conversationId: string, content: string, senderId: string) => {
  const m = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  const messages: Message[] = m ? JSON.parse(m) : [];

  const newMessage: Message = {
    id: Math.random().toString(36).substr(2, 9),
    conversationId,
    senderId,
    content,
    timestamp: new Date().toISOString(),
    read: false
  };

  messages.push(newMessage);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));

  // Update conversation lastMessage and updatedAt
  const c = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
  const conversations: Conversation[] = c ? JSON.parse(c) : [];
  const idx = conversations.findIndex(conv => conv.id === conversationId);

  if (idx >= 0) {
    conversations[idx].lastMessage = newMessage;
    conversations[idx].updatedAt = newMessage.timestamp;
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));

    // Create notification for the recipient
    const recipientId = conversations[idx].participants.find(p => p !== senderId);
    if (recipientId) {
      addNotification({
        userId: recipientId,
        type: 'message',
        title: 'New Message',
        message: `You have a new message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        severity: 'info',
        read: false,
        actionRequired: false,
        metadata: {
          link: `/dashboard?tab=messages&conversationId=${conversationId}`,
          senderId: senderId
        }
      });
    }
  }
};

export const markAsRead = (conversationId: string, userId: string) => {
  const m = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  const messages: Message[] = m ? JSON.parse(m) : [];

  let hasUpdates = false;
  const updatedMessages = messages.map(msg => {
    if (msg.conversationId === conversationId && msg.senderId !== userId && !msg.read) {
      hasUpdates = true;
      return { ...msg, read: true };
    }
    return msg;
  });

  if (hasUpdates) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));
  }
};

export const startConversation = (userId: string, hostId: string, listingId?: string): string => {
  const c = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
  const conversations: Conversation[] = c ? JSON.parse(c) : [];

  // Check if conversation already exists
  const existing = conversations.find(conv =>
    conv.participants.includes(userId) &&
    conv.participants.includes(hostId) &&
    conv.listingId === listingId
  );

  if (existing) return existing.id;

  // Create new conversation
  const newConv: Conversation = {
    id: Math.random().toString(36).substr(2, 9),
    participants: [userId, hostId],
    listingId,
    updatedAt: new Date().toISOString(),
    lastMessageTime: new Date().toISOString()
  };

  conversations.push(newConv);
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));

  return newConv.id;
};

// Review System
export const getReviews = (listingId: string): Review[] => {
  const r = localStorage.getItem(STORAGE_KEYS.REVIEWS);
  const reviews: Review[] = r ? JSON.parse(r) : [];
  return reviews
    .filter(review => review.listingId === listingId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addReview = (review: Omit<Review, 'id' | 'createdAt'>): void => {
  const r = localStorage.getItem(STORAGE_KEYS.REVIEWS);
  const reviews: Review[] = r ? JSON.parse(r) : [];

  // Check if user already reviewed this booking
  const existing = reviews.find(rev => rev.bookingId === review.bookingId);
  if (existing) {
    throw new Error('You have already reviewed this booking');
  }

  const newReview: Review = {
    ...review,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };

  reviews.push(newReview);
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
};

export const getAverageRating = (listingId: string): number => {
  const reviews = getReviews(listingId);
  if (reviews.length === 0) return 0;

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal
};

// Notification System
export const getNotifications = (userId: string): Notification[] => {
  const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  const notifications: Notification[] = n ? JSON.parse(n) : [];
  return notifications
    .filter(notif => notif.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getUnreadCount = (userId: string): number => {
  const notifications = getNotifications(userId);
  return notifications.filter(n => !n.read).length;
};

export const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): void => {
  const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  const notifications: Notification[] = n ? JSON.parse(n) : [];

  const newNotification: Notification = {
    ...notification,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };

  notifications.push(newNotification);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
};

export const markNotificationAsRead = (notificationId: string) => {
  const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  const notifications: Notification[] = n ? JSON.parse(n) : [];

  const idx = notifications.findIndex(notif => notif.id === notificationId);
  if (idx >= 0) {
    notifications[idx].read = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }
};

export const markAllNotificationsAsRead = (userId: string) => {
  const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  const notifications: Notification[] = n ? JSON.parse(n) : [];

  let hasUpdates = false;
  const updatedNotifications = notifications.map(notif => {
    if (notif.userId === userId && !notif.read) {
      hasUpdates = true;
      return { ...notif, read: true };
    }
    return notif;
  });

  if (hasUpdates) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
  }
};

export const clearAllNotifications = (userId: string) => {
  const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  const notifications: Notification[] = n ? JSON.parse(n) : [];

  // Keep notifications that don't belong to this user
  const remainingNotifications = notifications.filter(notif => notif.userId !== userId);

  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(remainingNotifications));
};

export const updateUserWalletBalance = (userId: string, amount: number) => {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.walletBalance = (user.walletBalance || 0) + amount;
    saveUserToDb(user);
  }
};