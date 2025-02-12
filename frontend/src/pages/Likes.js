import React from 'react';
import BottomNavBar from '../components/BottomNavBar';
import PageHeader from '../components/PageHeader';
import '../styles/pages/shared.css';
import '../styles/pages/Likes.css';

const Likes = () => {
    return (
        <div className="page-container">
            <PageHeader />
            <div className="content">
                <h1>Likes</h1>
                <p>See who likes you and your matches!</p>
                {/* Likes content */}
            </div>
            <BottomNavBar />
        </div>
    );
};

export default Likes; 