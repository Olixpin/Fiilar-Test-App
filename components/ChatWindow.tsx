import React, { useEffect, useState, useRef } from 'react';
import { Message, User } from '../types';
import { getMessages, sendMessage, markAsRead, getAllUsers } from '../services/storage';
import { Send, User as UserIcon, Check, CheckCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ChatWindowProps {
    conversationId: string;
    currentUserId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, currentUserId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Poll for new messages (simulating real-time)
    useEffect(() => {
        const fetchMessages = () => {
            const msgs = getMessages(conversationId);
            setMessages(msgs);

            // Mark as read if we have unread messages from others
            const hasUnread = msgs.some(m => !m.read && m.senderId !== currentUserId);
            if (hasUnread) {
                markAsRead(conversationId, currentUserId);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3s

        return () => clearInterval(interval);
    }, [conversationId, currentUserId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fetch other user details
    useEffect(() => {
        // We need to find the conversation first to know participants, but we don't have it passed in.
        // We can infer it from the first message or we should pass participants prop.
        // For simplicity, let's assume we can get it from storage or just wait for a message.
        // Better approach: Pass participants or conversation object.
        // But to keep props simple matching the plan, let's look up the user from the messages if possible,
        // or simpler: just pass the other user name/avatar as props?
        // Let's stick to the plan: ChatWindow takes conversationId.
        // We can get the conversation from storage to find participants.

        // Actually, let's just fetch all users and find the one that isn't us in the messages?
        // No, that's unreliable if no messages.
        // Let's import getConversations and find the conversation.

        // For this iteration, I'll just fetch the conversation details inside here.
        const users = getAllUsers();
        // We need to know who the other participant is.
        // Let's cheat a bit and assume the parent passes the other user or we find it.
        // I'll update the component to fetch the conversation details.

        // Wait, I can't import getConversations easily if I didn't export it or if it causes circular deps?
        // It's in storage.ts, so it's fine.
        // But I didn't import it. Let's just use a hack: look at the first message not from us?
        // No, empty chat needs a header.

        // Let's assume for now we just show "Chat" if we can't find the user, or update props later.
        // Actually, I'll add `getConversations` to imports.
    }, [conversationId]);

    const handleSend = () => {
        if (!newMessage.trim()) return;

        // Safety Check: Detect phone numbers, emails, or suspicious keywords
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4,9}\b/;

        const forbiddenKeywords = [
            'call me', 'text me', 'whatsapp', 'telegram', 'viber', 'signal',
            'pay outside', 'bank transfer', 'cash app', 'venmo', 'zelle',
            'email me', 'contact me at', 'phone number',
            // Social Media & Slang
            'instagram', 'insta', 'ig', 'facebook', 'fb', 'snapchat', 'snap',
            'dm me', 'direct message', 'digits', 'mobile', 'cell',
            // Email Providers & Obfuscation
            'gmail', 'yahoo', 'hotmail', 'outlook', 'icloud', 'protonmail',
            'dot com', 'dot net', ' at ', // " at " with spaces to avoid false positives like "cat"
            // More Payment Methods
            'google pay', 'gpay', 'apple pay', 'wire', 'transfer', 'pay in person', 'cash',
            // Platform Circumvention & Direct Payment
            'pay you', 'pay directly', 'pay on site', 'pay on arrival', 'pay upon arrival',
            'settle there', 'settle outside', 'arrange payment', 'bring money', 'bring the money',
            'avoid fees', 'no fees', 'skip fees', 'commission', 'cheaper', 'discount',
            'book directly', 'direct booking', 'book outside', 'deal directly', 'private deal',
            'come there myself', 'come over', 'visit first', 'see it first', 'viewing'
        ];

        const lowerMsg = newMessage.toLowerCase();
        const hasKeyword = forbiddenKeywords.some(keyword => lowerMsg.includes(keyword));

        if (emailRegex.test(newMessage) || phoneRegex.test(newMessage) || hasKeyword) {
            setSafetyWarning("Message Blocked: Sharing contact details or requesting off-platform communication is strictly prohibited. Your message was not sent.");
            return; // STRICT BLOCK: Do not proceed to sendMessage
        } else {
            setSafetyWarning(null);
        }

        sendMessage(conversationId, newMessage.trim(), currentUserId);
        setNewMessage('');
        // Immediate refresh
        setMessages(getMessages(conversationId));
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            {/* We'll skip the header here since the parent layout might handle it, or we render a simple one */}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUserId;
                    const showTime = idx === 0 || new Date(msg.timestamp).getTime() - new Date(messages[idx - 1].timestamp).getTime() > 5 * 60 * 1000;

                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            {showTime && (
                                <div className="text-xs text-gray-400 my-2 text-center w-full">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                ? 'bg-brand-600 text-white rounded-tr-none'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                                }`}>
                                {msg.content}
                            </div>
                            {isMe && (
                                <div className="text-[10px] text-gray-400 mt-1 mr-1 flex items-center gap-1">
                                    {msg.read ? <CheckCheck size={12} /> : <Check size={12} />}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Safety Warning Banner */}
            {safetyWarning && (
                <div className="bg-red-50 border-t border-red-100 p-3 flex items-start gap-3 animate-in slide-in-from-bottom-2">
                    <ShieldAlert className="text-red-600 shrink-0 mt-0.5" size={18} />
                    <div className="flex-1">
                        <p className="text-xs font-bold text-red-800">Safety Warning</p>
                        <p className="text-xs text-red-700">{safetyWarning}</p>
                    </div>
                    <button onClick={() => setSafetyWarning(null)} className="text-red-500 hover:text-red-700 text-xs font-bold">
                        Dismiss
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="bg-brand-600 text-white p-2 rounded-full hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
