import React, { useState } from 'react';
import { useUser } from '../context/UserContext'; // Importer le hook pour accéder au contexte
import { useNavigate } from 'react-router-dom';
import { IoChevronBack, IoGameController, IoMusicalNotes, IoLanguage, IoFilm, IoBook, IoHome, IoCamera, IoShirt, IoPencil, IoLeaf, IoBrush, IoFootball, IoPaw, IoPeople, IoBarbell, IoFastFood, IoAirplane, IoBrush as IoArt } from 'react-icons/io5';
import './SelectInterests.css';

const interests = [
    { id: 'gaming', name: 'Gaming', icon: <IoGameController /> },
    { id: 'dancing_singing', name: 'Dancing & Singing', icon: <IoMusicalNotes /> },
    { id: 'language', name: 'Language', icon: <IoLanguage /> },
    { id: 'movie', name: 'Movie', icon: <IoFilm /> },
    { id: 'book_novel', name: 'Book & Novel', icon: <IoBook /> },
    { id: 'architecture', name: 'Architecture', icon: <IoHome /> },
    { id: 'photography', name: 'Photography', icon: <IoCamera /> },
    { id: 'fashion', name: 'Fashion', icon: <IoShirt /> },
    { id: 'writing', name: 'Writing', icon: <IoPencil /> },
    { id: 'nature_plant', name: 'Nature & Plant', icon: <IoLeaf /> },
    { id: 'painting', name: 'Painting', icon: <IoBrush /> },
    { id: 'football', name: 'Football', icon: <IoFootball /> },
    { id: 'animals', name: 'Animals', icon: <IoPaw /> },
    { id: 'people_society', name: 'People & Society', icon: <IoPeople /> },
    { id: 'gym_fitness', name: 'Gym & Fitness', icon: <IoBarbell /> },
    { id: 'food_drink', name: 'Food & Drink', icon: <IoFastFood /> },
    { id: 'travel_places', name: 'Travel & Places', icon: <IoAirplane /> },
    { id: 'art', name: 'Art', icon: <IoArt /> }
];

const SelectInterests = () => {
    const [selectedInterests, setSelectedInterests] = useState([]);
    const { userData, setUserData } = useUser(); // Utiliser le contexte pour accéder et modifier les données
    const navigate = useNavigate();

    const toggleInterest = (interestId) => {
        setSelectedInterests(prev =>
            prev.includes(interestId)
                ? prev.filter(id => id !== interestId)
                : [...prev, interestId]
        );
    };

    const handleNext = () => {
        // Convertir la liste d'intérêts en chaîne JSON avant de la sauvegarder
        const updatedData = { 
            ...userData, 
            interests: JSON.stringify(selectedInterests) // Convertir la liste en chaîne JSON
        };
        setUserData(updatedData); // Ajouter les intérêts au contexte

        navigate('/select-match'); // Aller à la page suivante
    };

    return (
        <div className="interests-container">
            <header className="interests-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <IoChevronBack />
                </button>
                <h2>Select Your Interest</h2>
            </header>

            <p className="interests-description">
                Select your interests to match with soul mate who have similar things in common.
            </p>

            <div className="interests-content">
                <div className="interests-grid">
                    {interests.map((interest) => (
                        <button
                            key={interest.id}
                            className={`interest-btn ${selectedInterests.includes(interest.id) ? 'selected' : ''}`}
                            onClick={() => toggleInterest(interest.id)}
                        >
                            <span className="interest-icon">{interest.icon}</span>
                            {interest.name}
                        </button>
                    ))}
                </div>
            </div>

            <button
                className="continue-button"
                onClick={handleNext}
                disabled={selectedInterests.length === 0}
            >
                Continue
            </button>
        </div>
    );
};

export default SelectInterests;
