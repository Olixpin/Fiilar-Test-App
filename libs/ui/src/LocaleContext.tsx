import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedCountry, getLocaleConfig, getCurrentLocale, setCurrentLocale, LocaleConfig } from '@fiilar/utils';

interface LocaleContextType {
    locale: LocaleConfig;
    country: SupportedCountry;
    setCountry: (country: SupportedCountry) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [country, setCountryState] = useState<SupportedCountry>(getCurrentLocale());
    const [locale, setLocale] = useState<LocaleConfig>(getLocaleConfig());

    const setCountry = (newCountry: SupportedCountry) => {
        setCurrentLocale(newCountry);
        setCountryState(newCountry);
        setLocale(getLocaleConfig());
    };

    // Listen for locale changes from other tabs/windows
    useEffect(() => {
        const handleLocaleChange = (event: CustomEvent<SupportedCountry>) => {
            setCountryState(event.detail);
            setLocale(getLocaleConfig());
        };

        window.addEventListener('localeChange', handleLocaleChange as EventListener);
        return () => {
            window.removeEventListener('localeChange', handleLocaleChange as EventListener);
        };
    }, []);

    return (
        <LocaleContext.Provider value={{ locale, country, setCountry }}>
            {children}
        </LocaleContext.Provider>
    );
};

export const useLocale = (): LocaleContextType => {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
};
