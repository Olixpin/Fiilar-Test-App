/**
 * @fiilar/storage
 * 
 * Centralized storage management for the Fiilar application.
 * Organized into focused modules by domain:
 * - users: User management and authentication
 * - listings: Listing CRUD operations
 * - bookings: Booking management and handshake verification
 * - damage-reports: Damage report management
 * - security: Authentication and booking security utilities
 * - config: Centralized application configuration
 */

// Re-export all modules for backward compatibility
export * from './constants';
export * from './init';
export * from './users';
export * from './listings';
export * from './bookings';
export * from './damage-reports';
export * from './emailService';
export * from './phoneService';
export * from './security';
export * from './config';

// Export STORAGE_KEYS for convenience
export { STORAGE_KEYS } from './constants';