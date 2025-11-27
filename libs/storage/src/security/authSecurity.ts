/**
 * Authentication Security Utilities
 * Implements rate limiting, secure token generation, and session management
 * 
 * Note: This simulates server-side security with localStorage for demo purposes.
 * In production, these should be handled by a real backend.
 */

// ===== STORAGE KEYS FOR SECURITY =====
export const SECURITY_KEYS = {
    OTP_ATTEMPTS: 'fiilar_otp_attempts',
    LOGIN_ATTEMPTS: 'fiilar_login_attempts',
    ACCOUNT_LOCKOUTS: 'fiilar_account_lockouts',
    SESSIONS: 'fiilar_sessions',
    DEVICE_FINGERPRINTS: 'fiilar_device_fingerprints',
    AUDIT_LOG: 'fiilar_audit_log',
};

import { AUTH_CONFIG } from '../config/appConfig';

// ===== CONFIGURATION =====
export const SECURITY_CONFIG = {
    MAX_OTP_ATTEMPTS: AUTH_CONFIG.MAX_LOGIN_ATTEMPTS,
    LOCKOUT_DURATION_MINUTES: AUTH_CONFIG.LOCKOUT_DURATION_MINUTES,
    OTP_EXPIRY_MINUTES: AUTH_CONFIG.OTP_EXPIRY_MINUTES,
    SESSION_EXPIRY_HOURS: AUTH_CONFIG.SESSION_EXPIRY_HOURS,
    TOKEN_LENGTH: 32,
};

// ===== TYPES =====
export interface AttemptRecord {
    identifier: string; // email or phone
    attempts: number;
    firstAttemptAt: string;
    lastAttemptAt: string;
    lockedUntil?: string;
}

export interface Session {
    id: string;
    userId: string;
    createdAt: string;
    expiresAt: string;
    deviceFingerprint?: string;
    userAgent?: string;
    ipAddress?: string; // Would be set by server in production
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    action: 'LOGIN' | 'LOGOUT' | 'OTP_SENT' | 'OTP_VERIFIED' | 'OTP_FAILED' | 'ACCOUNT_LOCKED' | 'BOOKING_CREATED' | 'PAYMENT_PROCESSED' | 'ADMIN_BYPASS_ATTEMPT' | 'SESSION_EXPIRED' | 'SECURITY_VIOLATION';
    userId?: string;
    identifier?: string;
    metadata?: Record<string, any>;
    success: boolean;
}

// ===== CRYPTOGRAPHIC TOKEN GENERATION =====
/**
 * Generate a cryptographically secure random token
 * Uses Web Crypto API instead of Math.random()
 */
export const generateSecureToken = (length: number = SECURITY_CONFIG.TOKEN_LENGTH): string => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Generate a secure 6-digit OTP
 */
export const generateSecureOTP = (): string => {
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    // Convert to number between 100000 and 999999
    const num = (array[0] << 24 | array[1] << 16 | array[2] << 8 | array[3]) >>> 0;
    const otp = (num % 900000) + 100000;
    return otp.toString();
};

/**
 * Hash a string using SHA-256 (async version)
 * Used to hash OTP before storage
 */
export const hashStringAsync = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash a string using a simple deterministic hash (sync version)
 * For localStorage mock - uses a fast hash algorithm
 * In production, use async SHA-256 or server-side bcrypt
 */
export const hashString = (str: string): string => {
    // Simple but fast hash using djb2 algorithm + salt
    const salt = 'fiilar_secure_salt_2024';
    const salted = salt + str + salt;
    let hash = 5381;
    for (let i = 0; i < salted.length; i++) {
        hash = ((hash << 5) + hash) + salted.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
    }
    // Make it positive and convert to hex, then pad for consistency
    return Math.abs(hash).toString(16).padStart(8, '0') + '_hashed';
};

/**
 * Verify a string against a hash (async version)
 */
export const verifyHashAsync = async (str: string, hash: string): Promise<boolean> => {
    const computedHash = await hashStringAsync(str);
    return computedHash === hash;
};

/**
 * Verify a string against a hash (sync version)
 */
export const verifyHash = (str: string, hash: string): boolean => {
    const computedHash = hashString(str);
    return computedHash === hash;
};

