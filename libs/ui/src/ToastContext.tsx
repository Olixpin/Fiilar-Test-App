import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Toast } from './Toast';

export interface ToastOptions {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
}

interface ToastContextType {
    showToast: (options: ToastOptions) => void;
    hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastItem extends ToastOptions {
    id: string;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback(({ message, type = 'success', duration = 3000 }: ToastOptions) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            {createPortal(
                <div className="fixed top-4 right-4 z-[2147483647] flex flex-col gap-2 pointer-events-none">
                    {toasts.map((toast) => (
                        <div key={toast.id} className="pointer-events-auto">
                            <Toast
                                show={true}
                                message={toast.message}
                                type={toast.type}
                                duration={toast.duration}
                                onClose={() => hideToast(toast.id)}
                            />
                        </div>
                    ))}
                </div>,
                document.getElementById('toast-root') || document.body
            )}
        </ToastContext.Provider>
    );
};
