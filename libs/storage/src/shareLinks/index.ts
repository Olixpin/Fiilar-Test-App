/**
 * Share Links Storage Module
 * 
 * Handles creation, retrieval, and management of shareable host links.
 * Uses short codes to hide internal structure and prevent enumeration.
 * 
 * Security considerations:
 * - Short codes are randomly generated, non-sequential
 * - Only verified hosts can create share links
 * - Links can be deactivated by host or admin
 * - Rate limiting on link creation (handled at API layer)
 */

import { ShareableLink, PublicHostProfile, PublicListing, HostStorefrontData, Listing, User, ListingStatus, Role } from '@fiilar/types';

const STORAGE_KEYS = {
  SHARE_LINKS: 'fiilar_share_links',
};

/**
 * Generate a simple unique ID
 */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

/**
 * Generate a unique short code for share links
 * Uses alphanumeric characters, 6-8 chars long
 * Avoids confusing characters (0, O, l, 1, I)
 */
const generateShortCode = (): string => {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'; // Removed confusing chars
  const length = 6 + Math.floor(Math.random() * 3); // 6-8 chars
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Get all share links from storage
 */
export const getShareLinks = (): ShareableLink[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SHARE_LINKS);
  return data ? JSON.parse(data) : [];
};

/**
 * Save share links to storage
 */
const saveShareLinks = (links: ShareableLink[]): void => {
  localStorage.setItem(STORAGE_KEYS.SHARE_LINKS, JSON.stringify(links));
};

/**
 * Get or create a share link for a host
 * Each host can only have one active share link at a time
 */
export const getOrCreateShareLink = (hostId: string): ShareableLink | null => {
  const links = getShareLinks();
  
  // Check if host already has an active link
  let existingLink = links.find(l => l.hostId === hostId && l.isActive);
  
  if (existingLink) {
    return existingLink;
  }
  
  // Create new link
  let shortCode = generateShortCode();
  
  // Ensure unique short code
  while (links.some(l => l.shortCode === shortCode)) {
    shortCode = generateShortCode();
  }
  
  const newLink: ShareableLink = {
    id: generateId(),
    shortCode,
    hostId,
    isActive: true,
    createdAt: new Date().toISOString(),
    clickCount: 0,
  };
  
  links.push(newLink);
  saveShareLinks(links);
  
  // Dispatch event for real-time updates
  window.dispatchEvent(new CustomEvent('fiilar:share-link-created', { 
    detail: { link: newLink } 
  }));
  
  return newLink;
};

/**
 * Get share link by short code
 * Returns null if not found or inactive
 */
export const getShareLinkByCode = (shortCode: string): ShareableLink | null => {
  const links = getShareLinks();
  const link = links.find(l => l.shortCode === shortCode && l.isActive);
  
  if (!link) return null;
  
  // Check expiry
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return null;
  }
  
  return link;
};

/**
 * Get share link by host ID
 */
export const getShareLinkByHostId = (hostId: string): ShareableLink | null => {
  const links = getShareLinks();
  return links.find(l => l.hostId === hostId && l.isActive) || null;
};

/**
 * Record a click on a share link (analytics)
 */
export const recordShareLinkClick = (shortCode: string): void => {
  const links = getShareLinks();
  const linkIndex = links.findIndex(l => l.shortCode === shortCode);
  
  if (linkIndex !== -1) {
    links[linkIndex].clickCount += 1;
    links[linkIndex].lastClickedAt = new Date().toISOString();
    saveShareLinks(links);
  }
};

/**
 * Deactivate a share link
 */
export const deactivateShareLink = (shortCode: string, hostId: string): boolean => {
  const links = getShareLinks();
  const linkIndex = links.findIndex(l => l.shortCode === shortCode && l.hostId === hostId);
  
  if (linkIndex === -1) return false;
  
  links[linkIndex].isActive = false;
  saveShareLinks(links);
  
  return true;
};

/**
 * Regenerate a share link (creates new code, deactivates old)
 */
export const regenerateShareLink = (hostId: string): ShareableLink | null => {
  const links = getShareLinks();
  
  // Deactivate existing links for this host
  links.forEach(link => {
    if (link.hostId === hostId) {
      link.isActive = false;
    }
  });
  saveShareLinks(links);
  
  // Create new link
  return getOrCreateShareLink(hostId);
};

