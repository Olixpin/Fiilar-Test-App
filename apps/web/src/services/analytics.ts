// Analytics service for tracking user events and errors

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];
    }
}

export const analytics = {
    // Initialize analytics (call this in main App)
    init: (measurementId?: string) => {
        if (typeof window === 'undefined') return;
        
        // Google Analytics 4 setup (optional - add your GA4 ID)
        if (measurementId) {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            window.gtag = function() {
                window.dataLayer?.push(arguments);
            };
            window.gtag('js', new Date());
            window.gtag('config', measurementId);
        }
    },

    // Track page views
    pageView: (path: string) => {
        if (window.gtag) {
            window.gtag('event', 'page_view', { page_path: path });
        }
        console.log('[Analytics] Page view:', path);
    },

    // Track custom events
    event: (eventName: string, params?: Record<string, any>) => {
        if (window.gtag) {
            window.gtag('event', eventName, params);
        }
        console.log('[Analytics] Event:', eventName, params);
    },

    // Track errors
    error: (error: Error, context?: string) => {
        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: `${context ? context + ': ' : ''}${error.message}`,
                fatal: false
            });
        }
        console.error('[Analytics] Error:', context, error);
    },

    // Track user actions
    trackBooking: (listingId: string, amount: number) => {
        analytics.event('booking_created', {
            listing_id: listingId,
            value: amount,
            currency: 'USD'
        });
    },

    trackListingCreated: (listingId: string) => {
        analytics.event('listing_created', { listing_id: listingId });
    },

    trackSearch: (query: string) => {
        analytics.event('search', { search_term: query });
    },

    trackSignup: (method: string) => {
        analytics.event('sign_up', { method });
    },

    trackLogin: (method: string) => {
        analytics.event('login', { method });
    }
};
