import { db } from './mockDb';
import { User, Role } from '@fiilar/types';
import { generateOTP, getOtpExpiry, isTokenExpired, VerificationResult } from './emailService';

/**
 * Send verification SMS (mock implementation)
 */
export const sendVerificationSms = (phone: string): string => {
    const otp = generateOTP();
    const otpExpiry = getOtpExpiry();

    // Normalize phone number (remove spaces, etc.)
    const normalizedPhone = phone.replace(/\s+/g, '');

    // Update user with OTP
    let user = db.users.find(u => u.phone === normalizedPhone);
    
    if (!user) {
        // Create a new user for verification purposes if not found
        // Note: In a real app, you might want to check if email exists first or handle this differently
        user = {
            id: 'user_' + Date.now(),
            name: 'New User',
            email: '', // Email might be empty if signing up via phone
            password: '',
            role: Role.USER,
            isHost: false,
            createdAt: new Date().toISOString(),
            kycVerified: false,
            walletBalance: 0,
            avatar: '',
            favorites: [],
            authProvider: 'phone',
            emailVerified: false,
            phoneVerified: false,
            phone: normalizedPhone,
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
 */
export const verifyPhoneOtp = (phone: string, otp: string): VerificationResult => {
    const normalizedPhone = phone.replace(/\s+/g, '');
    const user = db.users.find(u => u.phone === normalizedPhone);

    if (!user) {
        return {
            success: false,
            message: 'User not found'
        };
    }

    // Check OTP
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

    return {
        success: true,
        message: 'Phone number verified successfully!',
        userId: user.id
    };
};
