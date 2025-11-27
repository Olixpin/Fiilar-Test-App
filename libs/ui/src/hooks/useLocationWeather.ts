import { useLocale } from '../LocaleContext';
import { SupportedCountry } from '@fiilar/utils';
import { Sun, Cloud, CloudRain, Wind } from 'lucide-react';
import React from 'react';

export interface LocationWeather {
    city: string;
    temp: string;
    condition: string;
    icon: React.ElementType;
}

const LOCATION_DEFAULTS: Record<SupportedCountry, LocationWeather> = {
    NG: { city: 'Lagos, Nigeria', temp: '32°C', condition: 'Sunny', icon: Sun },
    GH: { city: 'Accra, Ghana', temp: '30°C', condition: 'Partly Cloudy', icon: Cloud },
    KE: { city: 'Nairobi, Kenya', temp: '24°C', condition: 'Cloudy', icon: Cloud },
    ZA: { city: 'Cape Town, South Africa', temp: '22°C', condition: 'Windy', icon: Wind },
    UG: { city: 'Kampala, Uganda', temp: '26°C', condition: 'Rain', icon: CloudRain },
};

export const useLocationWeather = (): LocationWeather => {
    const { country } = useLocale();
    return LOCATION_DEFAULTS[country] || LOCATION_DEFAULTS['NG'];
};
