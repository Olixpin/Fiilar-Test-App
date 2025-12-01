import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { User, Booking } from '@fiilar/types';
import { ChatList } from '../../Messaging/components/ChatList';
import { ChatWindow } from '../../Messaging/components/ChatWindow';
import { getConversations, startConversation } from '@fiilar/messaging';

interface HostMessagesProps {
    user: User;
    hostBookings: Booking[];
}

const HostMessages: React.FC<HostMessagesProps> = ({ user, hostBookings }) => {
    const [searchParams] = useSearchParams();
    const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);

    // Handle deep linking to messages
    useEffect(() => {
        const targetUserId = searchParams.get('userId');
        const targetBookingId = searchParams.get('bookingId');

        if (targetUserId && targetBookingId) {
            const booking = hostBookings.find(b => b.id === targetBookingId);
            if (booking) {
                const conversationId = startConversation(user.id, targetUserId, booking.listingId);
                setSelectedConversationId(conversationId);
            }
        }
    }, [searchParams, hostBookings, user.id]);

    // Helper to get conversations
    const conversations = getConversations(user.id);
    const activeConversations = conversations.filter(c => c.participants.includes(user.id));

    return (
        <div className="space-y-4 animate-in fade-in">
            {/* Messages Container - WhatsApp-like layout */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Mobile: Show header when no conversation selected */}
                {!selectedConversationId && (
                    <div className="p-4 border-b border-gray-200 md:hidden">
                        <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                        <p className="text-sm text-gray-500 mt-1">Chat with your guests</p>
                    </div>
                )}
                
                <div className="flex h-[calc(100vh-180px)] md:h-[600px]">
                    {/* Conversation List - Full width on mobile until a chat is selected */}
                    <div className={`${selectedConversationId ? 'hidden md:flex' : 'flex'} w-full md:w-2/5 lg:w-1/3 border-r border-gray-200 flex-col`}>
                        {/* Desktop header */}
                        <div className="hidden md:block p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-900">Conversations</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{activeConversations.length} active</p>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <ChatList
                                currentUserId={user.id}
                                selectedId={selectedConversationId}
                                onSelect={setSelectedConversationId}
                            />
                        </div>
                    </div>

                    {/* Chat Window - Hidden on mobile when no conversation selected */}
                    <div className={`${selectedConversationId ? 'flex' : 'hidden md:flex'} w-full md:w-3/5 lg:w-2/3 flex-col`}>
                        {selectedConversationId ? (
                            <ChatWindow
                                conversationId={selectedConversationId}
                                currentUserId={user.id}
                                onBack={() => setSelectedConversationId(undefined)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare size={32} className="text-gray-400" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">No conversation selected</h3>
                                <p className="text-sm text-gray-500 max-w-xs text-center">Choose a conversation from the list to start chatting with your guests</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostMessages;
