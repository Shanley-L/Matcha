import React, { useState, useEffect } from 'react';
import BottomNavBar from '../components/BottomNavBar';
import PageHeader from '../components/PageHeader';
import axios from '../config/axios';
import '../styles/pages/shared.css';
import '../styles/pages/Profile.css';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [addingLikes, setAddingLikes] = useState(false);
    const [likesAdded, setLikesAdded] = useState(false);

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
        console.log("loadProfile");
        loadProfile();
    }, []); // Only run once when component mounts

    const handleAddTestLikes = async () => {
        try {
            setAddingLikes(true);
            const response = await axios.post('/api/user/add-test-likes');
            alert(response.data.message);
            setLikesAdded(true);
        } catch (error) {
            console.error('Error adding test likes:', error);
            alert('Error adding test likes. Please try again.');
        } finally {
            setAddingLikes(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <PageHeader />
                <div className="content">
                    <div className="profile-info">
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
                <h1>Profile</h1>
                {user && (
                    <div className="profile-info">
                        <h1>Welcome, {user.firstname}!</h1>
                        <p>Edit your profile</p>
                    </div>
                )}
            </div>
            {!likesAdded && (
                <div className="test-likes-button-container">
                    <button 
                        onClick={handleAddTestLikes}
                        disabled={addingLikes}
                        className="test-likes-button"
                    >
                        {addingLikes ? 'Adding Likes...' : 'Add Test Likes'}
                    </button>
                </div>
            )}
            <BottomNavBar />
        </div>
    );
};

export default Profile; 