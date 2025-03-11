import React, { useState, useRef, useEffect } from 'react';
import { IoSettingsSharp, IoLogOutOutline, IoEye, IoNotificationsOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import axios from '../config/axios';
import '../styles/components/PageHeader.css';

const PageHeader = ({ showSettings, onSettingsClick}) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const { 
        hasNewLikes, 
        hasNewMatches, 
        unreadMessages, 
        hasChatNotifications,
        hasLikesNotifications,
        markLikesAsRead,
        markMatchesAsRead
    } = useNotifications();

    // Close notifications popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Debug notifications
    useEffect(() => {
        console.log('Notification state in PageHeader:', {
            hasNewLikes,
            hasNewMatches,
            unreadMessages,
            hasLikesNotifs: hasLikesNotifications(),
            hasChatNotifs: hasChatNotifications()
        });
    }, [hasNewLikes, hasNewMatches, unreadMessages, hasLikesNotifications, hasChatNotifications]);

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const onViewersClick = async () => {
        try {
            await navigate('/viewers');
        } catch (error) {
            console.error('Navigation failed:', error);
        }
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    // Calculate total unread messages
    const totalUnreadMessages = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);
    
    // Check if there are any notifications - properly call the functions
    const hasAnyNotifications = hasLikesNotifications() || hasChatNotifications();

    // Handle navigation with marking notifications as read
    const handleViewLikes = () => {
        markLikesAsRead();
        markMatchesAsRead();
        navigate('/likes');
        setShowNotifications(false);
    };

    const handleViewChats = () => {
        navigate('/chats');
        setShowNotifications(false);
    };

    return (
        <header className="page-header">
            <div className="logo-container">
                <div className="logo">
                    <div className="logo-heart"><i className="fa-solid fa-heart"></i></div>
                    <div className="logo-dot"></div>
                </div>
            </div>
            <div className="header-buttons">
                <div className="notification-container" ref={notificationRef}>
                    <button className="notification-button" onClick={toggleNotifications}>
                        <IoNotificationsOutline />
                        {hasAnyNotifications && <span className="notification-badge"></span>}
                    </button>
                    
                    {showNotifications && (
                        <div className="notification-popup">
                            <h3>Notifications</h3>
                            <div className="notification-list">
                                {hasNewLikes && (
                                    <div className="notification-item">
                                        <p>You have new likes!</p>
                                        <button onClick={handleViewLikes}>View Likes</button>
                                    </div>
                                )}
                                {hasNewMatches && (
                                    <div className="notification-item">
                                        <p>You have new matches!</p>
                                        <button onClick={handleViewLikes}>View Matches</button>
                                    </div>
                                )}
                                {totalUnreadMessages > 0 && (
                                    <div className="notification-item">
                                        <p>You have {totalUnreadMessages} unread message{totalUnreadMessages !== 1 ? 's' : ''}!</p>
                                        <button onClick={handleViewChats}>View Messages</button>
                                    </div>
                                )}
                                {!hasAnyNotifications && (
                                    <div className="notification-item">
                                        <p>No new notifications</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                {showSettings && (
                    <button className="settings-button" onClick={onSettingsClick}>
                        <IoSettingsSharp />
                    </button>
                )}
                <button className="settings-button" onClick={onViewersClick}>
                    <IoEye />
                </button>
                <button className="logout-button" onClick={handleLogout}>
                    <IoLogOutOutline />
                </button>
            </div>
        </header>
    );
};

export default PageHeader; 