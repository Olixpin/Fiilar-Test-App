/**
 * Locale Configuration System
 * Centralized configuration for multi-country support
 */

export type SupportedCountry = 'NG' | 'GH' | 'KE' | 'ZA' | 'UG';

export interface LocaleConfig {
    country: SupportedCountry;
    countryName: string;
    currency: string;
    currencySymbol: string;
    locale: string; // For Intl.NumberFormat
    timezone: string;
    dateFormat: string;
}

export const LOCALE_CONFIGS: Record<SupportedCountry, LocaleConfig> = {
    NG: {
        country: 'NG',
        countryName: 'Nigeria',
        currency: 'NGN',
        currencySymbol: '₦',
        locale: 'en-NG',
        timezone: 'Africa/Lagos',
        dateFormat: 'DD/MM/YYYY',
    },
    GH: {
        country: 'GH',
        countryName: 'Ghana',
        currency: 'GHS',
        currencySymbol: 'GH₵',
        locale: 'en-GH',
        timezone: 'Africa/Accra',
        dateFormat: 'DD/MM/YYYY',
    },
    KE: {
        country: 'KE',
        countryName: 'Kenya',
        currency: 'KES',
        currencySymbol: 'KSh',
        locale: 'en-KE',
        timezone: 'Africa/Nairobi',
        dateFormat: 'DD/MM/YYYY',
    },
    ZA: {
        country: 'ZA',
        countryName: 'South Africa',
        currency: 'ZAR',
        currencySymbol: 'R',
        locale: 'en-ZA',
        timezone: 'Africa/Johannesburg',
        dateFormat: 'YYYY/MM/DD',
    },
    UG: {
        country: 'UG',
        countryName: 'Uganda',
        currency: 'UGX',
        currencySymbol: 'USh',
        locale: 'en-UG',
        timezone: 'Africa/Kampala',
        dateFormat: 'DD/MM/YYYY',
    },
};

// Default locale (Nigeria)
export const DEFAULT_LOCALE: SupportedCountry = 'NG';

// Get current locale from environment or localStorage
export const getCurrentLocale = (): SupportedCountry => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('fiilar_locale') as SupportedCountry;
        if (stored && LOCALE_CONFIGS[stored]) {
            return stored;
        }
    }
    return DEFAULT_LOCALE;
};

// Set locale
export const setCurrentLocale = (country: SupportedCountry): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('fiilar_locale', country);
        // Trigger a custom event for React components to listen to
        window.dispatchEvent(new CustomEvent('localeChange', { detail: country }));
    }
};

// Get current locale config
export const getLocaleConfig = (): LocaleConfig => {
    return LOCALE_CONFIGS[getCurrentLocale()];
};
