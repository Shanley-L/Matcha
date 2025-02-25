import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
import '../styles/components/Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const { socket } = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        if (socket) {
            socket.on('new_notification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
            });
        }
    }, [socket]);

    const handleNotificationClick = (notification) => {
        switch (notification.type) {
            case 'like':
                navigate('/likes');
                break;
            case 'match':
                navigate('/matches');
                break;
            case 'message':
                navigate(`/chat/${notification.data.conversation_id}`);
                break;
            default:
                break;
        }
        removeNotification(notification);
    };

    const removeNotification = (notificationToRemove) => {
        setNotifications(prev => 
            prev.filter(notification => notification !== notificationToRemove)
        );
    };

    return (
        <div className="notifications-container">
            {notifications.map((notification, index) => (
                <div
                    key={index}
                    className={`notification ${notification.type}`}
                    onClick={() => handleNotificationClick(notification)}
                >
                    <div className="notification-content">
                        {notification.data.message}
                    </div>
                    <button
                        className="close-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification);
                        }}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Notifications; 