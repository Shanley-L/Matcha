import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../config/axios';
import { useWhoAmI } from '../context/WhoAmIContext';
import { useNotifications } from '../context/NotificationContext';
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
    const { 
        markMessagesAsRead, 
        getUnreadCount, 
        clearActiveConversation 
    } = useNotifications();
    const conversationsListRef = useRef(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const socketListenersSetRef = useRef(false);
    const previousConversationIdRef = useRef(null);

    const fetchConversations = useCallback(async () => {
        try {
            if (!me) {
                console.log('User not authenticated, skipping fetch');
                setLoading(false);
                return;
            }
            
            console.log('User ID: ' + me.id);
            console.log('Fetching conversations...');
            const response = await axios.get('/api/conv/list');
            console.log('Conversations response:', response.data);
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

    // Mark messages as read for the active conversation when the component mounts or changes
    useEffect(() => {
        if (selectedConversation && selectedConversation.id !== previousConversationIdRef.current) {
            console.log(`Chats: Marking messages as read for conversation ${selectedConversation.id} (previous: ${previousConversationIdRef.current})`);
            markMessagesAsRead(selectedConversation.id);
            previousConversationIdRef.current = selectedConversation.id;
        }
    }, [selectedConversation, markMessagesAsRead]);

    // Listen for new matches and refresh conversations
    useEffect(() => {
        if (!socket) return;
        
        // Only set up listeners if they haven't been set up already
        if (!socketListenersSetRef.current) {
            console.log('Setting up socket listeners in Chats component');
            
            const handleNotification = (notification) => {
                if (notification.type === 'match') {
                    console.log('Received match notification, refreshing conversations');
                    fetchConversations();
                }
            };
            
            const handleNewMessage = () => {
                console.log('Received new message notification, refreshing conversations');
                fetchConversations();
            };
            
            // Add event listeners
            socket.on('new_notification', handleNotification);
            socket.on('new_message', handleNewMessage);
            
            // Mark that we've set up the listeners
            socketListenersSetRef.current = true;
            
            // Return cleanup function
            return () => {
                console.log('Cleaning up socket listeners in Chats component');
                socket.off('new_notification', handleNotification);
                socket.off('new_message', handleNewMessage);
                socketListenersSetRef.current = false;
            };
        }
    }, [socket, fetchConversations]);

    // Clear active conversation when unmounting
    useEffect(() => {
        return () => {
            console.log('Chats component unmounting, clearing active conversation');
            clearActiveConversation();
            previousConversationIdRef.current = null;
        };
    }, [clearActiveConversation]);

    // Toggle the drawer
    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    // Close the drawer when a conversation is selected (on mobile)
    const handleConversationSelect = (conversation) => {
        if (conversation.id === selectedConversation?.id) {
            console.log('Same conversation selected, not updating');
            return;
        }
        
        console.log(`Selecting conversation: ${conversation.id}`);
        setSelectedConversation(conversation);
        
        // Mark messages as read is now handled in the useEffect
        
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
                                const unreadCount = getUnreadCount(conversation.id);
                                const isSelected = selectedConversation?.id === conversation.id;
                                
                                return (
                                    <div
                                        key={conversation.id}
                                        className={`conversation-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleConversationSelect(conversation)}
                                    >
                                        <div className="conversation-photo-container">
                                            <div
                                                className="conversation-photo"
                                                style={{
                                                    backgroundImage: `url(${otherUser.photos && otherUser.photos.length > 0 
                                                        ? otherUser.photos[0] 
                                                        : '/default-profile.png'})`
                                                }}
                                            />
                                            {unreadCount > 0 && !isSelected && (
                                                <span className="conversation-notification-dot">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </div>
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