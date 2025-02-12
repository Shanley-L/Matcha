// UploadPhotos.js
import React, { useState } from 'react';
import { useUser } from '../context/UserContext'; // Importer le hook pour accéder au contexte
import { useNavigate } from 'react-router-dom';
import { IoChevronBack, IoAdd } from 'react-icons/io5';
import axios from '../config/axios';
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
            file: file,
            preview: URL.createObjectURL(file)
        }));
        
        setPhotos([...photos, ...newPhotos]);
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();

            // Ajouter chaque photo au formData
            photos.forEach(photo => {
                formData.append('photos', photo.file);
            });

            // Ajouter les autres données du contexte utilisateur
            Object.keys(userData).forEach(key => {
                if (userData[key] !== null && userData[key] !== undefined && key !== 'photos') {
                    if (Array.isArray(userData[key]) || typeof userData[key] === 'object') {
                        formData.append(key, JSON.stringify(userData[key]));
                    } else {
                        formData.append(key, userData[key].toString());
                    }
                }
            });

            // Log des données envoyées
            console.log('FormData content:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // Envoyer les données au backend
            const response = await axios.put('/api/user/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                // Mettre à jour le contexte avec les chemins des photos retournés par le backend
                setUserData({ ...userData, photos: response.data.photos });
                navigate('/select-interests');
            }
        } catch (error) {
            console.error('Error uploading photos:', error.response?.data || error);
            alert('Failed to upload photos. Please try again.');
        }
    };

    const removePhoto = (index) => {
        const newPhotos = [...photos];
        // Libérer l'URL de prévisualisation
        URL.revokeObjectURL(newPhotos[index].preview);
        newPhotos.splice(index, 1);
        setPhotos(newPhotos);
    };

    const renderPhotoSlots = () => {
        const slots = [];
        for (let i = 0; i < MAX_PHOTOS; i++) {
            if (photos[i]) {
                slots.push(
                    <div key={i} className="photo-slot filled">
                        <img src={photos[i].preview} alt={`Upload ${i + 1}`} />
                        <button 
                            className="remove-photo" 
                            onClick={() => removePhoto(i)}
                            type="button"
                        >
                            ×
                        </button>
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
