import { db } from './mockDb';
import { Role } from '@fiilar/types';

export interface VerificationResult {
    success: boolean;
    message: string;
    userId?: string;
}

/**
 * Generate a random verification token
 */
export const generateVerificationToken = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
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
 * Get OTP expiry time (10 minutes from now)
 */
export const getOtpExpiry = (): string => {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);
    return expiry.toISOString();
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
 */
export const sendVerificationEmail = (email: string, _token: string, userName: string): string => {
    const otp = generateOTP();
    const otpExpiry = getOtpExpiry();

    // Update user with OTP
    let user = db.users.find(u => u.email === email);

    if (!user) {
        // Create a new user for verification purposes
        user = {
            id: 'user_' + Date.now(),
            name: userName || 'New User',
            email: email,
            password: '',
            role: Role.USER,
            isHost: false,
            createdAt: new Date().toISOString(),
            kycVerified: false,
            walletBalance: 0,
            avatar: '',
            favorites: [],
            authProvider: 'email',
            emailVerified: false,
            phoneVerified: false,
            verificationOtp: otp,
            verificationOtpExpiry: otpExpiry
        };
        db.users.create(user);
    } else {
        db.users.update(user.id, {
            verificationOtp: otp,
            verificationOtpExpiry: otpExpiry
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

    // Update user
    db.users.update(userId, {
        verificationToken: newToken,
        verificationTokenExpiry: newExpiry,
        verificationOtp: newOtp,
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
 */
export const verifyEmailOtp = (email: string, otp: string): VerificationResult => {
    const user = db.users.find(u => u.email === email);

    if (!user) {
        return {
            success: false,
            message: 'User not found'
        };
    }

    // Check OTP first (even if already verified, validate the code)
    if (user.verificationOtp !== otp) {
        return {
            success: false,
            message: 'Invalid verification code'
        };
    }

    // Check if expired
    if (user.verificationOtpExpiry && isTokenExpired(user.verificationOtpExpiry)) {
        return {
            success: false,
            message: 'Verification code has expired. Please request a new one.'
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
