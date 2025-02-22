// CompleteProfile.js
import React, { useState } from 'react';
import { useUser } from '../context/UserContext'; // Importer le hook pour accéder au contexte
import { useNavigate } from 'react-router-dom';
import { IoChevronBack, IoChevronDown } from 'react-icons/io5';
import './CompleteProfile.css';

const CompleteProfile = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        gender: '',
        looking_for: '',
        job: '',
        bio: '',
        birthdate: ''
    });
    const [birthdateError, setBirthdateError] = useState('');
    const { userData, setUserData } = useUser(); // Utiliser le contexte pour accéder et modifier les données
    const navigate = useNavigate();

    const validateBirthdate = (value) => {
        // Vérifier le format dd/mm/yyyy
        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (!dateRegex.test(value)) {
            return "Format invalide. Utilisez dd/mm/yyyy";
        }

        // Convertir la date
        const [day, month, year] = value.split('/');
        const birthdate = new Date(year, month - 1, day);
        const today = new Date();

        // Vérifier si la date est valide
        if (birthdate.getDate() != parseInt(day) || 
            birthdate.getMonth() != parseInt(month) - 1 || 
            birthdate.getFullYear() != parseInt(year)) {
            return "Date invalide";
        }

        // Calculer l'âge
        let age = today.getFullYear() - birthdate.getFullYear();
        const monthDiff = today.getMonth() - birthdate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
            age--;
        }

        // Vérifier l'âge
        if (age < 18) {
            return "Vous devez avoir au moins 18 ans";
        }
        if (age > 120) {
            return "L'âge maximum est de 120 ans";
        }

        return "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'birthdate') {
            const error = validateBirthdate(value);
            setBirthdateError(error);
            // Mettre à jour la valeur même s'il y a une erreur pour permettre la correction
            setFormData(prev => ({ ...prev, [name]: value }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNext = () => {
        if (!birthdateError) {
            // Convertir la date au format ISO pour le backend
            const [day, month, year] = formData.birthdate.split('/');
            const isoDate = `${year}-${month}-${day}`;
            const dataToSend = {
                ...formData,
                birthdate: isoDate
            };
            setUserData({ ...userData, ...dataToSend });
            navigate('/upload-photos');
        }
    };

    const isFormValid = () => {
        return Object.values(formData).every(value => value.trim() !== '') && !birthdateError;
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
                        name="firstname"
                        placeholder="First Name"
                        className="form-input"
                        value={formData.firstname}
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
                        name="looking_for"
                        className="form-input gender-select"
                        value={formData.looking_for}
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
                        name="birthdate"
                        placeholder="Birthdate (dd/mm/yyyy)"
                        className={`form-input ${birthdateError ? 'error' : ''}`}
                        value={formData.birthdate}
                        onChange={handleChange}
                    />
                    {birthdateError && <div className="error-message">{birthdateError}</div>}
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
