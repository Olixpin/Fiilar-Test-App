/**
 * Generates a 6-character alphanumeric verification code.
 * Format: XXXXXX (e.g., A7B29X)
 * Used for the "Digital Handshake" protocol.
 */
export const generateVerificationCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes I, O, 0, 1 to avoid confusion
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};
