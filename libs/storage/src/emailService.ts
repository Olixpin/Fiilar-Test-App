import { db } from './mockDb';
import { Role } from '@fiilar/types';
import {
    generateSecureToken,
    generateSecureOTP,
    hashString,
    verifyHash,
    isLockedOut,
    recordOtpAttempt,
    clearAttempts,
    logAuditEvent,
    getSecureOtpExpiry,
    SECURITY_CONFIG,
} from './security/authSecurity';

export interface VerificationResult {
    success: boolean;
    message: string;
    userId?: string;
    attemptsRemaining?: number;
    lockedUntil?: string;
}

/**
 * Generate a random verification token (SECURE)
 */
export const generateVerificationToken = (): string => {
    return generateSecureToken();
};

/**
 * Generate a 6-digit OTP (SECURE)
 */
export const generateOTP = (): string => {
    return generateSecureOTP();
};

/**
 * Get token expiry time (24 hours from now)
 */
export const getTokenExpiry = (): string => {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    return expiry.toISOString();
};

/**
 * Get OTP expiry time (3 minutes from now - REDUCED for security)
 */
export const getOtpExpiry = (): string => {
    return getSecureOtpExpiry();
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (expiryDate: string): boolean => {
    return new Date(expiryDate) < new Date();
};

/**
 * Send verification email (mock implementation)
 * In production, this would call your email service (SendGrid, AWS SES, etc.)
 * 
 * SECURITY: OTP is hashed before storage - plain text never persisted
 */
export const sendVerificationEmail = (email: string, _token: string, userName: string): string => {
    const otp = generateOTP();
    const otpExpiry = getOtpExpiry();
    
    // SECURITY: Hash OTP before storing (plain text never persisted)
    const hashedOtp = hashString(otp);

    // Update user with HASHED OTP
    let user = db.users.find(u => u.email === email);

    if (!user) {
        // Create a new user for verification purposes
        const newUser = {
            id: 'user_' + Date.now(),
            name: userName || '',
            email: email,
            password: '',
            role: Role.USER,
            isHost: false,
            createdAt: new Date().toISOString(),
            kycVerified: false,
            walletBalance: 0,
            avatar: '',
            favorites: [],
            authProvider: 'email' as const,
            emailVerified: false,
            phoneVerified: false,
            verificationOtp: hashedOtp, // SECURITY: Store hash, not plain OTP
            verificationOtpExpiry: otpExpiry
        };
        db.users.create(newUser);
        
        logAuditEvent({ 
            action: 'OTP_SENT',
            userId: newUser.id,
            success: true,
            metadata: {
                channel: 'email', 
                email: email.substring(0, 3) + '***' // Log partial email for privacy
            }
        });
    } else {
        db.users.update(user.id, {
            verificationOtp: hashedOtp, // SECURITY: Store hash, not plain OTP
            verificationOtpExpiry: otpExpiry
        });
        
        logAuditEvent({ 
            action: 'OTP_SENT',
            userId: user.id,
            success: true,
            metadata: {
                channel: 'email',
                email: email.substring(0, 3) + '***'
            }
        });
    }

    console.log('📧 Verification Email (Mock)');
    console.log('To:', email);
    console.log('Subject: Verify your Fiilar email address');
    console.log('Your Verification Code:', otp);
    console.log(`
    Hi ${userName},
    
    Welcome to Fiilar! Please verify your email address by entering the code below:
    
    Code: ${otp}
    
    This code will expire in 10 minutes.
    
    If you didn't create an account, please ignore this email.
    
    Best regards,
    The Fiilar Team
  `);

    return otp;
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = (userId: string): string | null => {
    const user = db.users.findById(userId);
    if (!user) return null;

    // Generate new token & OTP
    const newToken = generateVerificationToken();
    const newExpiry = getTokenExpiry();
    const newOtp = generateOTP();
    const newOtpExpiry = getOtpExpiry();

    // SECURITY: Hash OTP before storage
    const hashedOtp = hashString(newOtp);

    // Update user
    db.users.update(userId, {
        verificationToken: newToken,
        verificationTokenExpiry: newExpiry,
        verificationOtp: hashedOtp,
        verificationOtpExpiry: newOtpExpiry
    });

    // Send email
    const otp = sendVerificationEmail(user.email, newToken, user.name);

    return otp;
};

/**
 * Verify email token (Link)
 */
export const verifyEmailToken = (token: string): VerificationResult => {
    const user = db.users.find(u => u.verificationToken === token);

    if (!user) {
        return {
            success: false,
            message: 'Invalid verification token'
        };
    }

    // Check if already verified
    if (user.emailVerified) {
        return {
            success: true,
            message: 'Email already verified',
            userId: user.id
        };
    }

    // Check if token expired
    if (user.verificationTokenExpiry && isTokenExpired(user.verificationTokenExpiry)) {
        return {
            success: false,
            message: 'Verification link has expired. Please request a new one.'
        };
    }

    // Verify email
    db.users.update(user.id, {
        emailVerified: true,
        verificationToken: undefined,
        verificationTokenExpiry: undefined,
        verificationOtp: undefined,
        verificationOtpExpiry: undefined
    });

    // Update current user if logged in
    const currentUser = JSON.parse(localStorage.getItem('fiilar_user') || 'null');
    if (currentUser && currentUser.id === user.id) {
        const updatedUser = db.users.findById(user.id);
        if (updatedUser) {
            localStorage.setItem('fiilar_user', JSON.stringify(updatedUser));
        }
    }

    return {
        success: true,
        message: 'Email verified successfully!',
        userId: user.id
    };
};

/**
 * Verify email OTP (Code)
 * SECURITY: Implements rate limiting and secure hash comparison
 */
export const verifyEmailOtp = (email: string, otp: string): VerificationResult => {
    // SECURITY: Check if account is locked out due to too many attempts
    const lockoutStatus = isLockedOut(email);
    if (lockoutStatus.locked) {
        logAuditEvent({
            action: 'OTP_FAILED',
            identifier: email,
            success: false,
            metadata: { reason: 'Account locked', remainingMinutes: lockoutStatus.remainingMinutes }
        });
        return {
            success: false,
            message: `Too many attempts. Please try again in ${lockoutStatus.remainingMinutes} minutes.`,
            lockedUntil: new Date(Date.now() + (lockoutStatus.remainingMinutes || 0) * 60 * 1000).toISOString()
        };
    }

    const user = db.users.find(u => u.email === email);

    if (!user) {
        // SECURITY: Don't reveal whether user exists - use generic message
        recordOtpAttempt(email, false);
        return {
            success: false,
            message: 'Invalid verification code'
        };
    }

    // SECURITY: Verify OTP using hash comparison (not plain text)
    const isValidOtp = user.verificationOtp && verifyHash(otp, user.verificationOtp);
    
    if (!isValidOtp) {
        const attemptResult = recordOtpAttempt(email, false);
        
        logAuditEvent({
            action: 'OTP_FAILED',
            userId: user.id,
            identifier: email,
            success: false,
            metadata: { attemptsRemaining: attemptResult.attemptsRemaining }
        });
        
        if (!attemptResult.allowed) {
            return {
                success: false,
                message: `Too many attempts. Please try again in ${SECURITY_CONFIG.LOCKOUT_DURATION_MINUTES} minutes.`,
                lockedUntil: attemptResult.lockedUntil
            };
        }
        
        return {
            success: false,
            message: 'Invalid verification code',
            attemptsRemaining: attemptResult.attemptsRemaining
        };
    }

    // Check if expired
    if (user.verificationOtpExpiry && isTokenExpired(user.verificationOtpExpiry)) {
        return {
            success: false,
            message: 'Verification code has expired. Please request a new one.'
        };
    }

    // SECURITY: Clear attempt records on success
    clearAttempts(email);

    // Check if already verified
    if (user.emailVerified) {
        logAuditEvent({
            action: 'OTP_VERIFIED',
            userId: user.id,
            identifier: email,
            success: true,
            metadata: { alreadyVerified: true }
        });
        return {
            success: true,
            message: 'Email already verified',
            userId: user.id
        };
    }

    // Verify email
    db.users.update(user.id, {
        emailVerified: true,
        verificationToken: undefined,
        verificationTokenExpiry: undefined,
        verificationOtp: undefined,
        verificationOtpExpiry: undefined
    });

    // Update current user if logged in
    const currentUser = JSON.parse(localStorage.getItem('fiilar_user') || 'null');
    if (currentUser && currentUser.id === user.id) {
        const updatedUser = db.users.findById(user.id);
        if (updatedUser) {
            localStorage.setItem('fiilar_user', JSON.stringify(updatedUser));
        }
    }

    logAuditEvent({
        action: 'OTP_VERIFIED',
        userId: user.id,
        identifier: email,
        success: true
    });

    return {
        success: true,
        message: 'Email verified successfully!',
        userId: user.id
    };
};
