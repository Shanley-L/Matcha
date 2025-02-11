import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/interests.css';

const interestsList = [
    "Gaming", "Dancing & Singing", "Language", "Movie",
    "Book & Novel", "Architecture", "Photography", "Fashion",
    "Writing", "Nature & Plant", "Painting", "Football",
    "Animals", "People & Society", "Gym & Fitness", "Food & Drink",
    "Travel & Places", "Art"
];

const SelectInterests = () => {
    const [selectedInterests, setSelectedInterests] = useState([]);
    const navigate = useNavigate();

    const toggleInterest = (interest) => {
        setSelectedInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    };

    const handleNext = () => {
        if (selectedInterests.length > 0) {
            // Sauvegarder les intérêts (API ou localStorage)
            navigate('/select-match');
        }
    };

    return (
        <div className="container">
            <h2>Select Your Interest</h2>
            <p>Select your interests to match with people who share similar hobbies.</p>
            <div className="interests-grid">
                {interestsList.map((interest, index) => (
                    <button
                        key={index}
                        className={`interest-btn ${selectedInterests.includes(interest) ? 'selected' : ''}`}
                        onClick={() => toggleInterest(interest)}
                    >
                        {interest}
                    </button>
                ))}
            </div>
            <button className="continue-btn" onClick={handleNext} disabled={selectedInterests.length === 0}>
                Continue
            </button>
        </div>
    );
};

export default SelectInterests;
