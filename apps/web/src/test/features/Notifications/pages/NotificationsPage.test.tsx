import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationsPage from '../../../../features/Notifications/pages/NotificationsPage';
import * as storageService from '../../../../services/storage';
import { Notification } from '@fiilar/types';

// Create a mock navigate function
const mockNavigate = vi.fn();

// Mock dependencies
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

vi.mock('../../../../services/storage', () => ({
    getNotifications: vi.fn(),
    markNotificationAsRead: vi.fn(),
    markAllNotificationsAsRead: vi.fn()
}));

describe('NotificationsPage', () => {
    
    // Setup navigate mock
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockNotifications: Notification[] = [
        {
            id: '1',
            userId: 'user1',
            type: 'booking',
            title: 'New Booking Request',
            message: 'John Doe requested to book your listing',
            read: false,
            severity: 'urgent',
            createdAt: new Date(), // Today
            updatedAt: new Date(),
            metadata: { link: '/bookings/123' }
        },
        {
            id: '2',
            userId: 'user1',
            type: 'message',
            title: 'New Message',
            message: 'You have a new message',
            read: true,
            severity: 'info',
            createdAt: new Date(Date.now() - 86400000), // Yesterday
            updatedAt: new Date()
        },
        {
            id: '3',
            userId: 'user1',
            type: 'platform_update',
            title: 'System Update',
            message: 'We have updated our terms',
            read: true,
            severity: 'info',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 - 1000), // Older
            updatedAt: new Date()
        }
    ];

    it('renders empty state when no notifications', () => {
        (storageService.getNotifications as any).mockReturnValue([]);
        render(<NotificationsPage userId="user1" />);
        
        expect(screen.getByText('No notifications')).toBeInTheDocument();
        expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
    });

    it('renders notifications grouped by date', () => {
        (storageService.getNotifications as any).mockReturnValue(mockNotifications);
        render(<NotificationsPage userId="user1" />);
        
        expect(screen.getByText('Today')).toBeInTheDocument();
        expect(screen.getByText('New Booking Request')).toBeInTheDocument();
        
        expect(screen.getByText('Yesterday')).toBeInTheDocument();
        expect(screen.getByText('New Message')).toBeInTheDocument();
        
        expect(screen.getByText('Older')).toBeInTheDocument();
        expect(screen.getByText('System Update')).toBeInTheDocument();
    });

    it('filters notifications correctly', () => {
        (storageService.getNotifications as any).mockReturnValue(mockNotifications);
        render(<NotificationsPage userId="user1" />);
        
        // Default: All
        expect(screen.getAllByText(/New|System/).length).toBe(3);
        
        // Filter: Unread
        fireEvent.click(screen.getByRole('button', { name: /Unread/ }));
        expect(screen.getByText('New Booking Request')).toBeInTheDocument();
        expect(screen.queryByText('New Message')).not.toBeInTheDocument();
        
        // Filter: Urgent
        fireEvent.click(screen.getByRole('button', { name: /Urgent/ }));
        expect(screen.getByText('New Booking Request')).toBeInTheDocument();
        expect(screen.queryByText('System Update')).not.toBeInTheDocument();
        
        // Back to All
        fireEvent.click(screen.getByRole('button', { name: /All/ }));
        expect(screen.getAllByText(/New|System/).length).toBe(3);
    });

    it('handles marking all as read', () => {
        (storageService.getNotifications as any).mockReturnValue(mockNotifications);
        render(<NotificationsPage userId="user1" />);
        
        const markAllBtn = screen.getByText('Mark all as read');
        fireEvent.click(markAllBtn);
        
        expect(storageService.markAllNotificationsAsRead).toHaveBeenCalledWith('user1');
        expect(storageService.getNotifications).toHaveBeenCalledTimes(2); // Initial + after mark all
    });

    it('handles notification click (navigation and read status)', () => {
        (storageService.getNotifications as any).mockReturnValue(mockNotifications);
        render(<NotificationsPage userId="user1" />);
        
        // Click unread notification
        fireEvent.click(screen.getByText('New Booking Request'));
        
        expect(storageService.markNotificationAsRead).toHaveBeenCalledWith('1');
        expect(mockNavigate).toHaveBeenCalledWith('/bookings/123');
        
        // Click read notification (should not call markAsRead again, but should navigate)
        // Note: The component logic calls markAsRead only if !notification.read
        // But navigation happens regardless
    });

    it('handles damage report navigation', () => {
        const damageReportNotif = {
            ...mockNotifications[0],
            id: '4',
            type: 'damage_report',
            metadata: { reportId: 'rep_123' }
        };
        (storageService.getNotifications as any).mockReturnValue([damageReportNotif]);
        
        render(<NotificationsPage userId="user1" />);
        
        fireEvent.click(screen.getByText('New Booking Request'));
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard?tab=notifications&reportId=rep_123');
    });

    it('deletes a notification', () => {
        (storageService.getNotifications as any).mockReturnValue(mockNotifications);
        render(<NotificationsPage userId="user1" />);
        
        const deleteButtons = screen.getAllByTitle('Delete notification');
        fireEvent.click(deleteButtons[0]);
        
        expect(screen.queryByText('New Booking Request')).not.toBeInTheDocument();
    });

    it('navigates to preferences', () => {
        (storageService.getNotifications as any).mockReturnValue([]);
        render(<NotificationsPage userId="user1" />);
        
        fireEvent.click(screen.getByText('Preferences'));
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard?tab=settings');
    });

    it('renders correct icons and badges for different types and severities', () => {
        const variedNotifications: Notification[] = [
            {
                ...mockNotifications[0],
                id: '10',
                type: 'review',
                title: 'New Review',
                severity: 'warning',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago (This Week)
            },
            {
                ...mockNotifications[0],
                id: '11',
                type: 'unknown' as any, // Default icon
                title: 'Unknown Type',
                severity: 'info',
                createdAt: new Date()
            }
        ];
        (storageService.getNotifications as any).mockReturnValue(variedNotifications);
        render(<NotificationsPage userId="user1" />);

        // Check for 'This Week' label
        expect(screen.getByText('This Week')).toBeInTheDocument();

        // Check for Warning badge
        expect(screen.getByText('Warning')).toBeInTheDocument();

        // Check for Review icon (Star)
        const reviewCard = screen.getByText('New Review').closest('.bg-white');
        const starIcon = reviewCard?.querySelector('.text-yellow-600');
        expect(starIcon).toBeInTheDocument();
        
        // Check for Unknown Type
        expect(screen.getByText('Unknown Type')).toBeInTheDocument();
    });
});
