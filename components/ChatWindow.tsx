import React, { useEffect, useState, useRef } from 'react';
import { Message, User, Conversation } from '../types';
import { getMessages, sendMessage, markAsRead, getAllUsers, getConversations } from '../services/storage';
import { Send, User as UserIcon, Check, CheckCheck, ShieldAlert, MessageSquare, ArrowLeft } from 'lucide-react';

interface ChatWindowProps {
    conversationId: string;
    currentUserId: string;
    onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, currentUserId, onBack }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        const convs = getConversations(currentUserId);
        const conv = convs.find(c => c.id === conversationId);
        if (conv) {
            const otherId = conv.participants.find(p => p !== currentUserId);
            const users = getAllUsers();
            setOtherUser(users.find(u => u.id === otherId) || null);
        }
    }, [conversationId, currentUserId]);

    // Simulate typing indicator
    useEffect(() => {
        if (newMessage.length > 0) {
            setIsTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
        } else {
            setIsTyping(false);
        }
    }, [newMessage]);

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

        // Vulgar and profanity list
        const vulgarWords = [
            // Strong profanity
            'fuck', 'shit', 'bitch', 'ass', 'damn', 'hell', 'crap',
            'bastard', 'piss', 'dick', 'cock', 'pussy', 'asshole',
            // Slurs and offensive terms (abbreviated to avoid offense)
            'n*gger', 'n*gga', 'f*ggot', 'r*tard', 'c*nt',
            // Sexual/inappropriate content
            'sex', 'porn', 'nude', 'naked', 'horny', 'sexy',
            // Harassment terms
            'kill yourself', 'kys', 'die', 'hate you', 'stupid',
            // Variations and leetspeak
            'fck', 'fuk', 'sh1t', 'b1tch', 'a$$', 'azz',
            'wtf', 'stfu', 'gtfo', 'ffs'
        ];

        const lowerMsg = newMessage.toLowerCase();
        const hasKeyword = forbiddenKeywords.some(keyword => lowerMsg.includes(keyword));
        const hasVulgarWord = vulgarWords.some(word => {
            // Check for whole word matches to avoid false positives
            const wordRegex = new RegExp(`\\b${word.replace(/\*/g, '.')}\\b`, 'i');
            return wordRegex.test(lowerMsg);
        });

        // Check for contact info or off-platform communication
        if (emailRegex.test(newMessage) || phoneRegex.test(newMessage) || hasKeyword) {
            setSafetyWarning("⚠️ Message Blocked: Sharing contact details or requesting off-platform communication is strictly prohibited. Your message was not sent.");
            return; // STRICT BLOCK: Do not proceed to sendMessage
        }

        // Check for vulgar/profane content
        if (hasVulgarWord) {
            setSafetyWarning("⚠️ Message Blocked: Vulgar or inappropriate language is not allowed. Please keep communication professional and respectful.");
            return; // STRICT BLOCK: Do not proceed to sendMessage
        }

        // All checks passed
        setSafetyWarning(null);

        sendMessage(conversationId, newMessage.trim(), currentUserId);
        setNewMessage('');
        // Immediate refresh
        setMessages(getMessages(conversationId));
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
                {onBack && (
                    <button onClick={onBack} className="md:hidden p-2 hover:bg-gray-100 rounded-full -ml-2" title="Back">
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                )}
                {otherUser?.avatar ? (
                    <img src={otherUser.avatar} alt={otherUser.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserIcon size={20} className="text-gray-500" />
                    </div>
                )}
                <div>
                    <h3 className="font-semibold text-gray-900">{otherUser?.name || 'Chat'}</h3>
                    {isTyping && <p className="text-xs text-gray-500">typing...</p>}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <MessageSquare size={48} className="mb-3 opacity-20" />
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs">Start the conversation!</p>
                    </div>
                ) : (
                messages.map((msg, idx) => {
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
                })
                )}
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
                        className={`p-2 rounded-full transition-colors ${
                            newMessage.trim()
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        title="Send message"
                    >
                        <Send size={18} className="ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
