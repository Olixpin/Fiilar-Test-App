import { getLocaleConfig } from '../config/locale';

/**
 * Format a number as currency based on current locale
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string
 * 
 * @example
 * // In Nigeria: formatCurrency(10000) => "₦10K"
 * // In Ghana: formatCurrency(10000) => "GH₵10K"
 * // In Kenya: formatCurrency(10000) => "KSh 10K"
 */
export const formatCurrency = (
    amount: number,
    options?: {
        compact?: boolean;
        showSymbol?: boolean;
        decimals?: number;
    }
): string => {
    const { compact = false, showSymbol = true, decimals } = options || {};
    const config = getLocaleConfig();

    // Determine decimal places
    const minimumFractionDigits = decimals ?? 0;
    const maximumFractionDigits = decimals ?? (compact ? 1 : 2);

    // Use compact notation for amounts >= 1000
    if (compact && amount >= 1000) {
        const formatted = new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: config.currency,
            notation: 'compact',
            minimumFractionDigits,
            maximumFractionDigits,
        }).format(amount);
        return formatted;
    }

    // Standard formatting
    const formatted = new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency,
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(amount);

    return showSymbol ? formatted : formatted.replace(new RegExp(`${config.currencySymbol}|${config.currency}\\s?`, 'g'), '');
};

/**
 * Legacy alias for backwards compatibility
 * @deprecated Use formatCurrency instead
 */
export const formatNaira = formatCurrency;

/**
 * Get the current currency symbol
 * @returns Currency symbol (e.g., "₦", "GH₵", "KSh")
 */
export const getCurrencySymbol = (): string => {
    return getLocaleConfig().currencySymbol;
};

/**
 * Get the current currency code
 * @returns Currency code (e.g., "NGN", "GHS", "KES")
 */
export const getCurrencyCode = (): string => {
    return getLocaleConfig().currency;
};