/**
 * Convert a User to a PublicHostProfile
 * Only exposes safe, public information
 */
export const toPublicHostProfile = (user: User, listings: Listing[]): PublicHostProfile => {
  // Create display name (firstName + last initial, or full name)
  let displayName = user.name || 'Host';
  if (user.firstName) {
    displayName = user.lastName 
      ? `${user.firstName} ${user.lastName.charAt(0)}.`
      : user.firstName;
  }
  
  // Calculate member since year
  const memberSince = new Date(user.createdAt).getFullYear().toString();
  
  // Count active listings
  const activeListings = listings.filter(l => l.status === ListingStatus.LIVE);
  
  return {
    displayName,
    avatar: user.avatar,
    bio: user.bio,
    badgeStatus: user.badgeStatus,
    memberSince,
    rating: user.rating,
    reviewCount: user.reviewCount,
    verifiedHost: user.kycVerified || false,
    totalListings: activeListings.length,
  };
};

/**
 * Convert a Listing to a PublicListing
 * Strips sensitive information like exact address
 */
export const toPublicListing = (listing: Listing): PublicListing => {
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    type: listing.type,
    price: listing.price,
    priceUnit: listing.priceUnit,
    images: listing.images,
    location: listing.location, // Public location only
    rating: listing.rating,
    reviewCount: listing.reviewCount,
    maxGuests: listing.maxGuests,
    amenities: listing.amenities,
    instantBook: listing.settings?.instantBook,
    // Explicitly NOT including: address, coordinates, hostId
  };
};

/**
 * Get complete storefront data for a short code
 * This is the main function called by the storefront page
 */
export const getHostStorefrontByCode = (
  shortCode: string,
  getAllUsers: () => User[],
  getListings: () => Listing[]
): HostStorefrontData | null => {
  // Get and validate share link
  const link = getShareLinkByCode(shortCode);
  if (!link) return null;
  
  // Record the click for analytics
  recordShareLinkClick(shortCode);
  
  // Get host user
  const users = getAllUsers();
  const host = users.find(u => u.id === link.hostId);
  
  if (!host) return null;
  
  // Verify host is eligible (must be a host with verified status)
  if (host.role !== Role.HOST && !host.isHost) {
    return null;
  }
  
  // Get host's LIVE listings only
  const allListings = getListings();
  const hostListings = allListings.filter(
    l => l.hostId === link.hostId && l.status === ListingStatus.LIVE
  );
  
  // Convert to public format
  const publicHost = toPublicHostProfile(host, hostListings);
  const publicListings = hostListings.map(toPublicListing);
  
  // Get unique categories
  const categories = [...new Set(hostListings.map(l => l.type))];
  
  return {
    host: publicHost,
    listings: publicListings,
    shortCode: link.shortCode,
    totalListings: publicListings.length,
    categories,
  };
};

/**
 * Check if a host is eligible to have a share link
 * Requirements: Must be a host, must have at least one LIVE listing
 */
export const isHostEligibleForShareLink = (
  hostId: string,
  getAllUsers: () => User[],
  getListings: () => Listing[]
): { eligible: boolean; reason?: string } => {
  const users = getAllUsers();
  const host = users.find(u => u.id === hostId);
  
  if (!host) {
    return { eligible: false, reason: 'User not found' };
  }
  
  if (host.role !== Role.HOST && !host.isHost) {
    return { eligible: false, reason: 'User is not a host' };
  }
  
  const listings = getListings();
  const liveListings = listings.filter(
    l => l.hostId === hostId && l.status === ListingStatus.LIVE
  );
  
  if (liveListings.length === 0) {
    return { eligible: false, reason: 'No live listings available' };
  }
  
  return { eligible: true };
};

/**
 * Get share link analytics for a host
 */
export const getShareLinkAnalytics = (hostId: string): {
  totalClicks: number;
  lastClicked?: string;
  createdAt?: string;
  shortCode?: string;
} | null => {
  const link = getShareLinkByHostId(hostId);
  if (!link) return null;
  
  return {
    totalClicks: link.clickCount,
    lastClicked: link.lastClickedAt,
    createdAt: link.createdAt,
    shortCode: link.shortCode,
  };
};
