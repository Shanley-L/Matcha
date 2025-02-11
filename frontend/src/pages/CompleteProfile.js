// CompleteProfile.js
import React, { useState } from 'react';
import { useUser } from '../context/UserContext'; // Importer le hook pour accéder au contexte
import { useNavigate } from 'react-router-dom';
import { IoChevronBack, IoChevronDown } from 'react-icons/io5';
import './CompleteProfile.css';

const CompleteProfile = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        gender: '',
        sexual_orientation: '',
        job: '',
        bio: ''
    });
    const { userData, setUserData } = useUser(); // Utiliser le contexte pour accéder et modifier les données
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        setUserData({ ...userData, ...formData }); // Ajouter les nouvelles informations au contexte
        navigate('/upload-photos');
    };

    const isFormValid = () => {
        return Object.values(formData).every(value => value.trim() !== '');
    };

    return (
        <div className="profile-container">
            <header className="profile-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <IoChevronBack />
                </button>
                <h2>Fill Your Profile</h2>
            </header>

            <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                    <input
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        className="form-input"
                        value={formData.first_name}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <select
                        name="gender"
                        className="form-input gender-select"
                        value={formData.gender}
                        onChange={handleChange}
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    <IoChevronDown className="input-icon" />
                </div>

                <div className="form-group">
                    <select
                        name="sexual_orientation"
                        className="form-input gender-select"
                        value={formData.sexual_orientation}
                        onChange={handleChange}
                    >
                        <option value="">Sexual Orientation</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    <IoChevronDown className="input-icon" />
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        name="job"
                        placeholder="Job"
                        className="form-input"
                        value={formData.job}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <textarea
                        name="bio"
                        placeholder="Bio..."
                        className="form-input bio-input"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="4"
                    />
                </div>

                <button
                    className="continue-button"
                    onClick={handleNext}
                    disabled={!isFormValid()}
                >
                    Continue
                </button>
            </form>
        </div>
    );
};

export default CompleteProfile;
