import React, { useEffect, useState, useRef } from 'react';
import { Message, User, Conversation } from '@fiilar/types';
import { getAllUsers } from '@fiilar/storage';
import { getMessages, sendMessage, markAsRead, getConversations } from '@fiilar/messaging';
import { Send, User as UserIcon, Check, CheckCheck, ShieldAlert, MessageSquare, ArrowLeft, Paperclip, Smile, Image as ImageIcon, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '@fiilar/ui';

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
        const convs: Conversation[] = getConversations(currentUserId);
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

    const handleSend = (text: string = newMessage) => {
        if (!text.trim()) return;

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

        const lowerMsg = text.toLowerCase();
        const hasKeyword = forbiddenKeywords.some(keyword => lowerMsg.includes(keyword));
        const hasVulgarWord = vulgarWords.some(word => {
            // Check for whole word matches to avoid false positives
            const wordRegex = new RegExp(`\\b${word.replace(/\*/g, '.')}\\b`, 'i');
            return wordRegex.test(lowerMsg);
        });

        // Check for contact info or off-platform communication
        if (emailRegex.test(text) || phoneRegex.test(text) || hasKeyword) {
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

        sendMessage(conversationId, text.trim(), currentUserId);
        setNewMessage('');
        // Immediate refresh
        setMessages(getMessages(conversationId));
    };

    const quickReplies = [
        "Is this still available?",
        "What are the house rules?",
        "Can I book for next weekend?",
        "Thanks for the info!"
    ];

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC]">
            {/* Header */}
            <div className="px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between z-10 shadow-sm sticky top-0">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="md:hidden p-2 hover:bg-gray-100 rounded-full -ml-2 transition-colors" title="Back">
                            <ArrowLeft size={20} className="text-gray-700" />
                        </button>
                    )}
                    <div className="relative">
                        {otherUser?.avatar ? (
                            <img src={otherUser.avatar} alt={otherUser.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                <UserIcon size={20} className="text-gray-500" />
                            </div>
                        )}
                        {/* Online Indicator */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 leading-tight">{otherUser?.name || 'Chat'}</h3>
                        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                            {isTyping ? (
                                <span className="animate-pulse">typing...</span>
                            ) : (
                                'Online'
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Phone size={20} /></button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Video size={20} /></button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MoreVertical size={20} /></button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-50">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <MessageSquare size={32} className="text-brand-300" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mb-1">No messages yet</p>
                        <p className="text-sm text-gray-500 mb-8">Start the conversation with {otherUser?.name || 'the host'}!</p>

                        <div className="flex flex-wrap justify-center gap-2 max-w-md">
                            {quickReplies.map((reply, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(reply)}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all shadow-sm"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderId === currentUserId;
                        const showTime = idx === 0 || new Date(msg.timestamp).getTime() - new Date(messages[idx - 1].timestamp).getTime() > 15 * 60 * 1000;
                        const isLast = idx === messages.length - 1;

                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                {showTime && (
                                    <div className="flex items-center gap-4 w-full my-4">
                                        <div className="h-px bg-gray-200 flex-1"></div>
                                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                        </span>
                                        <div className="h-px bg-gray-200 flex-1"></div>
                                    </div>
                                )}
                                <div className={`max-w-[75%] group relative flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {!isMe && (
                                        <img src={otherUser?.avatar} className="w-6 h-6 rounded-full object-cover mb-1 shadow-sm" alt="" />
                                    )}
                                    <div className={`px-5 py-3 shadow-sm text-[15px] leading-relaxed relative ${isMe
                                        ? 'bg-gradient-to-br from-brand-600 to-brand-500 text-white rounded-2xl rounded-tr-none shadow-brand-500/20'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-none shadow-gray-200/50'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    {isMe && (
                                        <div className="text-[10px] text-gray-300 mb-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                            {msg.read ? <CheckCheck size={14} className="text-brand-600" /> : <Check size={14} />}
                                        </div>
                                    )}
                                </div>
                                {isMe && isLast && msg.read && (
                                    <div className="text-[10px] text-gray-400 mt-1 mr-1 flex items-center gap-1 animate-in fade-in">
                                        Read <CheckCheck size={12} className="text-blue-500" />
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
                <div className="bg-red-50 border-t border-red-100 p-4 flex items-start gap-3 animate-in slide-in-from-bottom-2 shadow-lg z-20">
                    <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <ShieldAlert size={18} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-red-900">Message Blocked</p>
                        <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{safetyWarning}</p>
                    </div>
                    <Button onClick={() => setSafetyWarning(null)} variant="ghost" size="sm" className="text-red-600 hover:bg-red-100 hover:text-red-700">
                        Dismiss
                    </Button>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 z-10 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
                <div className="flex items-end gap-2 max-w-4xl mx-auto">
                    <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <Paperclip size={20} />
                    </button>
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-2 px-4 py-2 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-gray-900 placeholder-gray-400 resize-none max-h-32 py-1.5"
                            rows={1}
                            style={{ minHeight: '24px' }}
                        />
                        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                            <Smile size={20} />
                        </button>
                    </div>
                    <button
                        onClick={() => handleSend()}
                        disabled={!newMessage.trim()}
                        className={`p-3 rounded-full flex items-center justify-center transition-all shadow-lg ${newMessage.trim()
                            ? 'bg-brand-600 text-white hover:bg-brand-700 hover:scale-105 shadow-brand-600/30'
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                        title="Send message"
                    >
                        <Send size={20} className={newMessage.trim() ? "ml-0.5" : ""} />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                        <ShieldAlert size={10} />
                        Your chats are secure. Do not share personal contact details.
                    </p>
                </div>
            </div>
        </div>
    );
};
