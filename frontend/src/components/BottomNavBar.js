import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoHome, IoMap, IoHeart, IoChatbubble, IoPerson } from 'react-icons/io5';
import { useNotifications } from '../context/NotificationContext';
import '../styles/components/BottomNavBar.css';

const BottomNavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname.substring(1); // Remove the leading slash
    const { 
        hasLikesNotifications, 
        hasChatNotifications, 
        markLikesAsRead,
        clearActiveConversation 
    } = useNotifications();

    const handleTabClick = (tab) => {
        navigate(`/${tab}`);
        
        // Mark notifications as read when navigating to the likes page
        if (tab === 'likes') {
            markLikesAsRead();
        }
        
        // Clear active conversation when navigating away from chats
        if (currentPath === 'chats' && tab !== 'chats') {
            clearActiveConversation();
        }
    };

    // Only show chat notifications if we're not already on the chats page
    const shouldShowChatNotifications = hasChatNotifications() && currentPath !== 'chats';

    return (
        <nav className="bottom-nav">
            <button 
                className={`nav-item ${currentPath === 'home' ? 'active' : ''}`}
                onClick={() => handleTabClick('home')}
            >
                <IoHome className="nav-icon" />
                <span>Home</span>
            </button>
            <button 
                className={`nav-item ${currentPath === 'maps' ? 'active' : ''}`}
                onClick={() => handleTabClick('maps')}
            >
                <IoMap className="nav-icon" />
                <span>Maps</span>
            </button>
            <button 
                className={`nav-item ${currentPath === 'likes' ? 'active' : ''}`}
                onClick={() => handleTabClick('likes')}
            >
                <div className="nav-icon-container">
                    <IoHeart className="nav-icon" />
                    {hasLikesNotifications() && <span className="notification-dot"></span>}
                </div>
                <span>Likes</span>
            </button>
            <button 
                className={`nav-item ${currentPath === 'chats' ? 'active' : ''}`}
                onClick={() => handleTabClick('chats')}
            >
                <div className="nav-icon-container">
                    <IoChatbubble className="nav-icon" />
                    {shouldShowChatNotifications && (
                        <span className="notification-dot"></span>
                    )}
                </div>
                <span>Chats</span>
            </button>
            <button 
                className={`nav-item ${currentPath === 'profile' ? 'active' : ''}`}
                onClick={() => handleTabClick('profile')}
            >
                <IoPerson className="nav-icon" />
                <span>Profile</span>
            </button>
        </nav>
    );
};

export default BottomNavBar;