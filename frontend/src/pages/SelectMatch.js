// SelectMatch.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // Importer le hook pour accéder au contexte
import { IoChevronBack, IoHeart, IoPeople, IoBag, IoBriefcase } from 'react-icons/io5';
import './SelectMatch.css';
import axios from '../config/axios';

const matchOptions = [
    { id: 'love', label: 'Love', icon: <IoHeart /> },
    { id: 'friends', label: 'Friends', icon: <IoPeople /> },
    { id: 'fling', label: 'Fling', icon: <IoBag /> },
    { id: 'business', label: 'Business', icon: <IoBriefcase /> }
];

const SelectMatch = () => {
    const [selectedMatch, setSelectedMatch] = useState('');
    const { userData, setUserData } = useUser(); // Utiliser le contexte pour accéder aux données utilisateur
    const navigate = useNavigate();

    const handleNext = async () => {
        if (selectedMatch) {
            // Ajouter le match sélectionné aux données utilisateur
            const updatedData = { ...userData, matchType: selectedMatch };
            setUserData(updatedData); // Mettre à jour l'état global avec le nouveau match

            // Sauvegarder dans le backend
            try {
                const response = await axios.put('/api/user/update', updatedData);
                console.log('Données envoyées:', response.data);

                navigate('/home'); // Redirection après succès
            } catch (error) {
                console.error('Erreur lors de l\'envoi des données:', error);
            }
        }
    };

    return (
        <div className="match-container">
            <header className="match-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <IoChevronBack />
                </button>
                <h2>Select Your Ideal Match</h2>
            </header>

            <p className="match-description">
                What are you hoping to find on Matcha ?
            </p>

            <div className="match-grid">
                {matchOptions.map((option) => (
                    <button
                        key={option.id}
                        className={`match-card ${selectedMatch === option.id ? 'selected' : ''}`}
                        onClick={() => setSelectedMatch(option.id)}
                    >
                        <div className="match-icon-container">
                            {option.icon}
                        </div>
                        <span className="match-label">{option.label}</span>
                    </button>
                ))}
            </div>

            <button
                className="continue-button"
                onClick={handleNext}
                disabled={!selectedMatch}
            >
                Continue
            </button>
        </div>
    );
};

export default SelectMatch;
