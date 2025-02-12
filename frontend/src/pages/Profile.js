import React, { useState, useEffect } from 'react';
import BottomNavBar from '../components/BottomNavBar';
import PageHeader from '../components/PageHeader';
import axios from '../config/axios';
import '../styles/pages/shared.css';
import '../styles/pages/Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get('/api/user/profile');
                console.log(response.data);
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, []);

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
            <BottomNavBar />
        </div>
    );
};

export default Profile; 