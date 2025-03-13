import React from 'react';
import { IoSettingsSharp, IoLogOutOutline, IoEye } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import NotificationBell from './NotificationBell';
import '../styles/components/PageHeader.css';

const PageHeader = ({ showSettings, onSettingsClick}) => {
    const navigate = useNavigate();

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
            console.error('Logout failed:', error);
        }
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
                <NotificationBell />
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