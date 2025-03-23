import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';
import PageHeader from '../components/PageHeader';
import axios from '../config/axios';
import '../styles/pages/shared.css';
import '../styles/pages/Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [fameRate, setFameRate] = useState({ likes: 0, dislikes: 0, fame_rate: 0 });

    // Available interests for selection
    const availableInterests = [
        { id: 'gaming', name: 'Gaming' },
        { id: 'dancing_singing', name: 'Dancing & Singing' },
        { id: 'language', name: 'Language' },
        { id: 'movie', name: 'Movie' },
        { id: 'book_novel', name: 'Book & Novel' },
        { id: 'architecture', name: 'Architecture' },
        { id: 'photography', name: 'Photography' },
        { id: 'fashion', name: 'Fashion' },
        { id: 'writing', name: 'Writing' },
        { id: 'nature_plant', name: 'Nature & Plant' },
        { id: 'painting', name: 'Painting' },
        { id: 'football', name: 'Football' },
        { id: 'animals', name: 'Animals' },
        { id: 'people_society', name: 'People & Society' },
        { id: 'gym_fitness', name: 'Gym & Fitness' },
        { id: 'food_drink', name: 'Food & Drink' },
        { id: 'travel_places', name: 'Travel & Places' },
        { id: 'art', name: 'Art' }
    ];

    const calculateAge = (birthdate) => {
        const birth = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await axios.get('/api/user/profile');
                setUser(response.data);
                setIsConnected(response.data.is_connected);
                
                // Get fame rate
                const fameResponse = await axios.get('/api/user/fame-rate');
                setFameRate(fameResponse.data);
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const nextPhoto = () => {
        if (user?.photos?.length) {
            setCurrentPhotoIndex((prev) => (prev + 1) % user.photos.length);
        }
    };

    const prevPhoto = () => {
        if (user?.photos?.length) {
            setCurrentPhotoIndex((prev) => (prev - 1 + user.photos.length) % user.photos.length);
        }
    };

    const handleEditClick = () => {
        navigate('/edit-profile');
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
                <div className='photo-gallery-container'>
                    {user.photos && user.photos.length > 0 ? (
                        <>
                            <div className='photo-gallery'>
                                <img 
                                    src={`./shared/uploads` + user.photos[currentPhotoIndex]} 
                                    alt="user pics" 
                                    className='profile-photos'
                                />
                                <button className="gallery-nav prev" onClick={prevPhoto}>
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <button className="gallery-nav next" onClick={nextPhoto}>
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                            <div className="photo-indicators">
                                {user.photos.map((_, index) => (
                                    <span 
                                        key={index}
                                        className={`photo-indicator ${index === currentPhotoIndex ? 'active' : ''}`}
                                        onClick={() => setCurrentPhotoIndex(index)}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <p>No photos available</p>
                    )}
                </div>

                {user && (
                    <div className="profile-info">
                        <div className="profile-header">
                            <h1>
                                {user.firstname}
                                <span>, {calculateAge(user.birthdate)} ans</span>
                            </h1>
                            <i className="fa-solid fa-pen-to-square" onClick={handleEditClick} style={{ cursor: 'pointer' }}></i>
                        </div>
                        <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                marginTop: '4px',
                                fontSize: '0.9rem',
                                color: isConnected ? '#28a745' : '#666'
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: isConnected ? '#28a745' : '#666',
                                    marginRight: '4px'
                                }}></div>
                                {isConnected ? (
                                    'Online'
                                ) : (
                                    user.latest_connection && (
                                        `Last seen ${new Date(user.latest_connection).toLocaleString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}`
                                    )
                                )}
                            </div>
                        <h2 className="profile-header">About</h2>
                        <p>{user.job}, {user.country}</p>
                        {<p>Actually in : {user.city}, {user.suburb}</p>}
                        <p>{user.bio}</p>
                        <h2 className="profile-header">Interests</h2>
                        <div className='interest-array'>
                            {user.interests && user.interests.length > 0 ? (
                                user.interests.map((interestId) => {
                                    const interest = availableInterests.find(i => i.id === interestId);
                                    return (
                                        <p key={interestId} className='interest'>
                                            {interest ? interest.name : interestId}
                                        </p>
                                    );
                                })
                            ) : (
                                <p>No interest available</p>
                            )}
                        </div>
                        
                        <h2 className="profile-header">Fame Rate</h2>
                        <div className="fame-rate-container">
                            <div className="fame-rate-value">
                                <span className="fame-rate-number">{fameRate.fame_rate}%</span>
                            </div>
                            <div className="fame-rate-details">
                                <div className="fame-rate-stat">
                                    <i className="fas fa-heart" style={{ color: '#1be4a1' }}></i> {fameRate.likes} likes
                                </div>
                                <div className="fame-rate-stat">
                                    <i className="fas fa-times" style={{ color: '#fd5068' }}></i> {fameRate.dislikes} dislikes
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <BottomNavBar />
        </div>
    );
};

export default Profile; 