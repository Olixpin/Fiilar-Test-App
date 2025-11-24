import React, { useEffect, useState } from 'react';
import { Conversation, User } from '@fiilar/types';
import { getAllUsers, getConversations } from '../../../services/storage';
import { User as UserIcon, MessageSquare } from 'lucide-react';

interface ChatListProps {
    currentUserId: string;
    selectedId?: string;
    onSelect: (id: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ currentUserId, selectedId, onSelect }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        setUsers(getAllUsers());
    }, []);

    useEffect(() => {
        const fetchConversations = () => {
            // Import getConversations from storage to avoid "not defined" error
            // We'll rely on the import at the top of the file, which we need to add/verify
            console.log('ChatList polling for user:', currentUserId);
            const convs = getConversations(currentUserId);
            console.log('Fetched conversations:', convs);
            setConversations(convs);
        };

        fetchConversations();
        const interval = setInterval(fetchConversations, 3000); // Poll every 3s

        return () => clearInterval(interval);
    }, [currentUserId]);

    const getOtherParticipant = (conv: Conversation) => {
        const otherId = conv.participants.find(p => p !== currentUserId);
        // If otherId is undefined, it means it's a self-chat (participants = [me, me])
        // So we return the current user details
        return users.find(u => u.id === (otherId || currentUserId));
    };

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <MessageSquare size={48} className="mb-4 text-gray-300" />
                <p>No messages yet.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-y-auto border-r border-gray-200 bg-white">
            <div className="p-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map(conv => {
                    const otherUser = getOtherParticipant(conv);
                    const isSelected = conv.id === selectedId;
                    const lastMsg = conv.lastMessage;
                    const isUnread = lastMsg && !lastMsg.read && lastMsg.senderId !== currentUserId;

                    return (
                        <div
                            key={conv.id}
                            onClick={() => onSelect(conv.id)}
                            className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${isSelected ? 'bg-brand-50 border-l-4 border-l-brand-600' : 'border-l-4 border-l-transparent'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="relative">
                                    {otherUser?.avatar ? (
                                        <img src={otherUser.avatar} alt={otherUser.name} className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                            <UserIcon size={20} />
                                        </div>
                                    )}
                                    {isUnread && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`text-sm font-semibold truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {otherUser?.name || 'Unknown User'}
                                        </h3>
                                        {lastMsg && (
                                            <span className="text-xs text-gray-400 shrink-0 ml-2">
                                                {new Date(lastMsg.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm truncate ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                        {lastMsg ? (
                                            <>
                                                {lastMsg.senderId === currentUserId && <span className="text-gray-400">You: </span>}
                                                {lastMsg.content}
                                            </>
                                        ) : (
                                            <span className="italic text-gray-400">New conversation</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
