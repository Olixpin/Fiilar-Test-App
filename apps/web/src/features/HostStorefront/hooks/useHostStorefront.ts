/**
 * useHostStorefront Hook
 * 
 * Fetches and manages host storefront data from a short code.
 * Handles loading states, errors, and analytics tracking.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { HostStorefrontData } from '@fiilar/types';
import { 
  getHostStorefrontByCode, 
  getAllUsers, 
  getListings,
  recordShareLinkClick 
} from '@fiilar/storage';

interface UseHostStorefrontResult {
  data: HostStorefrontData | null;
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
  refetch: () => void;
  recordClick: () => void;
}

export const useHostStorefront = (shortCode: string | undefined): UseHostStorefrontResult => {
  const [data, setData] = useState<HostStorefrontData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const hasRecordedClick = useRef(false);

  const fetchStorefront = useCallback(() => {
    if (!shortCode) {
      setError('No short code provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setNotFound(false);

    try {
      // Simulate slight network delay for UX consistency
      setTimeout(() => {
        const storefrontData = getHostStorefrontByCode(
          shortCode,
          getAllUsers,
          getListings
        );

        if (!storefrontData) {
          setNotFound(true);
          setData(null);
        } else {
          setData(storefrontData);
        }
        
        setIsLoading(false);
      }, 300);
    } catch (err) {
      console.error('Error fetching storefront:', err);
      setError('Failed to load host profile');
      setIsLoading(false);
    }
  }, [shortCode]);

  // Record click for analytics (only once per page load)
  const recordClick = useCallback(() => {
    if (shortCode && !hasRecordedClick.current) {
      hasRecordedClick.current = true;
      recordShareLinkClick(shortCode);
    }
  }, [shortCode]);

  useEffect(() => {
    fetchStorefront();
  }, [fetchStorefront]);

  // Listen for listing updates to refresh data
  useEffect(() => {
    const handleListingsUpdate = () => {
      if (data) {
        fetchStorefront();
      }
    };

    window.addEventListener('fiilar:listings-updated', handleListingsUpdate);
    return () => {
      window.removeEventListener('fiilar:listings-updated', handleListingsUpdate);
    };
  }, [data, fetchStorefront]);

  return {
    data,
    isLoading,
    error,
    notFound,
    refetch: fetchStorefront,
    recordClick,
  };
};

export default useHostStorefront;
