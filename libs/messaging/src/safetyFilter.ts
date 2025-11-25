export interface SafetyCheckResult {
    isSafe: boolean;
    flaggedReason?: 'inappropriate_content' | 'contact_info_sharing' | 'spam' | 'other';
    flaggedContent?: string;
}

const INAPPROPRIATE_KEYWORDS = [
    'scam', 'fraud', 'money laundering', 'drug', 'weapon', 'hate', 'kill', 'attack'
];

const CONTACT_INFO_PATTERNS = [
    /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi, // Email
    /\b(\+?\d{1,3}[- ]?)?\d{10}\b/g, // Phone (simple 10 digit)
    /\b(\+?\d{1,3}[- ]?)?\d{3}[- ]?\d{3}[- ]?\d{4}\b/g, // Phone (formatted)
    /whatsapp/i,
    /telegram/i,
    /phone number/i,
    /email address/i
];

export const checkMessageSafety = (content: string): SafetyCheckResult => {
    const lowerContent = content.toLowerCase();

    // Check for inappropriate keywords
    for (const keyword of INAPPROPRIATE_KEYWORDS) {
        if (lowerContent.includes(keyword)) {
            return {
                isSafe: false,
                flaggedReason: 'inappropriate_content',
                flaggedContent: keyword
            };
        }
    }

    // Check for contact info sharing (basic regex)
    for (const pattern of CONTACT_INFO_PATTERNS) {
        if (pattern.test(content)) {
            return {
                isSafe: false,
                flaggedReason: 'contact_info_sharing',
                flaggedContent: 'Potential contact information detected'
            };
        }
    }

    // Basic spam check (repeated characters or too short/long)
    if (content.length > 2000) {
        return {
            isSafe: false,
            flaggedReason: 'spam',
            flaggedContent: 'Message too long'
        };
    }

    return { isSafe: true };
};
