
import { User, Listing, Booking, Role, ListingStatus, Conversation, Message, Review, Notification, DamageReport } from '../types';
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
  if (!localStorage.getItem(STORAGE_KEYS.LISTINGS)) {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(MOCK_LISTINGS));
  }
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
  let phone = '';

  switch (role) {
    case Role.HOST: userId = 'host_123'; name = 'Jane Host'; email = 'jane@example.com'; break;
    case Role.USER: userId = 'user_123'; name = 'John User'; email = 'john@example.com'; break;
    case Role.ADMIN: userId = 'admin_001'; name = 'Super Admin'; email = 'admin@fiilar.com'; break;
  }

  // Check DB first to load existing state (KYC, etc)
  const users = getAllUsers();
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

export const createBooking = (booking: Booking) => {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
};

// Alias for consistency with other services
export const saveBooking = createBooking;

export const updateBooking = (booking: Booking) => {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === booking.id);
  if (idx >= 0) {
    bookings[idx] = booking;
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
  console.log('Raw conversations from storage:', c);
  const conversations: Conversation[] = c ? JSON.parse(c) : [];
  const filtered = conversations.filter(conv => conv.participants.includes(userId));
  console.log(`Filtering conversations for ${userId}. Found: ${filtered.length}`);
  return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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
    updatedAt: new Date().toISOString()
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

export const markNotificationAsRead = (notificationId: string): void => {
  const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  const notifications: Notification[] = n ? JSON.parse(n) : [];

  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }
};

export const markAllNotificationsAsRead = (userId: string): void => {
  const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  const notifications: Notification[] = n ? JSON.parse(n) : [];

  notifications.forEach(notif => {
    if (notif.userId === userId) {
      notif.read = true;
    }
  });

  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
};

export const getUnreadCount = (userId: string): number => {
  const notifications = getNotifications(userId);
  return notifications.filter(n => !n.read).length;
};

// Damage Report System
export const createDamageReport = (report: Omit<DamageReport, 'id' | 'createdAt'>): string => {
  const d = localStorage.getItem(STORAGE_KEYS.DAMAGE_REPORTS);
  const reports: DamageReport[] = d ? JSON.parse(d) : [];

  const newReport: DamageReport = {
    ...report,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };

  reports.push(newReport);
  localStorage.setItem(STORAGE_KEYS.DAMAGE_REPORTS, JSON.stringify(reports));

  // Create notification for the user
  addNotification({
    userId: report.reportedTo,
    type: 'damage_report',
    title: 'Damage Report Filed',
    message: `A host has reported damage to your booking. Estimated cost: $${report.estimatedCost}`,
    severity: 'urgent',
    read: false,
    actionRequired: true,
    metadata: {
      reportId: newReport.id,
      amount: report.estimatedCost,
      images: report.images
    }
  });

  return newReport.id;
};

export const getDamageReports = (userId: string): DamageReport[] => {
  const d = localStorage.getItem(STORAGE_KEYS.DAMAGE_REPORTS);
  const reports: DamageReport[] = d ? JSON.parse(d) : [];
  return reports
    .filter(report => report.reportedBy === userId || report.reportedTo === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const updateDamageReport = (reportId: string, updates: Partial<DamageReport>): void => {
  const d = localStorage.getItem(STORAGE_KEYS.DAMAGE_REPORTS);
  const reports: DamageReport[] = d ? JSON.parse(d) : [];

  const reportIndex = reports.findIndex(r => r.id === reportId);
  if (reportIndex !== -1) {
    reports[reportIndex] = { ...reports[reportIndex], ...updates };
    localStorage.setItem(STORAGE_KEYS.DAMAGE_REPORTS, JSON.stringify(reports));
  }
};

export const getDamageReportById = (reportId: string): DamageReport | undefined => {
  const d = localStorage.getItem(STORAGE_KEYS.DAMAGE_REPORTS);
  const reports: DamageReport[] = d ? JSON.parse(d) : [];
  return reports.find(r => r.id === reportId);
};
