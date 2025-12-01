import React, { useEffect, useState } from 'react';
import { Conversation, User } from '@fiilar/types';
import { getAllUsers } from '@fiilar/storage';
import { getConversations } from '@fiilar/messaging';
import { User as UserIcon, MessageSquare, Search, MoreHorizontal } from 'lucide-react';

interface ChatListProps {
    currentUserId: string;
    selectedId?: string;
    onSelect: (id: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ currentUserId, selectedId, onSelect }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setUsers(getAllUsers());
    }, []);

    useEffect(() => {
        const fetchConversations = () => {
            const convs = getConversations(currentUserId);
            setConversations(convs);
        };

        fetchConversations();
        const interval = setInterval(fetchConversations, 3000); // Poll every 3s

        return () => clearInterval(interval);
    }, [currentUserId]);

    const getOtherParticipant = (conv: Conversation) => {
        const otherId = conv.participants.find(p => p !== currentUserId);
        return users.find(u => u.id === (otherId || currentUserId));
    };

    const filteredConversations = conversations.filter(conv => {
        const otherUser = getOtherParticipant(conv);
        return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white">
            {/* Search - Compact for embedded use */}
            <div className="p-3 border-b border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 px-6 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={24} className="text-gray-300" />
                        </div>
                        <p className="font-medium text-gray-900">No messages yet</p>
                        <p className="text-sm text-gray-400 mt-1">When you contact a host, your conversation will appear here.</p>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No conversations found matching "{searchQuery}"</p>
                    </div>
                ) : (
                    filteredConversations.map(conv => {
                        const otherUser = getOtherParticipant(conv);
                        const isSelected = conv.id === selectedId;
                        const lastMsg = conv.lastMessage;
                        const isUnread = lastMsg && !lastMsg.read && lastMsg.senderId !== currentUserId;

                        // Mock online status (random for demo)
                        const isOnline = otherUser?.id && parseInt(otherUser.id) % 2 === 0;

                        return (
                            <div
                                key={conv.id}
                                onClick={() => onSelect(conv.id)}
                                className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 group ${isSelected ? 'bg-brand-50/60 border-l-4 border-l-brand-600' : 'border-l-4 border-l-transparent'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="relative shrink-0">
                                        {otherUser?.avatar ? (
                                            <img src={otherUser.avatar} alt={otherUser.name} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                                <UserIcon size={20} />
                                            </div>
                                        )}
                                        {isOnline && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={`text-sm font-bold truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {otherUser?.name || 'Unknown User'}
                                            </h3>
                                            {lastMsg && (
                                                <span className={`text-[10px] shrink-0 ml-2 ${isUnread ? 'text-brand-600 font-bold' : 'text-gray-400'}`}>
                                                    {new Date(lastMsg.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className={`text-sm truncate pr-2 ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                                {lastMsg ? (
                                                    <>
                                                        {lastMsg.senderId === currentUserId && <span className="text-gray-400 font-normal">You: </span>}
                                                        {lastMsg.content}
                                                    </>
                                                ) : (
                                                    <span className="italic text-gray-400">New conversation</span>
                                                )}
                                            </p>
                                            {isUnread && (
                                                <div className="w-2 h-2 bg-brand-600 rounded-full shrink-0 animate-pulse"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
