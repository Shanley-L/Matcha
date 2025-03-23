import React, { useState, useEffect, useCallback } from 'react';
import axios from '../config/axios';
import SwipeCard from '../components/SwipeCard';
import BottomNavBar from '../components/BottomNavBar';
import PageHeader from '../components/PageHeader';
import '../styles/pages/shared.css';
import '../styles/pages/Home.css';
import { IoClose, IoHeart } from 'react-icons/io5';

const Home = () => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [minAge, setMinAge] = useState(18);
    const [maxAge, setMaxAge] = useState(50);
    const [selectedGender, setSelectedGender] = useState('female');
    const [potentialMatches, setPotentialMatches] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);

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

    const handleGenderSelect = async (gender) => {
        try {
            setIsUpdating(true);
            const formData = new FormData();
            formData.append('looking_for', JSON.stringify(gender));
            await axios.put('/api/user/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            setSelectedGender(gender);
            setPotentialMatches([]);
            setCurrentIndex(0);
            await fetchPotentialMatches();
        } catch (error) {
            console.error('Error updating preference:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const fetchPotentialMatches = useCallback(async () => {
        try {
            const response = await axios.get('/api/user/matches', {
                params: {
                    min_age: minAge,
                    max_age: maxAge
                }
            });
            setPotentialMatches(response.data);
        } catch (error) {
            console.error('Error fetching matches:', error);
        }
    }, [minAge, maxAge]);

    const handleSwipe = async (direction, userId) => {
        try {
            if (direction === 'right') {
                const response = await axios.post(`/api/user/like/${userId}`);
                if (response.data.is_match) {
                    console.log('It\'s a match!');
                }
            } else {
                await axios.post(`/api/user/dislike/${userId}`);
            }
            setCurrentIndex(prevIndex => prevIndex + 1);
            // If we're running low on cards, fetch more
            if (currentIndex >= potentialMatches.length - 3) {
                fetchPotentialMatches();
            }
        } catch (error) {
            console.error('Error processing swipe:', error);
        }
    };

    const handleApplyFilters = async () => {
        setCurrentIndex(0);
        setPotentialMatches([]);
        await fetchPotentialMatches();
        setIsFilterOpen(false);
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const userResponse = await axios.get('/api/user/profile');
                if (userResponse.data.looking_for) {
                    setSelectedGender(userResponse.data.looking_for);
                    console.log("test"); 
                }
                await fetchPotentialMatches();
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };
        
        fetchInitialData();
    }, [fetchPotentialMatches]);

    return (
        <div className="home-container" style={{ width: '100%' }}>
            <PageHeader showSettings={true} onSettingsClick={toggleFilter} />
            
            <div className="cards-container">
                {potentialMatches.length > currentIndex && (
                    <div className="card-wrapper">
                        <SwipeCard
                            key={potentialMatches[currentIndex].id}
                            user={potentialMatches[currentIndex]}
                            onSwipe={handleSwipe}
                        />
                    </div>
                )}
                {(potentialMatches.length === 0 || currentIndex >= potentialMatches.length) && (
                    <div className="empty-state-message">
                        No more profiles to show right now!
                        Try changing settings or wait for new profiles to be added.
                    </div>
                )}
                <div className="swipe-buttons">
                    <button 
                        className="swipe-button dislike"
                        onClick={() => handleSwipe('left', potentialMatches[currentIndex]?.id)}
                        disabled={!potentialMatches[currentIndex]}
                    >
                        <IoClose />
                    </button>
                    <button 
                        className="swipe-button like"
                        onClick={() => handleSwipe('right', potentialMatches[currentIndex]?.id)}
                        disabled={!potentialMatches[currentIndex]}
                    >
                        <IoHeart />
                    </button>
                </div>
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
                                disabled={isUpdating}
                            >
                                Male
                            </button>
                            <button 
                                className={`filter-button ${selectedGender === 'female' ? 'active' : ''}`}
                                onClick={() => handleGenderSelect('female')}
                                disabled={isUpdating}
                            >
                                Female
                            </button>
                            <button 
                                className={`filter-button ${selectedGender === 'other' ? 'active' : ''}`}
                                onClick={() => handleGenderSelect('other')}
                                disabled={isUpdating}
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
                        <button className="reset-button" onClick={() => {
                            setMinAge(18);
                            setMaxAge(50);
                            setSelectedGender('female');
                        }}>Reset</button>
                        <button className="apply-button" onClick={handleApplyFilters}>Apply</button>
                    </div>
                </div>
            </div>

            <BottomNavBar />
        </div>
    );
};

export default Home; 