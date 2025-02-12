import React from 'react';
import BottomNavBar from '../components/BottomNavBar';
import PageHeader from '../components/PageHeader';
import '../styles/pages/shared.css';
import '../styles/pages/Profile.css';

const Profile = () => {
    return (
        <div className="page-container">
            <PageHeader />
            <div className="content">
                <h1>Profile</h1>
                <p>Edit your profile</p>
                {/* Profile content */}
            </div>
            <BottomNavBar />
        </div>
    );
};

export default Profile; 