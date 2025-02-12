import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoHome, IoMap, IoHeart, IoChatbubble, IoPerson } from 'react-icons/io5';
import '../styles/components/BottomNavBar.css';

const BottomNavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname.substring(1); // Remove the leading slash

    const handleTabClick = (tab) => {
        navigate(`/${tab}`);
    };

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
                <IoHeart className="nav-icon" />
                <span>Likes</span>
            </button>
            <button 
                className={`nav-item ${currentPath === 'chats' ? 'active' : ''}`}
                onClick={() => handleTabClick('chats')}
            >
                <IoChatbubble className="nav-icon" />
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