import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWhoAmI } from './WhoAmIContext';
import axios from '../config/axios';

// Create the context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeConversation, setActiveConversation] = useState(null);
  const { socket, me } = useWhoAmI();

  // Add a new notification
  const addNotification = useCallback((notification) => {
    setNotifications(prev => {
      // Check if notification with same ID already exists
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;
      
      // Add new notification at the beginning of the array
      const newNotifications = [
        { ...notification, read: false, timestamp: notification.timestamp || new Date().toISOString() },
        ...prev
      ];
      
      // Update unread count
      setUnreadCount(count => count + 1);
      
      return newNotifications;
    });
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(notification => {
        if (notification.id === notificationId && !notification.read) {
          setUnreadCount(count => Math.max(0, count - 1));
          return { ...notification, read: true };
        }
        return notification;
      });
      return updated;
    });
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, read: true }));
      setUnreadCount(0);
      return updated;
    });
  }, []);

  // Clear a specific notification
  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Set active conversation
  const setActiveConversationId = useCallback((conversationId) => {
    // Only update if the value is actually changing
    setActiveConversation(prevConversation => {
      if (prevConversation === conversationId) return prevConversation;
      
      // Tell the backend about the active conversation change
      if (socket) {
        if (conversationId) {
          socket.emit('join_chat', { conversation_id: conversationId });
        } else if (prevConversation) {
          socket.emit('leave_chat', { conversation_id: prevConversation });
        }
      }
      
      // Mark all message notifications for this conversation as read
      if (conversationId) {
        try {
          axios.post(`/api/user/notifications/read/type/message`);
          
          setNotifications(prev => {
            const updated = prev.map(notification => {
              if (
                notification.type === 'message' && 
                notification.data?.conversation_id === conversationId && 
                !notification.read
              ) {
                setUnreadCount(count => Math.max(0, count - 1));
                return { ...notification, read: true };
              }
              return notification;
            });
            return updated;
          });
        } catch (error) {
          console.error(`Error marking message notifications as read:`, error);
        }
      }
      
      return conversationId;
    });
  }, [socket]);

  // Listen for socket notifications
  useEffect(() => {
    if (!socket || !me) {
      return;
    }

    // Function to generate notification message based on type
    const getNotificationMessage = (data) => {
      switch (data.type) {
        case 'match':
          return `You matched with ${data.user?.firstname || 'someone new'}!`;
        case 'like':
          return `${data.user?.firstname || 'Someone'} liked your profile!`;
        case 'message':
          return `New message from ${data.sender?.firstname || 'someone'}`;
        case 'unmatch':
          return `${data.user?.firstname || 'Someone'} unmatched with you`;
        default:
          return 'You have a new notification';
      }
    };

    // Handle all types of notifications
    const handleNotification = (data) => {
      // Skip message notifications for the active conversation
      if (
        data.type === 'message' && 
        activeConversation && 
        (data.conversation_id === activeConversation || 
         data.conversation_id === activeConversation.toString())
      ) {
        return;
      }
      // Generate a unique ID if not provided
      const notificationId = data.id || `${data.type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      // Create notification object
      const notification = {
        id: notificationId,
        type: data.type,
        message: getNotificationMessage(data),
        timestamp: data.timestamp || new Date().toISOString(),
        data: data,
        read: false
      };
      addNotification(notification);
    };

    // Set up socket listeners
    socket.on('new_notification', handleNotification);
    // Also listen for broadcast notifications (fallback)
    socket.on('broadcast_notification', (data) => {
      // Only process if this notification is for the current user
      if (data.target_user_id && data.target_user_id === me.id) {
        handleNotification(data);
      } else {
        
      }
    });
    // Listen for notification read events
    socket.on('notification_read', (data) => {
      if (data.notification_id) {
        markAsRead(data.notification_id);
      }
    });
    // Listen for notification type read events
    socket.on('notification_type_read', (data) => {
      if (data.notification_type) {
        setNotifications(prev => {
          const updated = prev.map(notification => {
            if (notification.type === data.notification_type && !notification.read) {
              setUnreadCount(count => Math.max(0, count - 1));
              return { ...notification, read: true };
            }
            return notification;
          });
          return updated;
        });
      }
    });
    // Listen for all notifications read events
    socket.on('all_notifications_read', () => {
      markAllAsRead();
    });
    // Clean up listeners on unmount
    return () => {
      socket.off('new_notification');
      socket.off('broadcast_notification');
      socket.off('notification_read');
      socket.off('notification_type_read');
      socket.off('all_notifications_read');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, [socket, me, addNotification, markAsRead, markAllAsRead, activeConversation]);

  // Value to be provided by the context
  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    activeConversation,
    setActiveConversation: setActiveConversationId
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 