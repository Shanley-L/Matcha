import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';
import PageHeader from '../components/PageHeader';
import axios from '../config/axios';
import '../styles/pages/shared.css';
import '../styles/pages/EditProfile.css';

const EditProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    
    // Edit states
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [isEditingInterests, setIsEditingInterests] = useState(false);
    
    // Form states
    const [formData, setFormData] = useState({
        firstname: '',
        day: '',
        month: '',
        year: '',
        job: '',
        country: '',
        bio: '',
        city: '',
        suburb: '',
        address: '',
        latitude: '',
        longitude: ''
    });

    // Available interests for selection
    const availableInterests = useMemo(() => [
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
    ], []);

    // Arrays for date selection
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = useMemo(() => [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ], []);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const formStyles = {
        input: {
            flex: 1,
            padding: '0.8rem',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '1rem',
            backgroundColor: '#f8f8f8',
            color: '#333',
            outline: 'none'
        },
        button: {
            padding: '0.8rem 1.5rem',
            backgroundColor: '#8A2BE2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
        },
        closeIcon: {
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: '#ff0000',
            marginLeft: '1rem'
        },
        formHeader: {
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '1rem'
        },
        interestTag: {
            padding: '0.8rem 1.2rem',
            border: '1px solid #8A2BE2',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease'
        },
        interestTagSelected: {
            backgroundColor: '#8A2BE2',
            color: 'white',
            border: '1px solid #8A2BE2'
        },
        interestTagUnselected: {
            backgroundColor: 'white',
            color: '#8A2BE2',
            border: '1px solid #8A2BE2'
        }
    };

    const [selectedInterests, setSelectedInterests] = useState([]);

    const handleBackClick = () => {
        navigate('/profile');
    };

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
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    useEffect(() => {
        if (user) {
            const birthDate = user.birthdate ? new Date(user.birthdate) : null;
            setFormData({
                firstname: user.firstname || '',
                day: birthDate ? birthDate.getDate().toString() : '',
                month: birthDate ? months[birthDate.getMonth()] : '',
                year: birthDate ? birthDate.getFullYear().toString() : '',
                job: user.job || '',
                country: user.country || '',
                bio: user.bio || '',
                city: user.city || '',
                suburb: user.suburb || '',
                address: user.address || '',
            });
        }
    }, [user, months]);

    useEffect(() => {
        if (user && user.interests) {
            // Ensure we're working with IDs, not names
            const interestIds = user.interests.map(interest => {
                // If the interest is already an ID, use it
                if (availableInterests.some(ai => ai.id === interest)) {
                    return interest;
                }
                // If it's a name, find the corresponding ID
                const found = availableInterests.find(ai => ai.name === interest);
                return found ? found.id : interest;
            });
            setSelectedInterests(interestIds);
        }
    }, [user, availableInterests]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInterestToggle = (interest) => {
        setSelectedInterests(prev => {
            if (prev.includes(interest.id)) {
                return prev.filter(i => i !== interest.id);
            } else {
                return [...prev, interest.id];
            }
        });
    };

    const handleSaveProfile = async () => {
        try {
            if (!formData.firstname || !formData.day || !formData.month || !formData.year) {
                alert('Please fill in all required fields');
                return;
            }

            const monthIndex = months.indexOf(formData.month);
            const birthdate = `${formData.year}-${(monthIndex + 1).toString().padStart(2, '0')}-${formData.day.toString().padStart(2, '0')}`;
            
            const formDataToSend = new FormData();
            formDataToSend.append('firstname', formData.firstname.trim());
            formDataToSend.append('birthdate', birthdate);

            const response = await axios.put('/api/user/update', formDataToSend);
            
            if (response.data) {
                setUser(prev => ({
                    ...prev,
                    firstname: formData.firstname,
                    birthdate: birthdate
                }));
                setIsEditingProfile(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.response?.data?.details || 'Error updating profile');
        }
    };

    const geocodeAddress = async (address) => {
        try {
            // Recherche initiale avec restriction France
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=fr&addressdetails=1`
            );
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
    
            const data = await response.json();
            
            if (!data || data.length === 0) {
                throw new Error("Aucun résultat trouvé pour cette adresse.");
            }
    
    
            // On prend le premier résultat (le plus pertinent)
            const firstResult = data[0];
            
            // Récupération des détails d'adresse
            let addressDetails = firstResult.address;
            
            // Logique intelligente pour déterminer city/suburb en fonction du type de résultat
            let city, suburb;
            
            // Cas 1: Grandes villes (Paris, Lyon, etc.)
            if (addressDetails.city) {
                city = addressDetails.city;
                suburb = addressDetails.suburb || addressDetails.neighbourhood || addressDetails.city_district || "Inconnu";
            } 
            // Cas 2: Villes moyennes (utilise 'town')
            else if (addressDetails.town) {
                city = addressDetails.town;
                suburb = addressDetails.suburb || addressDetails.village || addressDetails.municipality || "Inconnu";
            }
            // Cas 3: Petites communes/villages
            else if (addressDetails.village) {
                city = addressDetails.village;
                suburb = addressDetails.hamlet || addressDetails.locality || "Inconnu";
            }
            // Cas 4: Quartiers spécifiques (comme dans votre exemple Conflans-Sainte-Honorine)
            else if (addressDetails.municipality) {
                city = addressDetails.municipality;
                suburb = addressDetails.suburb || addressDetails.neighbourhood || addressDetails.town || "Inconnu";
            }
            // Cas par défaut
            else {
                city = "Inconnu";
                suburb = "Inconnu";
            }
    
            // Construction de l'objet de localisation
            const locationInfo = {
                address: firstResult.display_name,
                latitude: parseFloat(firstResult.lat),
                longitude: parseFloat(firstResult.lon),
                city: city,
                suburb: suburb,
                postcode: addressDetails.postcode || "Inconnu",
                country: addressDetails.country || "France",
                rawData: firstResult // On conserve les données brutes pour debug
            };
    
            return locationInfo;
        } catch (error) {
            console.error("Erreur lors du géocodage:", error);
            throw error;
        }
    };

    const handleSaveAbout = async () => {
        try {
            if (!formData.job && !formData.country && !formData.bio && !formData.address) {
                alert('Veuillez remplir au moins un champ');
                return;
            }
    
            // 1. Préparer FormData pour l'envoi
            const formDataToSend = new FormData();
            
            // 2. Ajouter tous les champs textuels
            if (formData.job) formDataToSend.append('job', formData.job);
            if (formData.country) formDataToSend.append('country', formData.country);
            if (formData.bio) formDataToSend.append('bio', formData.bio);

            let geoLocation = null;
            
            // 3. Si adresse fournie, géocoder et ajouter les champs GPS
            if (formData.address) {
                geoLocation = await geocodeAddress(formData.address); // Changé ici
                formDataToSend.append('city', geoLocation.city);
                formDataToSend.append('suburb', geoLocation.suburb);
                formDataToSend.append('latitude', geoLocation.latitude.toString());
                formDataToSend.append('longitude', geoLocation.longitude.toString());
            }
    
            // 4. Envoyer avec le bon Content-Type
            const response = await axios.put('/api/user/update', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data.message === "User profile updated successfully") {
                setUser(prev => ({
                    ...prev,
                    ...(formData.job && { job: formData.job }),
                    ...(formData.country && { country: formData.country }),
                    ...(formData.bio && { bio: formData.bio }),
                    ...(formData.address && {
                        city: geoLocation.city, // Changé ici
                        suburb: geoLocation.suburb, // Changé ici
                        latitude: geoLocation.latitude.toString(), // Changé ici
                        longitude: geoLocation.longitude.toString() // Changé ici
                    })
                }));
                setIsEditingAbout(false);
            } else {
                throw new Error(response.data.error || "Erreur inconnue");
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.response?.data?.details || 
                 (error.message.includes('Aucun résultat') ? 
                  "Adresse introuvable. Essayez une formulation différente." : 
                  "Erreur lors de la mise à jour"));
        }
    };

    const handleSaveInterests = async () => {
        try {
            if (selectedInterests.length === 0) {
                alert('Please select at least one interest');
                return;
            }

            const formDataToSend = new FormData();
            formDataToSend.append('interests', JSON.stringify(selectedInterests));

            const response = await axios.put('/api/user/update', formDataToSend);
            
            if (response.data) {
                setUser(prev => ({
                    ...prev,
                    interests: selectedInterests
                }));
                setIsEditingInterests(false);
            }
        } catch (error) {
            console.error('Error updating interests:', error);
            alert(error.response?.data?.details || 'Error updating interests');
        }
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

    const handleEditPhotosClick = () => {
        navigate('/edit-photo');
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
                    <h1 style={{ paddingTop: '0.5rem', margin: 0, fontSize: '1.5rem' }}>Edit Profile</h1>
                </div>
                <div className='photo-gallery-container'>
                    {user.photos && user.photos.length > 0 ? (
                        <>
                            <div className='photo-gallery'>
                                <img 
                                    src={`./shared/uploads` + user.photos[currentPhotoIndex]} 
                                    alt="user pics" 
                                    className='profile-photos clickable'
                                    onClick={handleEditPhotosClick}
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
                        <div className="profile-header" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            width: '100%'
                        }}>
                            {isEditingProfile ? (
                                <div style={{ width: '100%' }}>
                                    <div style={formStyles.formHeader}>
                                        <i 
                                            className="fas fa-times" 
                                            style={formStyles.closeIcon}
                                            onClick={() => setIsEditingProfile(false)}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                        <input
                                            type="text"
                                            name="firstname"
                                            value={formData.firstname}
                                            onChange={handleInputChange}
                                            placeholder="First name"
                                            style={formStyles.input}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                        <select
                                            name="day"
                                            value={formData.day}
                                            onChange={handleInputChange}
                                            style={formStyles.input}
                                        >
                                            <option value="">Day</option>
                                            {days.map(day => (
                                                <option key={day} value={day}>{day}</option>
                                            ))}
                                        </select>
                                        <select
                                            name="month"
                                            value={formData.month}
                                            onChange={handleInputChange}
                                            style={formStyles.input}
                                        >
                                            <option value="">Month</option>
                                            {months.map(month => (
                                                <option key={month} value={month}>{month}</option>
                                            ))}
                                        </select>
                                        <select
                                            name="year"
                                            value={formData.year}
                                            onChange={handleInputChange}
                                            style={formStyles.input}
                                        >
                                            <option value="">Year</option>
                                            {years.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button onClick={handleSaveProfile} style={formStyles.button}>Save</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1>
                                        {user.firstname}
                                        <span>, {calculateAge(user.birthdate)} ans</span>
                                    </h1>
                                    <i 
                                        className="fa-solid fa-pen-to-square" 
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setIsEditingProfile(true)}
                                    ></i>
                                </>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            marginBottom: '1rem'
                        }}>
                            <h2 className="profile-header" style={{ margin: 0 }}>About</h2>
                            {!isEditingAbout && (
                                <i 
                                    className="fa-solid fa-pen-to-square" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setIsEditingAbout(true)}
                                ></i>
                            )}
                        </div>

                        {isEditingAbout ? (
                            <div style={{ width: '100%' }}>
                                <div style={formStyles.formHeader}>
                                    <i 
                                        className="fas fa-times" 
                                        style={formStyles.closeIcon}
                                        onClick={() => setIsEditingAbout(false)}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        name="job"
                                        value={formData.job}
                                        onChange={handleInputChange}
                                        placeholder="Job"
                                        style={formStyles.input}
                                    />
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        placeholder="Country"
                                        style={formStyles.input}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Address"
                                        style={formStyles.input}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                    <input
                                        type="text"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        placeholder="Bio"
                                        style={formStyles.input}
                                    />
                                </div>
                                <button onClick={handleSaveAbout} style={formStyles.button}>Save</button>
                            </div>
                        ) : (
                            <>
                                <p>{user.job}, {user.country}</p>
                                {user.city && <p>position: {user.city}, {user.suburb}</p>}
                                <p>{user.bio}</p>
                            </>
                        )}

                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            width: '100%',
                            marginBottom: '1rem',
                            marginTop: '1rem'
                        }}>
                            <h2 className="profile-header" style={{ margin: 0 }}>Interests</h2>
                            {!isEditingInterests && (
                                <i 
                                    className="fa-solid fa-pen-to-square" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setIsEditingInterests(true)}
                                ></i>
                            )}
                        </div>

                        {isEditingInterests ? (
                            <div style={{ width: '100%' }}>
                                <div style={formStyles.formHeader}>
                                    <i 
                                        className="fas fa-times" 
                                        style={formStyles.closeIcon}
                                        onClick={() => setIsEditingInterests(false)}
                                    />
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: '0.8rem', 
                                    marginBottom: '1rem' 
                                }}>
                                    {availableInterests.map(interest => (
                                        <div
                                            key={interest.id}
                                            onClick={() => handleInterestToggle(interest)}
                                            style={{
                                                ...formStyles.interestTag,
                                                ...(selectedInterests.includes(interest.id) 
                                                    ? formStyles.interestTagSelected 
                                                    : formStyles.interestTagUnselected)
                                            }}
                                        >
                                            {interest.name}
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleSaveInterests} style={formStyles.button}>Save</button>
                            </div>
                        ) : (
                            <div className='interest-array'>
                                {selectedInterests && selectedInterests.length > 0 ? (
                                    selectedInterests.map((interestId) => {
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
                        )}
                    </div>
                )}
            </div>
            <BottomNavBar />
        </div>
    );
};

export default EditProfile; 