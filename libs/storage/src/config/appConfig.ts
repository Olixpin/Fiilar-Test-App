/**
 * Centralized Application Configuration
 * 
 * All configurable values should be defined here instead of being hardcoded
 * throughout the application. This makes it easy to:
 * - Change values in one place
 * - Move to environment variables in production
 * - Audit all configuration
 */

// ===== APP INFO =====
export const APP_INFO = {
    /**
     * Application name
     */
    NAME: 'Fiilar',
    
    /**
     * Application version
     */
    VERSION: '1.0.0',
    
    /**
     * Copyright year (uses current year dynamically)
     */
    get COPYRIGHT_YEAR() {
        return new Date().getFullYear();
    },
    
    /**
     * Full copyright text
     */
    get COPYRIGHT_TEXT() {
        return `© ${this.COPYRIGHT_YEAR} ${this.NAME}. All rights reserved.`;
    },
    
    /**
     * Version with copyright
     */
    get VERSION_WITH_COPYRIGHT() {
        return `Version ${this.VERSION} • ${this.COPYRIGHT_TEXT}`;
    },
};

// ===== ENVIRONMENT =====
export const APP_CONFIG = {
    /**
     * Application Environment
     * In production, this would come from environment variables
     */
    ENV: 'development' as 'development' | 'staging' | 'production',
    
    /**
     * Enable demo/mock mode
     * When true, uses mock data and simulated services
     */
    DEMO_MODE: true,
};

// ===== AUTHENTICATION =====
export const AUTH_CONFIG = {
    /**
     * Admin email addresses that have elevated privileges
     * In production, this should come from a secure backend or environment variable
     */
    ADMIN_EMAILS: ['admin@fiilar.com'],
    
    /**
     * OTP expiry in minutes
     */
    OTP_EXPIRY_MINUTES: 3,
    
    /**
     * Session expiry in hours
     */
    SESSION_EXPIRY_HOURS: 24,
    
    /**
     * Maximum login attempts before lockout
     */
    MAX_LOGIN_ATTEMPTS: 5,
    
    /**
     * Lockout duration in minutes
     */
    LOCKOUT_DURATION_MINUTES: 15,
};

// ===== BOOKING =====
export const BOOKING_CONFIG = {
    /**
     * Service fee percentage (platform fee)
     * 0.10 = 10%
     */
    SERVICE_FEE_PERCENTAGE: 0.10,
    
    /**
     * Maximum days ahead a booking can be made
     */
    MAX_BOOKING_DAYS_AHEAD: 365,
    
    /**
     * Minimum price for a booking
     */
    MIN_PRICE: 0.01,
    
    /**
     * Maximum total price for a single booking
     */
    MAX_PRICE: 100000000, // 100M limit
    
    /**
     * Idempotency key expiry in hours
     */
    IDEMPOTENCY_KEY_EXPIRY_HOURS: 24,
    
    /**
     * Booking expiry time in hours (if host doesn't respond)
     */
    BOOKING_EXPIRY_HOURS: 1,
    
    /**
     * Escrow release period in hours after booking ends
     * Configurable per pricing model for industry-standard payouts:
     * - HOURLY: 24 hours (short sessions, lower risk)
     * - DAILY: 24 hours (event spaces, supervised access)
     * - NIGHTLY: 48 hours (overnight stays, higher damage risk)
     */
    ESCROW_RELEASE_HOURS: {
        HOURLY: 24,
        DAILY: 24,
        NIGHTLY: 48,
        DEFAULT: 48, // Fallback for legacy bookings
    },
};

// ===== CANCELLATION =====
export const CANCELLATION_CONFIG = {
    /**
     * Flexible policy thresholds (in hours before booking)
     */
    FLEXIBLE: {
        FULL_REFUND_HOURS: 24,
        PARTIAL_REFUND_HOURS: 12,
        PARTIAL_REFUND_PERCENTAGE: 50,
    },
    
    /**
     * Moderate policy thresholds (in hours before booking)
     */
    MODERATE: {
        FULL_REFUND_HOURS: 168, // 7 days
        PARTIAL_REFUND_HOURS: 24,
        PARTIAL_REFUND_PERCENTAGE: 50,
    },
    
    /**
     * Strict policy thresholds (in hours before booking)
     */
    STRICT: {
        FULL_REFUND_HOURS: 336, // 14 days
        PARTIAL_REFUND_HOURS: 168, // 7 days
        PARTIAL_REFUND_PERCENTAGE: 50,
    },
};

// ===== UI/UX =====
export const UI_CONFIG = {
    /**
     * Toast notification display duration in milliseconds
     */
    TOAST_DURATION_MS: 2000,
    
    /**
     * Typing indicator timeout in milliseconds
     */
    TYPING_TIMEOUT_MS: 1000,
    
    /**
     * Animation durations
     */
    ANIMATION: {
        FADE_IN_MS: 200,
        SLIDE_IN_MS: 300,
    },
};

// ===== DEMO/MOCK DATA =====
export const DEMO_CONFIG = {
    /**
     * Demo user IDs for testing
     * These should ONLY be used in demo mode
     */
    MOCK_USER_ID: 'user_123',
    MOCK_HOST_ID: 'host_123',
    
    /**
     * Demo emails
     */
    DEMO_EMAILS: {
        HOST: 'jane@example.com',
        USER: 'john@example.com',
        HOST2: 'sarah@example.com',
    },
    
    /**
     * Simulated API delay in milliseconds
     */
    API_DELAY_MS: 1000,
};

// ===== VALIDATION =====
export const VALIDATION_CONFIG = {
    /**
     * Maximum email length
     */
    MAX_EMAIL_LENGTH: 254,
    
    /**
     * Maximum safe string length for input sanitization
     */
    MAX_SAFE_STRING_LENGTH: 1000,
    
    /**
     * Recurrence limits
     */
    MAX_DAILY_RECURRENCE: 30,
    MAX_WEEKLY_RECURRENCE: 12,
};

// ===== HELPER FUNCTIONS =====

/**
 * Check if the app is in demo mode
 */
export const isDemoMode = (): boolean => APP_CONFIG.DEMO_MODE;

/**
 * Check if email is an admin email
 */
export const isAdminEmail = (email: string): boolean => {
    return AUTH_CONFIG.ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Get service fee for a given amount
 */
export const calculateServiceFee = (amount: number): number => {
    return Math.round(amount * BOOKING_CONFIG.SERVICE_FEE_PERCENTAGE * 100) / 100;
};
