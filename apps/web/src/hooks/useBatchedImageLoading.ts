import { useState, useCallback, useEffect, useRef } from 'react';

interface UseBatchedImageLoadingOptions {
  /** Number of items per batch (default: 8) */
  batchSize?: number;
  /** IntersectionObserver root margin (default: '100px') */
  rootMargin?: string;
}

interface UseBatchedImageLoadingResult<T extends { id: string }> {
  /** Items currently visible (sliced from full list) */
  visibleItems: T[];
  /** Callback to pass to ListingCard's onImageLoad prop */
  handleImageLoad: (id: string) => void;
  /** Check if a batch is ready to display */
  isBatchReady: (index: number) => boolean;
  /** Check if an item is in the priority (first) batch */
  isPriority: (index: number) => boolean;
  /** Get the index within the batch for stagger animations */
  getBatchIndex: (index: number) => number;
  /** Ref to attach to the infinite scroll sentinel element */
  loadMoreRef: React.RefObject<HTMLDivElement>;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Reset the loading state (useful when items change) */
  reset: () => void;
}

/**
 * Custom hook for batched image loading with infinite scroll.
 * 
 * This hook manages the loading of images in batches, showing skeleton loaders
 * until all images in a batch are loaded, then revealing them together.
 * 
 * @example
 * ```tsx
 * const { 
 *   visibleItems, 
 *   handleImageLoad, 
 *   isBatchReady, 
 *   isPriority, 
 *   getBatchIndex,
 *   loadMoreRef,
 *   hasMore 
 * } = useBatchedImageLoading(listings);
 * 
 * return (
 *   <>
 *     <div className="grid grid-cols-3 gap-4">
 *       {visibleItems.map((item, index) => (
 *         <ListingCard
 *           key={item.id}
 *           listing={item}
 *           priority={isPriority(index)}
 *           index={getBatchIndex(index)}
 *           onImageLoad={handleImageLoad}
 *           batchReady={isBatchReady(index)}
 *         />
 *       ))}
 *     </div>
 *     {hasMore && <div ref={loadMoreRef} className="h-10" />}
 *   </>
 * );
 * ```
 */
export function useBatchedImageLoading<T extends { id: string }>(
  items: T[],
  options: UseBatchedImageLoadingOptions = {}
): UseBatchedImageLoadingResult<T> {
  const { batchSize = 8, rootMargin = '100px' } = options;

  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [readyBatches, setReadyBatches] = useState<Set<number>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Reset state when items change significantly
  const reset = useCallback(() => {
    setVisibleCount(batchSize);
    setLoadedImages(new Set());
    setReadyBatches(new Set());
  }, [batchSize]);

  // Handle image load callback
  const handleImageLoad = useCallback((id: string) => {
    setLoadedImages(prev => new Set(prev).add(id));
  }, []);

  // Check if batches are complete and mark them ready
  useEffect(() => {
    const visibleItems = items.slice(0, visibleCount);
    const newReadyBatches = new Set(readyBatches);

    for (let batchIndex = 0; batchIndex * batchSize < visibleItems.length; batchIndex++) {
      if (readyBatches.has(batchIndex)) continue;

      const batchStart = batchIndex * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, visibleItems.length);
      const batchItems = visibleItems.slice(batchStart, batchEnd);

      const allLoaded = batchItems.every(item => loadedImages.has(item.id));

      if (allLoaded) {
        newReadyBatches.add(batchIndex);
      }
    }

    if (newReadyBatches.size !== readyBatches.size) {
      setReadyBatches(newReadyBatches);
    }
  }, [loadedImages, items, visibleCount, readyBatches, batchSize]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < items.length) {
          setVisibleCount(prev => Math.min(prev + batchSize, items.length));
        }
      },
      { rootMargin }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [items.length, visibleCount, batchSize, rootMargin]);

  // Helper functions
  const isBatchReady = useCallback(
    (index: number) => readyBatches.has(Math.floor(index / batchSize)),
    [readyBatches, batchSize]
  );

  const isPriority = useCallback(
    (index: number) => index < batchSize,
    [batchSize]
  );

  const getBatchIndex = useCallback(
    (index: number) => index % batchSize,
    [batchSize]
  );

  return {
    visibleItems: items.slice(0, visibleCount),
    handleImageLoad,
    isBatchReady,
    isPriority,
    getBatchIndex,
    loadMoreRef: loadMoreRef as React.RefObject<HTMLDivElement>,
    hasMore: visibleCount < items.length,
    reset,
  };
}

export default useBatchedImageLoading;
