import React, { useState } from 'react';
import BottomNavBar from '../components/BottomNavBar';
import PageHeader from '../components/PageHeader';
import '../styles/pages/shared.css';
import '../styles/pages/Home.css';

const Home = () => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [minAge, setMinAge] = useState(18);
    const [maxAge, setMaxAge] = useState(50);
    const [selectedGender, setSelectedGender] = useState('female');

    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    const handleMinAgeChange = (e) => {
        const value = parseInt(e.target.value);
        setMinAge(Math.min(value, maxAge - 1));
    };

    const handleMaxAgeChange = (e) => {
        const value = parseInt(e.target.value);
        setMaxAge(Math.max(value, minAge + 1));
    };

    const handleGenderSelect = (gender) => {
        setSelectedGender(gender);
    };

    return (
        <div className="page-container">
            <PageHeader showSettings={true} onSettingsClick={toggleFilter} />
            <div className="content">
                <h1>Welcome to Matcha</h1>
                <p>Find your perfect match!</p>
                {/* Home content */}
            </div>

            <div className={`filter-panel ${isFilterOpen ? 'open' : ''}`}>
                <div className="filter-content">
                    <h2>Filter</h2>
                    <div className="filter-section">
                        <h3>Looking for</h3>
                        <div className="gender-buttons">
                            <button 
                                className={`filter-button ${selectedGender === 'male' ? 'active' : ''}`}
                                onClick={() => handleGenderSelect('male')}
                            >
                                Male
                            </button>
                            <button 
                                className={`filter-button ${selectedGender === 'female' ? 'active' : ''}`}
                                onClick={() => handleGenderSelect('female')}
                            >
                                Female
                            </button>
                            <button 
                                className={`filter-button ${selectedGender === 'everyone' ? 'active' : ''}`}
                                onClick={() => handleGenderSelect('everyone')}
                            >
                                Everyone
                            </button>
                        </div>
                    </div>
                    
                    <div className="filter-section">
                        <h3>Age range</h3>
                        <div className="age-range">
                            <div className="age-slider-container">
                                <div className="age-values">
                                    <span>{minAge}</span>
                                    <span>{maxAge}</span>
                                </div>
                                <div className="slider-track">
                                    <input 
                                        type="range" 
                                        min="18" 
                                        max="100" 
                                        value={minAge}
                                        onChange={handleMinAgeChange}
                                        className="slider min-slider"
                                    />
                                    <input 
                                        type="range" 
                                        min="18" 
                                        max="100" 
                                        value={maxAge}
                                        onChange={handleMaxAgeChange}
                                        className="slider max-slider"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3>Location</h3>
                        <input type="text" placeholder="Enter location" className="location-input" />
                    </div>

                    <div className="filter-actions">
                        <button className="reset-button">Reset</button>
                        <button className="apply-button">Apply</button>
                    </div>
                </div>
            </div>

            <BottomNavBar />
        </div>
    );
};

export default Home; 