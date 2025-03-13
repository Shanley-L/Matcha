import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoNotificationsOutline } from 'react-icons/io5';
import { useNotifications } from '../context/NotificationContext';
import axios from '../config/axios';
import '../styles/components/NotificationBell.css';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Log notifications when they change
  useEffect(() => {
    console.log('NotificationBell: Current notifications:', notifications);
    console.log('NotificationBell: Unread count:', unreadCount);
  }, [notifications, unreadCount]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = async () => {
    console.log('NotificationBell: Toggling dropdown, current state:', isOpen);
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      console.log('NotificationBell: Marking all notifications as read');
      markAllAsRead();
      try {
        await axios.post('/api/user/notifications/read');
        console.log('NotificationBell: All notifications marked as read on server');
      } catch (error) {
        console.error('NotificationBell: Error marking all notifications as read:', error);
      }
    }
  };

  const handleNotificationClick = async (notification) => {
    console.log('NotificationBell: Notification clicked:', notification);
    markAsRead(notification.id);
    try {
      await axios.post(`/api/user/notifications/read/${notification.id}`);
      console.log(`NotificationBell: Notification ${notification.id} marked as read on server`);
    } catch (error) {
      console.error(`NotificationBell: Error marking notification ${notification.id} as read:`, error);
    }
    switch (notification.type) {
      case 'like':
        console.log('NotificationBell: Navigating to /likes');
        navigate('/likes');
        break;
      case 'match':
        console.log('NotificationBell: Navigating to /chats');
        navigate('/chats');
        break;
      case 'message':
        navigate('/chats');
        break;
      case 'unmatch':
        console.log('NotificationBell: Navigating to /matches');
        navigate('/likes');
        break;
      default:
        console.log('NotificationBell: Navigating to / (default case)');
        navigate('/home');
    }
    setIsOpen(false);
  };

  // Format timestamp to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor(((now - notificationTime) / 1000)- 3600);
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button className="notification-bell-button" onClick={toggleDropdown}>
        <IoNotificationsOutline />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button className="mark-all-read" onClick={async () => {
                markAllAsRead();
                // Call API to mark all notifications as read
                try {
                  await axios.post('/api/user/notifications/read');
                  console.log('NotificationBell: All notifications marked as read on server');
                } catch (error) {
                  console.error('NotificationBell: Error marking all notifications as read:', error);
                }
              }}>
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatRelativeTime(notification.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 