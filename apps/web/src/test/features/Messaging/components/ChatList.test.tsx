import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChatList } from '../../../../features/Messaging/components/ChatList';
import * as storageService from '../../../../services/storage';
import { User, Conversation, Message } from '@fiilar/types';

// Mock the storage service
vi.mock('../../../../services/storage', () => ({
    getAllUsers: vi.fn(),
    getConversations: vi.fn()
}));

describe('ChatList', () => {
    const mockUser: User = {
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'guest',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockOtherUser: User = {
        id: 'user2',
        name: 'Other User',
        email: 'other@example.com',
        role: 'host',
        avatar: 'avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockConversation: Conversation = {
        id: 'conv1',
        participants: ['user1', 'user2'],
        lastMessage: {
            id: 'msg1',
            conversationId: 'conv1',
            senderId: 'user2',
            content: 'Hello there',
            timestamp: new Date(),
            read: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const defaultProps = {
        currentUserId: 'user1',
        onSelect: vi.fn(),
        selectedId: undefined
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        (storageService.getAllUsers as any).mockReturnValue([mockUser, mockOtherUser]);
        (storageService.getConversations as any).mockReturnValue([]);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders empty state when no conversations exist', () => {
        render(<ChatList {...defaultProps} />);
        expect(screen.getByText('No messages yet.')).toBeInTheDocument();
    });

    it('renders conversations list correctly', () => {
        (storageService.getConversations as any).mockReturnValue([mockConversation]);
        
        render(<ChatList {...defaultProps} />);
        
        expect(screen.getByText('Messages')).toBeInTheDocument();
        expect(screen.getByText('Other User')).toBeInTheDocument();
        expect(screen.getByText('Hello there')).toBeInTheDocument();
    });

    it('handles conversation selection', () => {
        (storageService.getConversations as any).mockReturnValue([mockConversation]);
        
        render(<ChatList {...defaultProps} />);
        
        const convItem = screen.getByText('Other User').closest('div.cursor-pointer');
        fireEvent.click(convItem!);
        
        expect(defaultProps.onSelect).toHaveBeenCalledWith('conv1');
    });

    it('shows unread indicator for unread messages from others', () => {
        (storageService.getConversations as any).mockReturnValue([mockConversation]);
        
        render(<ChatList {...defaultProps} />);
        
        // The unread indicator is a red dot (absolute positioned div)
        // We can check if the message text is bold/darker which indicates unread state in the component
        const messageText = screen.getByText('Hello there');
        expect(messageText).toHaveClass('font-semibold');
        expect(messageText).toHaveClass('text-gray-900');
    });

    it('does not show unread indicator for own messages', () => {
        const ownMsgConversation = {
            ...mockConversation,
            lastMessage: {
                ...mockConversation.lastMessage!,
                senderId: 'user1', // Me
                read: false
            }
        };
        (storageService.getConversations as any).mockReturnValue([ownMsgConversation]);
        
        render(<ChatList {...defaultProps} />);
        
        const messageText = screen.getByText('Hello there');
        expect(messageText).not.toHaveClass('font-semibold');
        expect(screen.getByText('You:')).toBeInTheDocument();
    });

    it('polls for updates', () => {
        (storageService.getConversations as any).mockReturnValue([]);
        
        render(<ChatList {...defaultProps} />);
        expect(screen.getByText('No messages yet.')).toBeInTheDocument();

        // Update mock to return conversation on next call
        (storageService.getConversations as any).mockReturnValue([mockConversation]);
        
        // Fast forward time
        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(screen.getByText('Other User')).toBeInTheDocument();
    });

    it('highlights selected conversation', () => {
        (storageService.getConversations as any).mockReturnValue([mockConversation]);
        
        render(<ChatList {...defaultProps} selectedId="conv1" />);
        
        const convItem = screen.getByText('Other User').closest('div.cursor-pointer');
        expect(convItem).toHaveClass('bg-brand-50');
        expect(convItem).toHaveClass('border-l-brand-600');
    });
});
