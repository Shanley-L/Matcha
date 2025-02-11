import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const countries = ["France", "Canada", "USA", "Allemagne", "Royaume-Uni"]; // Liste des pays

const SelectCountry = () => {
    const [selectedCountry, setSelectedCountry] = useState('');
    const navigate = useNavigate();

    const handleNext = () => {
        if (selectedCountry) {
            // Sauvegarder dans le backend ou localStorage
            navigate('/complete-profile'); // Redirige vers la prochaine étape
        }
    };

    return (
        <div>
            <h2>Choisissez votre pays</h2>
            <select onChange={(e) => setSelectedCountry(e.target.value)} value={selectedCountry}>
                <option value="">Sélectionnez un pays</option>
                {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                ))}
            </select>
            <button onClick={handleNext}>Suivant</button>
        </div>
    );
};

export default SelectCountry;
