// Email Verification Service
// Handles email verification token generation and validation

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
 * Get token expiry time (24 hours from now)
 */
export const getTokenExpiry = (): string => {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
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
export const sendVerificationEmail = (email: string, token: string, userName: string): void => {
    const verificationLink = `${window.location.origin}/verify-email?token=${token}`;

    console.log('📧 Verification Email (Mock)');
    console.log('To:', email);
    console.log('Subject: Verify your Fiilar email address');
    console.log('Link:', verificationLink);
    console.log(`
    Hi ${userName},
    
    Welcome to Fiilar! Please verify your email address by clicking the link below:
    
    ${verificationLink}
    
    This link will expire in 24 hours.
    
    If you didn't create an account, please ignore this email.
    
    Best regards,
    The Fiilar Team
  `);

    // In production, you would call your email API here
    // await emailService.send({
    //   to: email,
    //   subject: 'Verify your Fiilar email address',
    //   html: emailTemplate
    // });
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = (userId: string): boolean => {
    const users = JSON.parse(localStorage.getItem('fiilar_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === userId);

    if (userIndex === -1) return false;

    const user = users[userIndex];

    // Generate new token
    const newToken = generateVerificationToken();
    const newExpiry = getTokenExpiry();

    // Update user
    users[userIndex] = {
        ...user,
        verificationToken: newToken,
        verificationTokenExpiry: newExpiry
    };

    localStorage.setItem('fiilar_users', JSON.stringify(users));

    // Send email
    sendVerificationEmail(user.email, newToken, user.name);

    return true;
};

/**
 * Verify email token
 */
export const verifyEmailToken = (token: string): VerificationResult => {
    const users = JSON.parse(localStorage.getItem('fiilar_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.verificationToken === token);

    if (userIndex === -1) {
        return {
            success: false,
            message: 'Invalid verification token'
        };
    }

    const user = users[userIndex];

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
    users[userIndex] = {
        ...user,
        emailVerified: true,
        verificationToken: undefined,
        verificationTokenExpiry: undefined
    };

    localStorage.setItem('fiilar_users', JSON.stringify(users));

    // Update current user if logged in
    const currentUser = JSON.parse(localStorage.getItem('fiilar_user') || 'null');
    if (currentUser && currentUser.id === user.id) {
        localStorage.setItem('fiilar_user', JSON.stringify(users[userIndex]));
    }

    return {
        success: true,
        message: 'Email verified successfully!',
        userId: user.id
    };
};
