import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../config/axios';
import { useWhoAmI } from '../context/WhoAmIContext';
import Chat from '../components/Chat';
import BottomNavBar from '../components/BottomNavBar';
import PageHeader from '../components/PageHeader';
import { ChevronRightIcon } from '../components/Icons';
import '../styles/pages/Chats.css';

const Chats = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const { me, socket } = useWhoAmI();
    const conversationsListRef = useRef(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const fetchConversations = useCallback(async () => {
        try {
            if (!me) {
                setLoading(false);
                return;
            }
            const response = await axios.get('/api/conv/list');
            setConversations(response.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    }, [me]);

    // Fetch conversations when component mounts
    useEffect(() => {
        // Use AbortController to prevent duplicate API calls
        const controller = new AbortController();
        fetchConversations();
        return () => controller.abort();
    }, [fetchConversations]);

    // Listen for new matches and refresh conversations
    useEffect(() => {
        if (!socket) return;
        
        // Flag to track if we've already set up the listener
        let isListenerSet = false;
        
        if (!isListenerSet) {
            socket.on('new_notification', (notification) => {
                if (notification.type === 'match') {
                    fetchConversations();
                }
            });
            isListenerSet = true;
        }

        return () => {
            if (socket && isListenerSet) {
                socket.off('new_notification');
            }
        };
    }, [socket, fetchConversations]);

    // Toggle the drawer
    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    // Close the drawer when a conversation is selected (on mobile)
    const handleConversationSelect = (conversation) => {
        setSelectedConversation(conversation);
        
        // Check if we're on mobile (using window.innerWidth)
        if (window.innerWidth <= 768) {
            setIsDrawerOpen(false);
        }
    };

    // Close drawer when clicking outside
    const handleOverlayClick = () => {
        setIsDrawerOpen(false);
    };

    const getOtherUser = (conversation) => {
        if (!conversation || !conversation.user1 || !conversation.user2) {
            return {
                id: null,
                firstname: 'Unknown',
                country: '',
                photos: []
            };
        }
        return conversation.user1.id === me?.id ? conversation.user2 : conversation.user1;
    };

    if (loading) {
        return (
            <div className="page-container">
                <PageHeader />
                <div className="content">
                    <div className="loading">Loading conversations...</div>
                </div>
                <BottomNavBar />
            </div>
        );
    }

    // Filter out invalid conversations
    const validConversations = conversations.filter(
        conv => conv && conv.user1 && conv.user2
    );

    return (
        <div className="page-container">
            <PageHeader />
            <div className="content">
                <div className="chats-container">
                    {/* Mobile toggle button */}
                    <button 
                        className={`conversations-toggle ${isDrawerOpen ? 'open' : ''}`}
                        onClick={toggleDrawer}
                        aria-label="Toggle conversations"
                    >
                        <ChevronRightIcon size={20} />
                    </button>

                    {/* Overlay for mobile */}
                    <div 
                        className={`drawer-overlay ${isDrawerOpen ? 'visible' : ''}`}
                        onClick={handleOverlayClick}
                    ></div>

                    <div 
                        className={`conversations-list ${isDrawerOpen ? 'open' : ''}`} 
                        ref={conversationsListRef}
                    >
                        {validConversations.length === 0 ? (
                            <div className="no-conversations">
                                No conversations yet
                            </div>
                        ) : (
                            validConversations.map((conversation) => {
                                const otherUser = getOtherUser(conversation);
                                return (
                                    <div
                                        key={conversation.id}
                                        className={`conversation-item ${selectedConversation?.id === conversation.id ? 'selected' : ''}`}
                                        onClick={() => handleConversationSelect(conversation)}
                                    >
                                        <div
                                            className="conversation-photo"
                                            style={{
                                                backgroundImage: `url(${otherUser.photos && otherUser.photos.length > 0 
                                                    ? otherUser.photos[0] 
                                                    : '/default-profile.png'})`
                                            }}
                                        />
                                        <div className="conversation-info">
                                            <h3>{otherUser.firstname}</h3>
                                            <p>{otherUser.country} • {otherUser.age} years</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <div className={`chat-view ${isDrawerOpen ? 'shifted' : ''}`}>
                        {selectedConversation ? (
                            <Chat
                                conversationId={selectedConversation.id}
                                otherUser={getOtherUser(selectedConversation)}
                            />
                        ) : (
                            <div className="no-chat-selected">
                                <h2>Select a conversation to start chatting</h2>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <BottomNavBar />
        </div>
    );
};

export default Chats; 