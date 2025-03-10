// CompleteProfile.js
import React, { useState, useMemo } from 'react';
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
        day: '',
        month: '',
        year: ''
    });
    const { userData, setUserData } = useUser(); // Utiliser le contexte pour accéder et modifier les données
    const navigate = useNavigate();

    // Arrays for date selection
    const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);
    const months = useMemo(() => [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ], []);
    const currentYear = new Date().getFullYear();
    const years = useMemo(() => Array.from({ length: 100 }, (_, i) => currentYear - i), [currentYear]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateAge = (year, month, day) => {
        const birthDate = new Date(year, months.indexOf(month), day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    };

    const isDateValid = () => {
        if (!formData.day || !formData.month || !formData.year) return false;

        const age = calculateAge(formData.year, formData.month, formData.day);
        if (age >= 18 && age <= 120) {
            return true;
        } else {
            return false;
        }
    };

    const handleNext = () => {
        if (isDateValid()) {
            const monthIndex = months.indexOf(formData.month) + 1;
            const birthdate = `${formData.year}-${monthIndex.toString().padStart(2, '0')}-${formData.day.toString().padStart(2, '0')}`;
            
            const dataToSend = {
                ...formData,
                birthdate
            };
            setUserData({ ...userData, ...dataToSend });
            navigate('/upload-photos');
        }
    };

    const isFormValid = () => {
        return formData.firstname.trim() !== '' &&
            formData.gender.trim() !== '' &&
            formData.looking_for.trim() !== '' &&
            formData.job.trim() !== '' &&
            formData.bio.trim() !== '' &&
            isDateValid();
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

                <div className="form-group birthdate-group" style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        name="day"
                        className="form-input"
                        value={formData.day}
                        onChange={handleChange}
                        style={{ flex: 1 }}
                    >
                        <option value="">Day</option>
                        {days.map(day => (
                            <option key={day} value={day}>{day}</option>
                        ))}
                    </select>
                    <select
                        name="month"
                        className="form-input"
                        value={formData.month}
                        onChange={handleChange}
                        style={{ flex: 2 }}
                    >
                        <option value="">Month</option>
                        {months.map(month => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                    <select
                        name="year"
                        className="form-input"
                        value={formData.year}
                        onChange={handleChange}
                        style={{ flex: 1 }}
                    >
                        <option value="">Year</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
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
