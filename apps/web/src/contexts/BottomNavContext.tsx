import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BottomNavContextType {
    isBottomNavVisible: boolean;
    hideBottomNav: () => void;
    showBottomNav: () => void;
}

const BottomNavContext = createContext<BottomNavContextType | undefined>(undefined);

export const BottomNavProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);

    const hideBottomNav = () => setIsBottomNavVisible(false);
    const showBottomNav = () => setIsBottomNavVisible(true);

    return (
        <BottomNavContext.Provider value={{ isBottomNavVisible, hideBottomNav, showBottomNav }}>
            {children}
        </BottomNavContext.Provider>
    );
};

export const useBottomNav = (): BottomNavContextType => {
    const context = useContext(BottomNavContext);
    // Return safe defaults if context not available (don't crash)
    if (!context) {
        return {
            isBottomNavVisible: true,
            hideBottomNav: () => {},
            showBottomNav: () => {},
        };
    }
    return context;
};
