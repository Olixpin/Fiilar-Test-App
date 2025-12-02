import { useState, useEffect, useCallback } from 'react';

interface UserLocation {
    lat: number;
    lng: number;
    city?: string;
    region?: string;
    country?: string;
    displayName?: string;
}

interface UseUserLocationResult {
    location: UserLocation | null;
    isLoading: boolean;
    error: string | null;
    requestLocation: () => void;
    hasPermission: boolean | null;
    isSupported: boolean;
}

// Simple distance calculation using Haversine formula (in km)
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Storage key for caching location
const LOCATION_CACHE_KEY = 'fiilar_user_location';
const LOCATION_CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

function getCachedLocation(): UserLocation | null {
    try {
        const cached = localStorage.getItem(LOCATION_CACHE_KEY);
        if (cached) {
            const { location, timestamp } = JSON.parse(cached);
            // Check if cache is still valid
            if (Date.now() - timestamp < LOCATION_CACHE_EXPIRY) {
                return location;
            }
        }
    } catch {
        // Ignore cache errors
    }
    return null;
}

function setCachedLocation(location: UserLocation): void {
    try {
        localStorage.setItem(
            LOCATION_CACHE_KEY,
            JSON.stringify({ location, timestamp: Date.now() })
        );
    } catch {
        // Ignore cache errors
    }
}

// Reverse geocode using free Nominatim API (OpenStreetMap)
async function reverseGeocode(lat: number, lng: number): Promise<Partial<UserLocation>> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
            {
                headers: {
                    'User-Agent': 'Fiilar-App/1.0' // Required by Nominatim
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Geocoding failed');
        }

        const data = await response.json();
        const address = data.address || {};
        
        // Extract city - try multiple fields
        const city = address.city || address.town || address.village || address.municipality || address.suburb;
        const region = address.state || address.county;
        const country = address.country;

        // Build display name
        let displayName = '';
        if (city) {
            displayName = city;
            if (country) {
                displayName += `, ${country}`;
            }
        } else if (region) {
            displayName = region;
            if (country) {
                displayName += `, ${country}`;
            }
        } else if (country) {
            displayName = country;
        }

        return { city, region, country, displayName };
    } catch (error) {
        console.warn('Reverse geocoding failed:', error);
        return {};
    }
}

export function useUserLocation(): UseUserLocationResult {
    const [location, setLocation] = useState<UserLocation | null>(() => getCachedLocation());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    // Check if geolocation is available
    const isGeolocationAvailable = typeof navigator !== 'undefined' && 'geolocation' in navigator;

    // Check permission status on mount
    useEffect(() => {
        if (!isGeolocationAvailable) {
            setHasPermission(false);
            return;
        }

        // Check permission API if available
        if ('permissions' in navigator) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                setHasPermission(result.state === 'granted');
                
                // Listen for permission changes
                result.onchange = () => {
                    setHasPermission(result.state === 'granted');
                };
            }).catch(() => {
                // Permission API not fully supported, will check on request
            });
        }
    }, [isGeolocationAvailable]);

    const requestLocation = useCallback(() => {
        if (!isGeolocationAvailable) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        // If we have a cached location, use it immediately but still refresh in background
        const cached = getCachedLocation();
        if (cached) {
            setLocation(cached);
        }

        setIsLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude: lat, longitude: lng } = position.coords;
                
                // Get city/region from coordinates
                const geoData = await reverseGeocode(lat, lng);
                
                const newLocation: UserLocation = {
                    lat,
                    lng,
                    ...geoData
                };

                setLocation(newLocation);
                setCachedLocation(newLocation);
                setHasPermission(true);
                setIsLoading(false);
            },
            (err) => {
                setIsLoading(false);
                setHasPermission(false);
                
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setError('Location permission denied');
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setError('Location unavailable');
                        break;
                    case err.TIMEOUT:
                        setError('Location request timed out');
                        break;
                    default:
                        setError('Failed to get location');
                }
            },
            {
                enableHighAccuracy: false, // Faster response, less battery
                timeout: 10000,
                maximumAge: 1000 * 60 * 5 // Accept 5-minute old location
            }
        );
    }, [isGeolocationAvailable]);

    // Auto-request location on mount if permission already granted
    useEffect(() => {
        if (hasPermission === true && !location) {
            requestLocation();
        }
    }, [hasPermission, location, requestLocation]);

    return {
        location,
        isLoading,
        error,
        requestLocation,
        hasPermission,
        isSupported: isGeolocationAvailable
    };
}

export default useUserLocation;
