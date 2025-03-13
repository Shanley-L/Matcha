import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWhoAmI } from './WhoAmIContext';

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

  // Listen for socket notifications
  useEffect(() => {
    if (!socket || !me) {
      console.log('NotificationContext: Socket or user not available', { 
        socketExists: !!socket, 
        userExists: !!me,
        userId: me?.id 
      });
      return;
    }

    console.log('NotificationContext: Setting up notification listeners for user', me.id);

    // Handle new notifications
    const handleNewNotification = (data) => {
      console.log('New notification received:', data);
      
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
      
      console.log('Adding notification to state:', notification);
      addNotification(notification);
    };

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

    // Debug socket connection
    socket.on('connect', () => {
      console.log('NotificationContext: Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('NotificationContext: Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('NotificationContext: Socket connection error:', error);
    });

    // Set up socket listeners
    socket.on('new_notification', handleNewNotification);
    console.log('NotificationContext: Listening for "new_notification" events');
    
    // Also listen for broadcast notifications (fallback)
    socket.on('broadcast_notification', (data) => {
      console.log('NotificationContext: Broadcast notification received:', data);
      
      // Only process if this notification is for the current user
      if (data.target_user_id && data.target_user_id === me.id) {
        console.log('NotificationContext: Processing broadcast notification for current user');
        handleNewNotification(data);
      } else {
        console.log('NotificationContext: Ignoring broadcast notification for other user');
      }
    });
    
    // Also listen for new messages as notifications
    socket.on('new_message', (data) => {
      console.log('NotificationContext: New message received:', data);
      // Only create notification if the message is from someone else
      const senderId = data.message?.sender?.id || data.sender_id;
      if (senderId && senderId !== me.id) {
        const senderName = data.message?.sender?.firstname || 'Someone';
        const messageContent = data.message?.message || data.content || '';
        
        console.log('NotificationContext: Creating notification from message');
        handleNewNotification({
          type: 'message',
          id: `message-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          sender: {
            id: senderId,
            firstname: senderName
          },
          conversation_id: data.conversation_id,
          message: messageContent,
          timestamp: data.timestamp || new Date().toISOString()
        });
      } else {
        console.log('NotificationContext: Skipping notification for own message');
      }
    });
    
    // Listen for notification read events
    socket.on('notification_read', (data) => {
      console.log('NotificationContext: Notification read event received:', data);
      if (data.notification_id) {
        markAsRead(data.notification_id);
      }
    });
    
    // Listen for notification type read events
    socket.on('notification_type_read', (data) => {
      console.log('NotificationContext: Notification type read event received:', data);
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
      console.log('NotificationContext: All notifications read event received');
      markAllAsRead();
    });

    // Clean up listeners on unmount
    return () => {
      console.log('NotificationContext: Cleaning up socket listeners');
      socket.off('new_notification');
      socket.off('broadcast_notification');
      socket.off('new_message');
      socket.off('notification_read');
      socket.off('notification_type_read');
      socket.off('all_notifications_read');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, [socket, me, addNotification, markAsRead, markAllAsRead]);

  // Value to be provided by the context
  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 