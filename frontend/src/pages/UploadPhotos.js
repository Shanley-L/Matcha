// UploadPhotos.js
import React, { useState } from 'react';
import { useUser } from '../context/UserContext'; // Importer le hook pour accéder au contexte
import { useNavigate } from 'react-router-dom';
import { IoChevronBack, IoAdd } from 'react-icons/io5';
import './UploadPhotos.css';

const MAX_PHOTOS = 4;

const UploadPhotos = () => {
    const [photos, setPhotos] = useState([]);
    const { userData, setUserData } = useUser(); // Utiliser le contexte pour accéder et modifier les données
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (photos.length + files.length > MAX_PHOTOS) {
            alert(`You can only upload up to ${MAX_PHOTOS} photos`);
            return;
        }
        
        const newPhotos = files.map(file => ({
            url: URL.createObjectURL(file),
            file: file
        }));
        
        setPhotos([...photos, ...newPhotos]);
    };

    const handleSubmit = () => {
        setUserData({ ...userData, photos }); // Ajouter les photos au contexte
        navigate('/select-interests'); // Redirection vers la page des intérêts
    };

    const renderPhotoSlots = () => {
        const slots = [];
        for (let i = 0; i < MAX_PHOTOS; i++) {
            if (photos[i]) {
                slots.push(
                    <div key={i} className="photo-slot filled">
                        <img src={photos[i].url} alt={`Upload ${i + 1}`} />
                    </div>
                );
            } else {
                slots.push(
                    <label key={i} className="photo-slot empty">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <div className="add-photo-button">
                            <IoAdd />
                        </div>
                    </label>
                );
            }
        }
        return slots;
    };

    return (
        <div className="photos-container">
            <header className="photos-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <IoChevronBack />
                </button>
                <h2>Add Your Best Photos</h2>
            </header>

            <p className="photos-description">
                Add your best photos to get a higher amount of daily matches.
            </p>

            <div className="photos-grid">
                {renderPhotoSlots()}
            </div>

            <button
                className="continue-button"
                onClick={handleSubmit}
                disabled={photos.length === 0}
            >
                Continue
            </button>
        </div>
    );
};

export default UploadPhotos;