// ===== RATE LIMITING =====
/**
 * Get attempt records from localStorage
 */
const getAttemptRecords = (): AttemptRecord[] => {
    try {
        const data = localStorage.getItem(SECURITY_KEYS.OTP_ATTEMPTS);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

/**
 * Save attempt records to localStorage
 */
const saveAttemptRecords = (records: AttemptRecord[]): void => {
    localStorage.setItem(SECURITY_KEYS.OTP_ATTEMPTS, JSON.stringify(records));
};

/**
 * Check if an identifier (email/phone) is locked out
 */
export const isLockedOut = (identifier: string): { locked: boolean; remainingMinutes?: number } => {
    const records = getAttemptRecords();
    const record = records.find(r => r.identifier === identifier);

    if (!record || !record.lockedUntil) {
        return { locked: false };
    }

    const lockoutEnd = new Date(record.lockedUntil);
    const now = new Date();

    if (lockoutEnd > now) {
        const remainingMs = lockoutEnd.getTime() - now.getTime();
        const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
        return { locked: true, remainingMinutes };
    }

    // Lockout expired, clear it
    record.lockedUntil = undefined;
    record.attempts = 0;
    saveAttemptRecords(records);

    return { locked: false };
};

/**
 * Record an OTP attempt (failed or successful)
 * Returns true if the attempt is allowed, false if rate limited
 */
export const recordOtpAttempt = (identifier: string, success: boolean): { allowed: boolean; attemptsRemaining?: number; lockedUntil?: string } => {
    const records = getAttemptRecords();
    let record = records.find(r => r.identifier === identifier);

    const now = new Date();

    if (!record) {
        record = {
            identifier,
            attempts: 0,
            firstAttemptAt: now.toISOString(),
            lastAttemptAt: now.toISOString(),
        };
        records.push(record);
    }

    // Check if already locked
    const lockoutStatus = isLockedOut(identifier);
    if (lockoutStatus.locked) {
        return { allowed: false, lockedUntil: record.lockedUntil };
    }

    // Reset attempts if first attempt was more than lockout duration ago
    const firstAttempt = new Date(record.firstAttemptAt);
    const timeSinceFirst = now.getTime() - firstAttempt.getTime();
    if (timeSinceFirst > SECURITY_CONFIG.LOCKOUT_DURATION_MINUTES * 60 * 1000) {
        record.attempts = 0;
        record.firstAttemptAt = now.toISOString();
    }

    if (success) {
        // Reset on success
        record.attempts = 0;
        record.lockedUntil = undefined;
        saveAttemptRecords(records);
        return { allowed: true };
    }

    // Increment failed attempts
    record.attempts += 1;
    record.lastAttemptAt = now.toISOString();

    // Check if should lock out
    if (record.attempts >= SECURITY_CONFIG.MAX_OTP_ATTEMPTS) {
        const lockoutEnd = new Date(now.getTime() + SECURITY_CONFIG.LOCKOUT_DURATION_MINUTES * 60 * 1000);
        record.lockedUntil = lockoutEnd.toISOString();
        saveAttemptRecords(records);

        // Log the lockout
        logAuditEvent({
            action: 'ACCOUNT_LOCKED',
            identifier,
            success: false,
            metadata: { reason: 'Too many OTP attempts', lockedUntil: record.lockedUntil }
        });

        return { allowed: false, lockedUntil: record.lockedUntil };
    }

    saveAttemptRecords(records);
    return { allowed: true, attemptsRemaining: SECURITY_CONFIG.MAX_OTP_ATTEMPTS - record.attempts };
};

/**
 * Clear attempt records for an identifier (on successful verification)
 */
export const clearAttempts = (identifier: string): void => {
    const records = getAttemptRecords().filter(r => r.identifier !== identifier);
    saveAttemptRecords(records);
};

// ===== SESSION MANAGEMENT =====
/**
 * Get all sessions from localStorage
 */
const getSessions = (): Session[] => {
    try {
        const data = localStorage.getItem(SECURITY_KEYS.SESSIONS);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

/**
 * Save sessions to localStorage
 */
const saveSessions = (sessions: Session[]): void => {
    localStorage.setItem(SECURITY_KEYS.SESSIONS, JSON.stringify(sessions));
};

/**
 * Create a new session for a user
 */
export const createSession = (userId: string): Session => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SECURITY_CONFIG.SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

    const session: Session = {
        id: generateSecureToken(16),
        userId,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        deviceFingerprint: generateDeviceFingerprint(),
    };

    const sessions = getSessions();
    // Remove expired sessions for this user
    const activeSessions = sessions.filter(s =>
        s.userId !== userId || new Date(s.expiresAt) > now
    );
    activeSessions.push(session);
    saveSessions(activeSessions);

    return session;
};

/**
 * Validate a session
 */
export const validateSession = (sessionId: string): { valid: boolean; session?: Session; reason?: string } => {
    const sessions = getSessions();
    const session = sessions.find(s => s.id === sessionId);

    if (!session) {
        return { valid: false, reason: 'Session not found' };
    }

    const now = new Date();
    if (new Date(session.expiresAt) <= now) {
        // Remove expired session
        const activeSessions = sessions.filter(s => s.id !== sessionId);
        saveSessions(activeSessions);
        return { valid: false, reason: 'Session expired' };
    }

    return { valid: true, session };
};

/**
 * Invalidate a session (logout)
 */
export const invalidateSession = (sessionId: string): void => {
    const sessions = getSessions().filter(s => s.id !== sessionId);
    saveSessions(sessions);
};

/**
 * Invalidate all sessions for a user (logout from all devices)
 */
export const invalidateAllUserSessions = (userId: string): void => {
    const sessions = getSessions().filter(s => s.userId !== userId);
    saveSessions(sessions);
};

/**
 * Get active sessions for a user
 */
export const getUserSessions = (userId: string): Session[] => {
    const now = new Date();
    return getSessions().filter(s =>
        s.userId === userId && new Date(s.expiresAt) > now
    );
};

// ===== DEVICE FINGERPRINTING =====
/**
 * Generate a simple device fingerprint
 * In production, use a library like FingerprintJS
 */
export const generateDeviceFingerprint = (): string => {
    if (typeof window === 'undefined') return 'server';

    const components = [
        navigator.userAgent,
        navigator.language,
        new Date().getTimezoneOffset().toString(),
        screen.width + 'x' + screen.height,
        screen.colorDepth?.toString() || '',
    ];

    // Simple hash of components
    let hash = 0;
    const str = components.join('|');
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
};

// ===== AUDIT LOGGING =====
/**
 * Get audit log entries
 */
export const getAuditLog = (): AuditLogEntry[] => {
    try {
        const data = localStorage.getItem(SECURITY_KEYS.AUDIT_LOG);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

/**
 * Log an audit event
 */
export const logAuditEvent = (event: Omit<AuditLogEntry, 'id' | 'timestamp'>): void => {
    const logs = getAuditLog();

    const entry: AuditLogEntry = {
        id: generateSecureToken(8),
        timestamp: new Date().toISOString(),
        ...event,
    };

    logs.unshift(entry);

    // Keep only last 1000 entries
    if (logs.length > 1000) {
        logs.length = 1000;
    }

    localStorage.setItem(SECURITY_KEYS.AUDIT_LOG, JSON.stringify(logs));
};

// ===== INPUT VALIDATION =====
/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate phone number format
 */
export const isValidPhone = (phone: string): boolean => {
    // Remove spaces and common separators
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    // Should start with + or digit, and be 10-15 digits
    const phoneRegex = /^\+?\d{10,15}$/;
    return phoneRegex.test(cleaned);
};

/**
 * Validate that a string doesn't contain potentially harmful content
 */
export const isSafeString = (str: string, maxLength: number = 1000): boolean => {
    if (str.length > maxLength) return false;
    // Check for script tags or other potentially harmful patterns
    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i,
        /data:/i,
    ];
    return !dangerousPatterns.some(pattern => pattern.test(str));
};

// ===== OTP EXPIRY HELPERS =====
/**
 * Get OTP expiry time (3 minutes from now)
 */
export const getSecureOtpExpiry = (): string => {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + SECURITY_CONFIG.OTP_EXPIRY_MINUTES);
    return expiry.toISOString();
};

/**
 * Check if OTP has expired
 */
export const isOtpExpired = (expiryDate: string): boolean => {
    return new Date(expiryDate) < new Date();
};
