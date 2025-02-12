import React from 'react';
import BottomNavBar from '../components/BottomNavBar';
import PageHeader from '../components/PageHeader';
import '../styles/pages/shared.css';
import '../styles/pages/Maps.css';

const Maps = () => {
    return (
        <div className="page-container">
            <PageHeader />
            <div className="content">
                <h1>Maps</h1>
                <p>Find matches near you!</p>
                {/* Map implementation */}
            </div>
            <BottomNavBar />
        </div>
    );
};

export default Maps; 