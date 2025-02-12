import React from 'react';
import BottomNavBar from '../components/BottomNavBar';
import PageHeader from '../components/PageHeader';
import '../styles/pages/shared.css';
import '../styles/pages/Chats.css';

const Chats = () => {
    return (
        <div className="page-container">
            <PageHeader />
            <div className="content">
                <h1>Chats</h1>
                <p>Connect with your matches!</p>
                {/* Add chat list and messages here */}
            </div>
            <BottomNavBar />
        </div>
    );
};

export default Chats; 