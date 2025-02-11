// SelectCountry.js
import React, { useState } from 'react';
import { useUser } from '../context/UserContext'; // Importer le hook pour accéder au contexte
import { useNavigate } from 'react-router-dom';
import { IoChevronBack, IoSearch } from 'react-icons/io5';
import './SelectCountry.css';

const countries = [
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AL', name: 'Albania' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'AD', name: 'Andorra' },
    { code: 'AO', name: 'Angola' },
    { code: 'AR', name: 'Argentina' },
    // Add more countries as needed
];

const SelectCountry = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const { userData, setUserData } = useUser(); // Utiliser le contexte pour accéder et modifier les données
    const navigate = useNavigate();

    const handleNext = () => {
        if (selectedCountry) {
            setUserData({ ...userData, country: selectedCountry }); // Mettre à jour les données utilisateur
            navigate('/complete-profile');
        }
    };

    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="country-selector">
            <header className="country-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <IoChevronBack />
                </button>
                <h2>Select Your Country</h2>
            </header>

            <div className="search-container">
                <IoSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="countries-list">
                {filteredCountries.map((country) => (
                    <button
                        key={country.code}
                        className={`country-item ${selectedCountry === country.name ? 'selected' : ''}`}
                        onClick={() => setSelectedCountry(country.name)}
                    >
                        <div className="country-info">
                            <img
                                src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                                alt={`${country.name} flag`}
                                className="country-flag"
                            />
                            <span className="country-code">{country.code}</span>
                            <span className="country-name">{country.name}</span>
                        </div>
                        <div className={`select-circle ${selectedCountry === country.name ? 'selected' : ''}`} />
                    </button>
                ))}
            </div>

            <button
                className="continue-button"
                onClick={handleNext}
                disabled={!selectedCountry}
            >
                Continue
            </button>
        </div>
    );
};

export default SelectCountry;
