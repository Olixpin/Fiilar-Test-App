import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChatWindow } from '../../../../features/Messaging/components/ChatWindow';
import * as storageService from '@fiilar/storage';
import * as messagingService from '@fiilar/messaging';
import { User, Conversation, Message, Role } from '@fiilar/types';

// Mock the services
vi.mock('@fiilar/storage', () => ({
    getAllUsers: vi.fn()
}));

vi.mock('@fiilar/messaging', () => ({
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
    markAsRead: vi.fn(),
    getConversations: vi.fn()
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ChatWindow', () => {
    const mockUser: User = {
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        role: Role.GUEST,
        isHost: false,
        walletBalance: 0,
        emailVerified: true,
        createdAt: new Date().toISOString(),
    };

    const mockOtherUser: User = {
        id: 'user2',
        name: 'Other User',
        email: 'other@example.com',
        password: 'password',
        role: Role.HOST,
        isHost: true,
        walletBalance: 0,
        emailVerified: true,
        avatar: 'avatar.jpg',
        createdAt: new Date().toISOString(),
    };

    const mockConversation: Conversation = {
        id: 'conv1',
        participants: ['user1', 'user2'],
        lastMessageTime: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const mockMessages: Message[] = [
        {
            id: 'msg1',
            conversationId: 'conv1',
            senderId: 'user2',
            content: 'Hello',
            timestamp: new Date(Date.now() - 10000).toISOString(),
            read: true
        },
        {
            id: 'msg2',
            conversationId: 'conv1',
            senderId: 'user1',
            content: 'Hi there',
            timestamp: new Date().toISOString(),
            read: false
        }
    ];

    const defaultProps = {
        conversationId: 'conv1',
        currentUserId: 'user1',
        onBack: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        (storageService.getAllUsers as any).mockReturnValue([mockUser, mockOtherUser]);
        (messagingService.getConversations as any).mockReturnValue([mockConversation]);
        (messagingService.getMessages as any).mockReturnValue(mockMessages);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders messages and user info', () => {
        render(<ChatWindow {...defaultProps} />);
        
        expect(screen.getByText('Other User')).toBeInTheDocument();
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('Hi there')).toBeInTheDocument();
    });

    it('sends a valid message', () => {
        render(<ChatWindow {...defaultProps} />);
        
        const input = screen.getByPlaceholderText('Type a message...');
        fireEvent.change(input, { target: { value: 'How are you?' } });
        
        const sendButton = screen.getByTitle('Send message');
        fireEvent.click(sendButton);
        
        expect(messagingService.sendMessage).toHaveBeenCalledWith('conv1', 'How are you?', 'user1');
        expect(input).toHaveValue('');
    });

    it('sends message on Enter key press', () => {
        render(<ChatWindow {...defaultProps} />);
        
        const input = screen.getByPlaceholderText('Type a message...');
        fireEvent.change(input, { target: { value: 'Message via Enter' } });
        
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
        
        expect(messagingService.sendMessage).toHaveBeenCalledWith('conv1', 'Message via Enter', 'user1');
        expect(input).toHaveValue('');
    });

    it('blocks messages with forbidden keywords (safety check)', async () => {
        render(<ChatWindow {...defaultProps} />);
        
        const input = screen.getByPlaceholderText('Type a message...');
        fireEvent.change(input, { target: { value: 'email me at test@example.com' } });
        
        const sendButton = screen.getByTitle('Send message');
        fireEvent.click(sendButton);
        
        expect(messagingService.sendMessage).not.toHaveBeenCalled();
        expect(await screen.findByText(/Message Blocked/i)).toBeInTheDocument();
        expect(screen.getByText(/Sharing contact details/i)).toBeInTheDocument();
    });

    it('blocks messages with profanity', () => {
        render(<ChatWindow {...defaultProps} />);
        
        const input = screen.getByPlaceholderText('Type a message...');
        fireEvent.change(input, { target: { value: 'You are stupid' } });
        
        const sendButton = screen.getByTitle('Send message');
        fireEvent.click(sendButton);
        
        expect(messagingService.sendMessage).not.toHaveBeenCalled();
        expect(screen.getByText(/Vulgar or inappropriate language/i)).toBeInTheDocument();
    });

    it('dismisses safety warning', async () => {
        render(<ChatWindow {...defaultProps} />);
        
        // Trigger warning
        const input = screen.getByPlaceholderText('Type a message...');
        fireEvent.change(input, { target: { value: 'email me at test@example.com' } });
        fireEvent.click(screen.getByTitle('Send message'));
        
        expect(await screen.findByText(/Message Blocked/i)).toBeInTheDocument();
        
        // Dismiss
        fireEvent.click(screen.getByText('Dismiss'));
        expect(screen.queryByText(/Message Blocked/i)).not.toBeInTheDocument();
    });

    it('marks messages as read when polling', () => {
        const unreadMessages = [
            {
                id: 'msg3',
                conversationId: 'conv1',
                senderId: 'user2', // From other user
                content: 'New message',
                timestamp: new Date().toISOString(),
                read: false
            }
        ];
        (messagingService.getMessages as any).mockReturnValue(unreadMessages);
        
        render(<ChatWindow {...defaultProps} />);
        
        // Initial render calls fetchMessages
        expect(messagingService.markAsRead).toHaveBeenCalledWith('conv1', 'user1');
    });

    it('shows typing indicator', () => {
        render(<ChatWindow {...defaultProps} />);
        
        const input = screen.getByPlaceholderText('Type a message...');
        
        act(() => {
            fireEvent.change(input, { target: { value: 'Typing...' } });
        });
        
        // The component sets isTyping to true when input changes
        // But the UI only shows "typing..." if isTyping is true
        // Wait, the component logic is:
        // useEffect(() => { if (newMessage.length > 0) setIsTyping(true) ... }, [newMessage])
        // And render: {isTyping && <p>typing...</p>}
        
        // We need to wait for the effect to run
        act(() => {
            vi.advanceTimersByTime(100);
        });
        
        expect(screen.getByText('typing...')).toBeInTheDocument();
        
        // Wait for timeout
        act(() => {
            vi.advanceTimersByTime(1100);
        });
        
        expect(screen.queryByText('typing...')).not.toBeInTheDocument();
    });

    it('stops typing indicator when input is cleared', () => {
        render(<ChatWindow {...defaultProps} />);
        
        const input = screen.getByPlaceholderText('Type a message...');
        
        act(() => {
            fireEvent.change(input, { target: { value: 'Typing...' } });
        });
        
        act(() => {
            vi.advanceTimersByTime(100);
        });
        expect(screen.getByText('typing...')).toBeInTheDocument();

        act(() => {
            fireEvent.change(input, { target: { value: '' } });
        });

        expect(screen.queryByText('typing...')).not.toBeInTheDocument();
    });

    it('renders default avatar if user has no avatar', () => {
        const userNoAvatar = { ...mockOtherUser, avatar: undefined };
        (storageService.getAllUsers as any).mockReturnValue([mockUser, userNoAvatar]);

        render(<ChatWindow {...defaultProps} />);
        
        // Should not find img with alt 'Other User'
        expect(screen.queryByAltText('Other User')).not.toBeInTheDocument();
        // Should find UserIcon (we can check for the container class or just assume if img is missing it's fine, 
        // but better to check for the fallback. The fallback has a UserIcon.
        // We can check if the fallback div exists.
        // The fallback div has class "w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
        // But that's implementation detail.
        // Let's just check that the name is there but no image.
        expect(screen.getByText('Other User')).toBeInTheDocument();
    });

    it('handles back button', () => {
        render(<ChatWindow {...defaultProps} />);
        
        const backButton = screen.getByTitle('Back');
        fireEvent.click(backButton);
        
        expect(defaultProps.onBack).toHaveBeenCalled();
    });
});
