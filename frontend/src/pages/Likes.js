import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import BottomNavBar from '../components/BottomNavBar';
import PageHeader from '../components/PageHeader';
import '../styles/pages/shared.css';
import '../styles/pages/Likes.css';

const Likes = () => {
    const [matches, setMatches] = useState([]);
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const matchesResponse = await axios.get('/api/user/getmatches');
            setMatches(matchesResponse.data);

            const likesResponse = await axios.get('/api/user/likes');
            setLikes(likesResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    };

    const handleAddTestLikes = async () => {
        try {
            const response = await axios.post('/api/user/add-test-likes');
            if (response.data.status === 'success') {
                await fetchData();
            }
        } catch (error) {
            console.error('Error adding test likes:', error);
        }
    };

    const navigateToProfile = (userId) => {
        navigate(`/user/${userId}`);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const renderUserGrid = (users, emptyMessage) => {
        if (users.length === 0) {
            return <div className="no-results">{emptyMessage}</div>;
        }

        return (
            <div className="user-grid">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="user-card"
                        onClick={() => navigateToProfile(user.id)}
                    >
                        <div
                            className="user-photo"
                            style={{
                                backgroundImage: `url(${user.photos && user.photos.length > 0 
                                    ? '/shared/uploads' + user.photos[0] 
                                    : '/default-profile.png'})`
                            }}
                        />
                        <div className="user-info">
                            <h3>{user.firstname}</h3>
                            <p>{user.country}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="page-container">
                <PageHeader />
                <div className="content">
                    <div className="loading">Loading...</div>
                </div>
                <BottomNavBar />
            </div>
        );
    }

    return (
        <div className="page-container">
            <PageHeader />
            <div className="content">
                <div className="likes-container">
                    <button 
                        className="add-test-likes-button"
                        onClick={handleAddTestLikes}
                    >
                        Add Test Likes
                    </button>

                    <div className="likes-section">
                        <h2>Matches</h2>
                        {renderUserGrid(matches, 'No matches yet')}
                    </div>

                    <div className="likes-section">
                        <h2>Likes</h2>
                        {renderUserGrid(likes, 'No likes yet')}
                    </div>
                </div>
            </div>
            <BottomNavBar />
        </div>
    );
};

export default Likes; 