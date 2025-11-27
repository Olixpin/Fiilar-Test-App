import { useState, useEffect, useCallback, useRef } from 'react';

interface BatchLoaderState {
  isLoading: boolean;
  loadedImages: Set<string>;
  failedImages: Set<string>;
}

/**
 * Hook to preload a batch of images before showing them
 * Ensures all images in a row load together for consistent UX
 */
export const useBatchImageLoader = (imageUrls: string[], batchSize: number = 4) => {
  const [state, setState] = useState<BatchLoaderState>({
    isLoading: true,
    loadedImages: new Set(),
    failedImages: new Set(),
  });
  
  const loadedRef = useRef(new Set<string>());
  const failedRef = useRef(new Set<string>());

  const preloadImage = useCallback((url: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!url || loadedRef.current.has(url) || failedRef.current.has(url)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        loadedRef.current.add(url);
        resolve();
      };
      img.onerror = () => {
        failedRef.current.add(url);
        resolve();
      };
      img.src = url;
    });
  }, []);

  useEffect(() => {
    if (imageUrls.length === 0) {
      setState({ isLoading: false, loadedImages: new Set(), failedImages: new Set() });
      return;
    }

    // Preload first batch (visible row)
    const firstBatch = imageUrls.slice(0, batchSize);
    
    Promise.all(firstBatch.map(preloadImage)).then(() => {
      setState({
        isLoading: false,
        loadedImages: new Set(loadedRef.current),
        failedImages: new Set(failedRef.current),
      });
    });

    // Preload remaining images in background
    const remaining = imageUrls.slice(batchSize);
    remaining.forEach((url, index) => {
      setTimeout(() => preloadImage(url), (index + 1) * 100);
    });
  }, [imageUrls, batchSize, preloadImage]);

  const isImageReady = useCallback((url: string) => {
    return state.loadedImages.has(url);
  }, [state.loadedImages]);

  const hasImageFailed = useCallback((url: string) => {
    return state.failedImages.has(url);
  }, [state.failedImages]);

  return {
    isLoading: state.isLoading,
    isImageReady,
    hasImageFailed,
  };
};

/**
 * Simple hook for individual image loading with callback
 */
export const useImageLoader = (imageUrl: string | undefined) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setHasError(true);
      return;
    }

    setIsLoaded(false);
    setHasError(false);

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => {
      setIsLoaded(true);
      setHasError(true);
    };
    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  return { isLoaded, hasError };
};
