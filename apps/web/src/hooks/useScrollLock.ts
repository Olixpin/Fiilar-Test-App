import { useEffect } from 'react';

/**
 * Hook to lock the body scroll when a modal is open.
 * @param isOpen - Whether the modal is open
 */
export const useScrollLock = (isOpen: boolean) => {
    useEffect(() => {
        if (isOpen) {
            // Save original overflow style
            const originalStyle = window.getComputedStyle(document.body).overflow;

            // Prevent scrolling
            document.body.style.overflow = 'hidden';

            // Re-enable scrolling when component unmounts or isOpen becomes false
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);
};
