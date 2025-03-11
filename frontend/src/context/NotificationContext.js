import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useWhoAmI } from './WhoAmIContext';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { socket, me } = useWhoAmI();
    const [hasNewLikes, setHasNewLikes] = useState(false);
    const [hasNewMatches, setHasNewMatches] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState({});
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [systemNotifications, setSystemNotifications] = useState([]);
    const socketListenersSetRef = useRef(false);
    const lastMarkedConversationRef = useRef(null);
    
    // Debug socket connection
    useEffect(() => {
        console.log('NotificationContext: Socket connection status:', {
            socketExists: !!socket,
            userExists: !!me,
            userId: me?.id
        });
    }, [socket, me]);
    
    // Listen for notifications from the socket
    useEffect(() => {
        if (!socket || !me) {
            console.log('NotificationContext: Socket or user not available, skipping listener setup');
            return;
        }
        
        // Only set up listeners if they haven't been set up already
        if (!socketListenersSetRef.current) {
            console.log('Setting up socket listeners in NotificationContext');
            
            const handleNewNotification = (notification) => {
                console.log('Notification received:', notification);
                
                // Only process notifications intended for the current user
                if (notification.target_user_id !== me.id) {
                    console.log('Ignoring notification not intended for current user');
                    return;
                }
                
                // Handle different notification types
                if (notification.type === 'like') {
                    console.log('Setting hasNewLikes to true');
                    setHasNewLikes(true);
                } else if (notification.type === 'match') {
                    console.log('Setting hasNewMatches to true');
                    setHasNewMatches(true);
                } else if (notification.type === 'message') {
                    // Handle message notifications
                    const conversationId = notification.conversation_id;
                    
                    // Only mark as unread if it's from someone else and we're not in that conversation
                    if (notification.from_user_id !== me.id && conversationId !== activeConversationId) {
                        console.log('Adding unread message for conversation:', conversationId);
                        setUnreadMessages(prev => ({
                            ...prev,
                            [conversationId]: (prev[conversationId] || 0) + 1
                        }));
                    }
                } else if (notification.type === 'unmatch') {
                    // Handle unmatch notifications
                    console.log('Unmatch notification received:', notification);
                    
                    // Add to system notifications
                    const unmatchNotification = {
                        id: Date.now(),
                        type: 'unmatch',
                        message: notification.message || `${notification.from_user_name} has removed the match with you`,
                        timestamp: new Date().toISOString(),
                        read: false,
                        fromUserId: notification.from_user_id
                    };
                    
                    setSystemNotifications(prev => [unmatchNotification, ...prev]);
                    
                    // Refresh the page if the user is currently viewing a profile or chat that was unmatched
                    const currentPath = window.location.pathname;
                    if (currentPath.includes(`/user/${notification.from_user_id}`) || 
                        currentPath === '/chats') {
                        window.location.reload();
                    }
                }
            };
            
            // Handle new messages
            const handleNewMessage = (data) => {
                console.log('New message received in NotificationContext:', data);
                // Extract the conversation ID and sender ID from the data
                const conversationId = data.conversation_id;
                const senderId = data.sender?.id || data.message?.sender?.id;
                
                // Only mark as unread if it's from someone else and we're not in that conversation
                if (senderId && senderId !== me.id && conversationId !== activeConversationId) {
                    console.log('Marking message as unread for conversation:', conversationId);
                    setUnreadMessages(prev => ({
                        ...prev,
                        [conversationId]: (prev[conversationId] || 0) + 1
                    }));
                }
            };
            
            // Set up the socket listeners
            socket.on('new_notification', handleNewNotification);
            socket.on('new_message', handleNewMessage);
            
            // Mark that we've set up the listeners
            socketListenersSetRef.current = true;
            
            // Clean up the listeners when the component unmounts
            return () => {
                console.log('Cleaning up socket listeners in NotificationContext');
                socket.off('new_notification', handleNewNotification);
                socket.off('new_message', handleNewMessage);
                socketListenersSetRef.current = false;
            };
        }
    }, [socket, me, activeConversationId]);
    
    // Debug notification state changes
    useEffect(() => {
        console.log('NotificationContext: State updated', {
            hasNewLikes,
            hasNewMatches,
            unreadMessagesCount: Object.keys(unreadMessages).length,
            activeConversationId,
            systemNotificationsCount: systemNotifications.length
        });
    }, [hasNewLikes, hasNewMatches, unreadMessages, activeConversationId, systemNotifications]);
    
    // Function to mark likes as read
    const markLikesAsRead = useCallback(() => {
        console.log('Marking likes as read');
        setHasNewLikes(false);
    }, []);
    
    // Function to mark matches as read
    const markMatchesAsRead = useCallback(() => {
        console.log('Marking matches as read');
        setHasNewMatches(false);
    }, []);
    
    // Function to mark system notifications as read
    const markSystemNotificationsAsRead = useCallback(() => {
        console.log('Marking system notifications as read');
        setSystemNotifications(prev => 
            prev.map(notification => ({ ...notification, read: true }))
        );
    }, []);
    
    // Function to mark messages as read for a specific conversation
    const markMessagesAsRead = useCallback((conversationId) => {
        // Prevent duplicate calls for the same conversation
        if (conversationId === lastMarkedConversationRef.current) {
            console.log(`Already marked conversation ${conversationId} as read, skipping`);
            return;
        }
        
        console.log('Marking messages as read for conversation:', conversationId);
        lastMarkedConversationRef.current = conversationId;
        
        setUnreadMessages(prev => {
            // If there are no unread messages for this conversation, don't update state
            if (!prev[conversationId]) {
                return prev;
            }
            
            const newState = { ...prev };
            delete newState[conversationId];
            return newState;
        });
        
        setActiveConversationId(conversationId);
    }, []);
    
    // Function to clear active conversation when leaving the chat
    const clearActiveConversation = useCallback(() => {
        console.log('Clearing active conversation');
        lastMarkedConversationRef.current = null;
        setActiveConversationId(null);
    }, []);
    
    // Check if there are any new notifications for the likes tab
    const hasLikesNotifications = useCallback(() => {
        const result = hasNewLikes || hasNewMatches;
        console.log('hasLikesNotifications called, result:', result);
        return result;
    }, [hasNewLikes, hasNewMatches]);
    
    // Check if there are any new chat notifications
    const hasChatNotifications = useCallback(() => {
        const result = Object.keys(unreadMessages).length > 0;
        console.log('hasChatNotifications called, result:', result);
        return result;
    }, [unreadMessages]);
    
    // Check if there are any system notifications
    const hasSystemNotifications = useCallback(() => {
        const result = systemNotifications.some(notification => !notification.read);
        console.log('hasSystemNotifications called, result:', result);
        return result;
    }, [systemNotifications]);
    
    // Get unread count for a specific conversation
    const getUnreadCount = useCallback((conversationId) => {
        return unreadMessages[conversationId] || 0;
    }, [unreadMessages]);
    
    const value = {
        hasNewLikes,
        hasNewMatches,
        unreadMessages,
        activeConversationId,
        systemNotifications,
        markLikesAsRead,
        markMatchesAsRead,
        markMessagesAsRead,
        markSystemNotificationsAsRead,
        clearActiveConversation,
        hasLikesNotifications,
        hasChatNotifications,
        hasSystemNotifications,
        getUnreadCount
    };
    
    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}; 