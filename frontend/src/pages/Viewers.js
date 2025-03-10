import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';
import PageHeader from '../components/PageHeader';
import axios from '../config/axios';
import '../styles/pages/shared.css';
import '../styles/pages/Viewers.css';

const Viewers = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await axios.get('/api/user/profile');
                setUser(response.data);
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleVisit = (viewerId) => {
        navigate(`/user/${viewerId}`);
    };

    if (loading) {
        return (
            <div className="page-container">
                <PageHeader />
                <div className="content">
                    <div className="viewers-container">
                        <p>Loading...</p>
                    </div>
                </div>
                <BottomNavBar />
            </div>
        );
    }

    return (
        <div className="page-container">
            <PageHeader />
            <div className="content">
                <div className="viewers-list">
                <h1 className="page-title">Profile views</h1>
                    {user.viewers && user.viewers.length > 0 ? (
                        user.viewers.map((viewer) => (
                            <div key={viewer.id} className="viewer-item">
                                <div className="viewer-info">
                                    <img src={`./shared/uploads` + viewer.photo} alt={viewer.username} className="viewer-photo" />
                                    <div className="viewer-details">
                                        <h3>{viewer.username}</h3>
                                        <p>Visited your profile</p>
                                    </div>
                                </div>
                                <button 
                                    className="visit-button"
                                    onClick={() => handleVisit(viewer.id)}
                                >
                                    Visit
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No viewers available</p>
                    )}
                </div>
            </div>
            <BottomNavBar />
        </div>
    );
};

export default Viewers;