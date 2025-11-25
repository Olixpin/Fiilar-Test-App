import { Conversation, Message } from '@fiilar/types';
import { addNotification } from '@fiilar/notifications';
import { checkMessageSafety } from './safetyFilter';

export const STORAGE_KEYS = {
    CONVERSATIONS: 'fiilar_conversations',
    MESSAGES: 'fiilar_messages',
};

export const getConversations = (userId: string): Conversation[] => {
    const c = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    const m = localStorage.getItem(STORAGE_KEYS.MESSAGES);

    const conversations: Conversation[] = c ? JSON.parse(c) : [];
    const allMessages: Message[] = m ? JSON.parse(m) : [];

    const filtered = conversations.filter(conv => conv.participants.includes(userId));

    // Dynamically calculate unread counts
    const withCounts = filtered.map(conv => {
        const unreadCount = allMessages.filter(msg =>
            msg.conversationId === conv.id &&
            msg.senderId !== userId &&
            !msg.read
        ).length;

        return { ...conv, unreadCount };
    });

    return withCounts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const getMessages = (conversationId: string): Message[] => {
    const m = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const messages: Message[] = m ? JSON.parse(m) : [];
    return messages.filter(msg => msg.conversationId === conversationId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const sendMessage = (conversationId: string, content: string, senderId: string): Message => {
    // Safety Check
    const safetyResult = checkMessageSafety(content);
    if (!safetyResult.isSafe) {
        // In a real app, we might block it or flag it for review.
        // For this demo, we'll append a warning but allow it, or throw an error.
        // Let's throw an error to simulate blocking unsafe content.
        throw new Error(`Message blocked: ${safetyResult.flaggedReason} detected.`);
    }

    const m = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const messages: Message[] = m ? JSON.parse(m) : [];

    const newMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        conversationId,
        senderId,
        content,
        timestamp: new Date().toISOString(),
        read: false
    };

    messages.push(newMessage);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));

    // Update conversation lastMessage and updatedAt
    const c = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    const conversations: Conversation[] = c ? JSON.parse(c) : [];
    const idx = conversations.findIndex(conv => conv.id === conversationId);

    if (idx >= 0) {
        conversations[idx].lastMessage = newMessage;
        conversations[idx].updatedAt = newMessage.timestamp;
        localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));

        // Create notification for the recipient
        const recipientId = conversations[idx].participants.find(p => p !== senderId);
        if (recipientId) {
            addNotification({
                userId: recipientId,
                type: 'message',
                title: 'New Message',
                message: `You have a new message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
                severity: 'info',
                read: false,
                actionRequired: false,
                metadata: {
                    link: `/dashboard?tab=messages&conversationId=${conversationId}`,
                    senderId: senderId
                }
            });
        }
    }

    return newMessage;
};

export const markAsRead = (conversationId: string, userId: string) => {
    const m = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const messages: Message[] = m ? JSON.parse(m) : [];

    let hasUpdates = false;
    const updatedMessages = messages.map(msg => {
        if (msg.conversationId === conversationId && msg.senderId !== userId && !msg.read) {
            hasUpdates = true;
            return { ...msg, read: true };
        }
        return msg;
    });

    if (hasUpdates) {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));
    }
};

export const startConversation = (userId: string, hostId: string, listingId?: string): string => {
    const c = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    const conversations: Conversation[] = c ? JSON.parse(c) : [];

    // Check if conversation already exists
    const existing = conversations.find(conv =>
        conv.participants.includes(userId) &&
        conv.participants.includes(hostId) &&
        conv.listingId === listingId
    );

    if (existing) return existing.id;

    // Create new conversation
    const newConv: Conversation = {
        id: Math.random().toString(36).substr(2, 9),
        participants: [userId, hostId],
        listingId,
        updatedAt: new Date().toISOString(),
        lastMessageTime: new Date().toISOString()
    };

    conversations.push(newConv);
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));

    return newConv.id;
};
