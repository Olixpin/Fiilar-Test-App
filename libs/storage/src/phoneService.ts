import { db } from './mockDb';
import { Role } from '@fiilar/types';
import { generateOTP, getOtpExpiry, isTokenExpired, VerificationResult } from './emailService';
import {
    hashString,
    verifyHash,
    isLockedOut,
    recordOtpAttempt,
    clearAttempts,
    logAuditEvent,
    SECURITY_CONFIG,
} from './security/authSecurity';

/**
 * Send verification SMS (mock implementation)
 * SECURITY: OTP is hashed before storage
 */
export const sendVerificationSms = (phone: string): string => {
    const otp = generateOTP();
    const otpExpiry = getOtpExpiry();

    // Normalize phone number (remove spaces, etc.)
    const normalizedPhone = phone.replace(/\s+/g, '');
    
    // SECURITY: Hash OTP before storing
    const hashedOtp = hashString(otp);

    // Update user with HASHED OTP
    let user = db.users.find(u => u.phone === normalizedPhone);

    if (!user) {
        // Create a new user for verification purposes if not found
        const newUser = {
            id: 'user_' + Date.now(),
            name: '',
            email: '', // Email might be empty if signing up via phone
            password: '',
            role: Role.USER,
            isHost: false,
            createdAt: new Date().toISOString(),
            kycVerified: false,
            walletBalance: 0,
            avatar: '',
            favorites: [],
            authProvider: 'phone' as const,
            emailVerified: false,
            phoneVerified: false,
            phone: normalizedPhone,
            verificationOtp: hashedOtp, // SECURITY: Store hash, not plain OTP
            verificationOtpExpiry: otpExpiry
        };
        db.users.create(newUser);
        
        logAuditEvent({
            action: 'OTP_SENT',
            userId: newUser.id,
            success: true,
            metadata: {
                channel: 'phone',
                phone: normalizedPhone.slice(-4) // Log only last 4 digits for privacy
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
                channel: 'phone',
                phone: normalizedPhone.slice(-4)
            }
        });
    }

    console.log('📱 Verification SMS (Mock)');
    console.log('To:', normalizedPhone);
    console.log('Your Verification Code:', otp);
    console.log(`
    [Fiilar] Your verification code is ${otp}. Do not share this code with anyone.
  `);

    return otp;
};

/**
 * Verify phone OTP
 * SECURITY: Implements rate limiting and secure hash comparison
 */
export const verifyPhoneOtp = (phone: string, otp: string): VerificationResult => {
    const normalizedPhone = phone.replace(/\s+/g, '');
    
    // SECURITY: Check if account is locked out
    const lockoutStatus = isLockedOut(normalizedPhone);
    if (lockoutStatus.locked) {
        logAuditEvent({
            action: 'OTP_FAILED',
            identifier: normalizedPhone,
            success: false,
            metadata: { reason: 'Account locked', remainingMinutes: lockoutStatus.remainingMinutes }
        });
        return {
            success: false,
            message: `Too many attempts. Please try again in ${lockoutStatus.remainingMinutes} minutes.`,
            lockedUntil: new Date(Date.now() + (lockoutStatus.remainingMinutes || 0) * 60 * 1000).toISOString()
        };
    }

    const user = db.users.find(u => u.phone === normalizedPhone);

    if (!user) {
        // SECURITY: Don't reveal whether user exists
        recordOtpAttempt(normalizedPhone, false);
        return {
            success: false,
            message: 'Invalid verification code'
        };
    }

    // SECURITY: Verify OTP using hash comparison
    const isValidOtp = user.verificationOtp && verifyHash(otp, user.verificationOtp);
    
    if (!isValidOtp) {
        const attemptResult = recordOtpAttempt(normalizedPhone, false);
        
        logAuditEvent({
            action: 'OTP_FAILED',
            userId: user.id,
            identifier: normalizedPhone,
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
    clearAttempts(normalizedPhone);

    // Verify phone
    db.users.update(user.id, {
        phoneVerified: true,
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
        identifier: normalizedPhone,
        success: true
    });

    return {
        success: true,
        message: 'Phone number verified successfully!',
        userId: user.id
    };
};
