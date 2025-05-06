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
    const [distance, setDistance] = useState(10);
    const [fameRating, setFameRating] = useState(100);
    // Temporary filter state for the filter panel
    const [tempMinAge, setTempMinAge] = useState(minAge);
    const [tempMaxAge, setTempMaxAge] = useState(maxAge);
    const [tempDistance, setTempDistance] = useState(distance);
    const [tempFameRating, setTempFameRating] = useState(fameRating);
    const [sortBy, setSortBy] = useState('interest'); // default: common interest
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const [sortedMatches, setSortedMatches] = useState([]);
    const [isSortOpen, setIsSortOpen] = useState(false);

    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
        // When opening, sync temp state with current filters
        if (!isFilterOpen) {
            setTempMinAge(minAge);
            setTempMaxAge(maxAge);
            setTempDistance(distance);
            setTempFameRating(fameRating);
        }
    };

    const handleMinAgeChange = (e) => {
        const value = parseInt(e.target.value);
        setTempMinAge(Math.min(value, tempMaxAge - 1));
    };

    const handleMaxAgeChange = (e) => {
        const value = parseInt(e.target.value);
        setTempMaxAge(Math.max(value, tempMinAge + 1));
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
                    max_age: maxAge,
                    distance: distance,
                    fame_rating: fameRating
                }
            });
            setPotentialMatches(response.data);
        } catch (error) {
            console.error('Error fetching matches:', error);
        }
    }, [minAge, maxAge, distance, fameRating]);

    const handleSwipe = async (direction, userId) => {
        try {
            if (direction === 'right') {
                await axios.post(`/api/user/like/${userId}`);
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
        setMinAge(tempMinAge);
        setMaxAge(tempMaxAge);
        setDistance(tempDistance);
        setFameRating(tempFameRating);
        setCurrentIndex(0);
        setPotentialMatches([]);
        setIsFilterOpen(false);
        await fetchPotentialMatches();
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const userResponse = await axios.get('/api/user/profile');
                if (userResponse.data.looking_for) {
                    setSelectedGender(userResponse.data.looking_for);
                }
                await fetchPotentialMatches();
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };
        
        fetchInitialData();
    }, [fetchPotentialMatches]);

    useEffect(() => {
        fetchPotentialMatches();
    }, [minAge, maxAge, distance, fameRating, fetchPotentialMatches]);

    useEffect(() => {
        // Sorting logic for matches
        function sortMatches(matches, sortBy, sortOrder) {
            const sorted = [...matches];
            const order = sortOrder === 'asc' ? 1 : -1;
            switch (sortBy) {
                case 'age':
                    // Youngest first (asc), oldest first (desc)
                    sorted.sort((a, b) => {
                        if (!a.birthdate || !b.birthdate) return 0;
                        return (new Date(a.birthdate) - new Date(b.birthdate)) * order;
                    });
                    break;
                case 'location':
                    // Nearest first (asc), farthest first (desc)
                    sorted.sort((a, b) => {
                        if (a.distance_km == null) return 1;
                        if (b.distance_km == null) return -1;
                        return (a.distance_km - b.distance_km) * order;
                    });
                    break;
                case 'fame':
                    // Highest fame first (desc), lowest first (asc)
                    sorted.sort((a, b) => ((b.fame_rate || 0) - (a.fame_rate || 0)) * order);
                    break;
                case 'interest':
                default:
                    // Most common interests first (desc), least first (asc)
                    sorted.sort((a, b) => ((b.match_score || 0) - (a.match_score || 0)) * order);
                    break;
            }
            return sorted;
        }
        setSortedMatches(sortMatches(potentialMatches, sortBy, sortOrder));
    }, [potentialMatches, sortBy, sortOrder]);

    // When sortBy changes, set default sortOrder
    useEffect(() => {
        if (sortBy === 'age') {
            setSortOrder('asc');
        } else {
            setSortOrder('desc');
        }
    }, [sortBy]);

    return (
        <div className="home-container" style={{ width: '100%' }}>
            <PageHeader 
                showSettings={true} 
                onSettingsClick={toggleFilter}
                showSort={true}
                onSortClick={() => setIsSortOpen((open) => !open)}
            />
            {/* Sort Dropdown Popout */}
            {isSortOpen && (
                <div className="sort-popout">
                    <div className="sort-popout-content">
                        <div className="sort-popout-header">
                            <button className="close-sort-popout" onClick={() => setIsSortOpen(false)} aria-label="Close sort popout">×</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 8 }}>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="sort-dropdown"
                            >
                                <option value="interest">Common Interest</option>
                                <option value="age">Age</option>
                                <option value="location">Location</option>
                                <option value="fame">Fame Rating</option>
                            </select>
                            <button
                                type="button"
                                className="sort-order-toggle"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                aria-label="Toggle sort order"
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="cards-container">
                {sortedMatches.length > currentIndex && (
                    <div className="card-wrapper">
                        <SwipeCard
                            key={sortedMatches[currentIndex].id}
                            user={sortedMatches[currentIndex]}
                            onSwipe={handleSwipe}
                        />
                    </div>
                )}
                {(sortedMatches.length === 0 || currentIndex >= sortedMatches.length) && (
                    <div className="empty-state-message">
                        No more profiles to show right now!
                        Try changing settings or wait for new profiles to be added.
                    </div>
                )}
                <div className="swipe-buttons">
                    <button 
                        className="swipe-button dislike"
                        onClick={() => handleSwipe('left', sortedMatches[currentIndex]?.id)}
                        disabled={!sortedMatches[currentIndex]}
                    >
                        <IoClose />
                    </button>
                    <button 
                        className="swipe-button like"
                        onClick={() => handleSwipe('right', sortedMatches[currentIndex]?.id)}
                        disabled={!sortedMatches[currentIndex]}
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
                                    <span>{tempMinAge}</span>
                                    <span>{tempMaxAge}</span>
                                </div>
                                <div className="slider-track">
                                    <input 
                                        type="range" 
                                        min="18" 
                                        max="100" 
                                        value={tempMinAge}
                                        onChange={handleMinAgeChange}
                                        className="slider min-slider"
                                    />
                                    <input 
                                        type="range" 
                                        min="18" 
                                        max="100" 
                                        value={tempMaxAge}
                                        onChange={handleMaxAgeChange}
                                        className="slider max-slider"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3>Filter by Distance</h3>
                        <div className="distance-range">
                            <div className="distance-slider-container">
                                <div className="distance-value">
                                    <span>{tempDistance} km</span>
                                </div>
                                <div className="slider-track">
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="100" 
                                        value={tempDistance}
                                        onChange={e => setTempDistance(Number(e.target.value))}
                                        className="slider distance-slider"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3>Filter by Fame Rating</h3>
                        <div className="fame-rating-range">
                            <div className="fame-rating-slider-container">
                                <div className="fame-rating-value">
                                    <span>{tempFameRating}%</span>
                                </div>
                                <div className="slider-track">
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="100" 
                                        value={tempFameRating}
                                        onChange={e => setTempFameRating(Number(e.target.value))}
                                        className="slider fame-rating-slider"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button className="reset-button" onClick={() => {
                            setTempMinAge(18);
                            setTempMaxAge(50);
                            setSelectedGender('female');
                            setTempDistance(10);
                            setTempFameRating(100);
                            setSortBy('interest');
                            setSortOrder('desc');
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