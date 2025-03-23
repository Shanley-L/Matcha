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
            // Mettre à jour le contexte utilisateur
            const updatedUserData = { ...userData, matchType: selectedMatch };
            setUserData(updatedUserData);

            // Créer un FormData et ajouter le match sélectionné
            const formData = new FormData();
            
            // Mapping des noms de champs entre le frontend et le backend
            const fieldMapping = {
                firstname: 'firstname',
                matchType: 'matchType',
                birthdate: 'birthdate',
                country: 'country',
                gender: 'gender',
                looking_for: 'looking_for',
                interests: 'interests',
                job: 'job',
                bio: 'bio',
                is_first_login: 'is_first_login'
            };

            // Ajouter les données utilisateur au FormData avec le bon mapping
            Object.keys(updatedUserData).forEach(key => {
                const backendKey = fieldMapping[key] || key;
                const value = updatedUserData[key];

                if (value !== null && value !== undefined && value !== '' && key !== 'photos') {
                    if (Array.isArray(value) || typeof value === 'object') {
                        formData.append(backendKey, JSON.stringify(value));
                    } else {
                        formData.append(backendKey, value.toString());
                    }
                }
            });
            try {
                const response = await axios.put('/api/user/update', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                navigate('/home');
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
