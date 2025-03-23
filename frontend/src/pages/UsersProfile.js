import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';
import PageHeader from '../components/PageHeader';
import ConfirmationPopup from '../components/ConfirmationPopup';
import axios from '../config/axios';
import '../styles/pages/shared.css';
import '../styles/pages/Profile.css';

const UsersProfile = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [hasLikedMe, setHasLikedMe] = useState(false);
    const [isMatched, setIsMatched] = useState(false);
    const [deletingMatch, setDeletingMatch] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const optionsRef = useRef(null);
    const { userId } = useParams();
    const navigate = useNavigate();
    const [isBlocked, setIsBlocked] = useState(false);
    const [isReported, setIsReported] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [fameRate, setFameRate] = useState({ likes: 0, dislikes: 0, fame_rate: 0 });

    // Available interests for selection (same as Profile.js)
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
        const loadUserProfile = async () => {
            try {
                const response = await axios.get(`/api/user/${userId}/profile`);
                setUser(response.data);
                
                // Check if this user has liked the current user
                const likedResponse = await axios.get(`/api/user/check-liked-me/${userId}`);
                setHasLikedMe(likedResponse.data.has_liked);
                
                // Check if there's a match with this user
                const matchesResponse = await axios.get('/api/user/getmatches');
                const isUserMatched = matchesResponse.data.some(match => match.id === parseInt(userId));
                setIsMatched(isUserMatched);
                setIsConnected(response.data.is_connected);
                
                // Get fame rate
                const fameResponse = await axios.get(`/api/user/fame-rate/${userId}`);
                setFameRate(fameResponse.data);
                // Check if the user is blocked or reported
                try {
                    const statusResponse = await axios.get(`/api/user/${userId}/status`);
                    setIsBlocked(statusResponse.data.isBlocked);
                    setIsReported(statusResponse.data.isReported);
                } catch (statusError) {
                    console.warn('Could not fetch user status, using defaults:', statusError);
                    // Default to not blocked/reported if endpoint fails
                    setIsBlocked(false);
                    setIsReported(false);
                }
            } catch (error) {
                console.error('Error loading user profile:', error);
                navigate('/viewers');
            } finally {
                setLoading(false);
            }
        };
        loadUserProfile();
    }, [userId, navigate]);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptionsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleToggleBlock = async () => {
        try {
            // Since we're toggling, flip the current state if we have to handle failures
            const newBlockedState = !isBlocked;
            
            const response = await axios.post('/api/user/block', { target_id: userId });
            
            if (response.data.message === 'blocked') {
                setIsBlocked(true);
            } else if (response.data.message === 'unblocked') {
                setIsBlocked(false);
            } else {
                // If the response doesn't have the expected format,
                // still update the UI based on the toggle action
                setIsBlocked(newBlockedState);
            }
        } catch (error) {
            console.error('Error toggling block status:', error);
            // In case of error, don't change the UI state
            // Optionally, you could show an error message to the user here
        }
        setShowOptionsMenu(false);
    };

    const handleToggleReport = async () => {
        try {
            const response = await axios.post('/api/user/report', { target_id: userId });
    
            if (response.data.message === 'reported') {
                setIsReported(true);
            } else if (response.data.message === 'unreported') {
                setIsReported(false);
            }
        } catch (error) {
            console.error('Error toggling report status:', error);
        }
        setShowOptionsMenu(false);
    };    
    

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

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleDeleteMatchClick = () => {
        setShowDeleteConfirmation(true);
    };

    const handleDeleteMatchConfirm = async () => {
        try {
            setDeletingMatch(true);
            await axios.post(`/api/user/delete-match/${userId}`);
            setDeleteSuccess(true);
            setTimeout(() => {
                navigate('/matches');
            }, 1500);
        } catch (error) {
            console.error('Error deleting match:', error);
            setShowDeleteConfirmation(false);
            // Show error message
            alert('Failed to delete match. Please try again.');
        } finally {
            setDeletingMatch(false);
        }
    };

    const handleCloseConfirmation = () => {
        setShowDeleteConfirmation(false);
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
                <div className="edit-profile-header" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    padding: '1rem 2rem',
                    marginBottom: '1rem',
                    width: '100%',
                    justifyContent: 'flex-start'
                }}>
                    <i 
                        className="fas fa-arrow-left" 
                        onClick={handleBackClick}
                        style={{ 
                            cursor: 'pointer',
                            fontSize: '1.5rem'
                        }}
                    ></i>
                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>User Profile</h1>
                </div>
                <div className='photo-gallery-container'>
                    {user.photos && user.photos.length > 0 ? (
                        <>
                            <div className='photo-gallery' style={{ position: 'relative' }}>
                                <img 
                                    src={`../shared/uploads` + user.photos[currentPhotoIndex]} 
                                    alt="user pics" 
                                    className='profile-photos'
                                />
                                {hasLikedMe && (
                                    <div 
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            color: 'red',
                                            fontSize: '2rem',
                                            textShadow: '0 0 5px rgba(0,0,0,0.5)',
                                            zIndex: 10
                                        }}
                                    >
                                        <i className="fas fa-heart"></i>
                                    </div>
                                )}
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
                        <div className="profile-header" style={{ position: 'relative' }}>
                            <h1>
                                {user.username}, {user.firstname}
                                <span>, {calculateAge(user.birthdate)} ans</span>
                                {isBlocked && (
                                    <span style={{ 
                                        fontSize: '0.7rem', 
                                        backgroundColor: '#dc3545', 
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '10px',
                                        marginLeft: '10px',
                                        verticalAlign: 'middle'
                                    }}>
                                        Blocked
                                    </span>
                                )}
                            </h1>
                            <div className="options-container" ref={optionsRef} style={{ position: 'absolute', right: '0', top: '0' }}>
                                <i 
                                    className="fas fa-ellipsis-v" 
                                    onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                                    style={{ 
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        padding: '8px',
                                        transition: 'opacity 0.2s',
                                        opacity: showOptionsMenu ? 0.7 : 1
                                    }}
                                ></i>
                                {showOptionsMenu && (
                                    <div className="options-menu" style={{
                                        position: 'absolute',
                                        right: '0',
                                        top: '100%',
                                        backgroundColor: 'white',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                        borderRadius: '4px',
                                        padding: '8px 0',
                                        zIndex: 1000,
                                        minWidth: '150px'
                                    }}>
                                        <div 
                                            onClick={handleToggleReport}
                                            style={{
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <i className="fas fa-flag" style={{ marginRight: '8px' }}></i>
                                            {isReported ? 'Unreport' : 'Report as fake'}
                                        </div>
                                        <div 
                                            onClick={handleToggleBlock}
                                            style={{
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                color: '#dc3545',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <i className="fas fa-ban" style={{ marginRight: '8px' }}></i>
                                            {isBlocked ? 'Unblock' : 'Block'}
                                        </div>
                                    </div>
                                )}
                            </div>
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
                        {user.bio && <p>{user.bio}</p>}

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
                        
                        {isMatched && (
                            <div className="match-actions">
                                <button 
                                    className="delete-match-btn"
                                    onClick={handleDeleteMatchClick}
                                    disabled={deletingMatch}
                                >
                                    Delete Match
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Confirmation Popup for Delete Match */}
            <ConfirmationPopup 
                isOpen={showDeleteConfirmation}
                onClose={handleCloseConfirmation}
                onConfirm={handleDeleteMatchConfirm}
                title="Delete Match"
                message="Are you sure you want to procede? This will remove the match and your conversation with this user."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={deletingMatch}
            />
            {/* Success Popup */}
            <ConfirmationPopup 
                isOpen={deleteSuccess}
                onClose={() => navigate('/matches')}
                onConfirm={() => navigate('/matches')}
                title="Success"
                message="Match deleted successfully!"
                confirmText=""
                cancelText=""
                isLoading={false}
            />
            <BottomNavBar />
        </div>
    );
};

export default UsersProfile; 