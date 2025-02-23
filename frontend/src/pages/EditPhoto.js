// UploadPhotos.js
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext'; // Importer le hook pour accéder au contexte
import { useNavigate } from 'react-router-dom';
import { IoChevronBack, IoAdd } from 'react-icons/io5';
import axios from '../config/axios';
import './UploadPhotos.css';

const MAX_PHOTOS = 6;

const EditPhoto = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userData, setUserData } = useUser(); // Utiliser le contexte pour accéder et modifier les données
    const navigate = useNavigate();

    useEffect(() => {
        const loadUserPhotos = async () => {
            try {
                const response = await axios.get('/api/user/profile');
                if (response.data.photos) {
                    // Convertir les chemins de photos en objets de preview
                    const existingPhotos = response.data.photos.map(photoPath => ({
                        file: null, // Pas de fichier pour les photos existantes
                        preview: `./shared/uploads${photoPath}`,
                        isExisting: true, // Marquer comme photo existante
                        path: photoPath // Garder le chemin original
                    }));
                    setPhotos(existingPhotos);
                }
            } catch (error) {
                console.error('Error loading user photos:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUserPhotos();
    }, []);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (photos.length + files.length > MAX_PHOTOS) {
            alert(`You can only upload up to ${MAX_PHOTOS} photos`);
            return;
        }
        
        const newPhotos = files.map(file => ({
            file: file,
            preview: URL.createObjectURL(file),
            isExisting: false
        }));
        
        setPhotos(prev => [...prev, ...newPhotos]);
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();

            // Ajouter les nouvelles photos au formData
            photos.forEach(photo => {
                if (!photo.isExisting && photo.file) {
                    formData.append('photos', photo.file);
                }
            });

            // Ajouter les chemins des photos existantes
            const existingPhotoPaths = photos
                .filter(photo => photo.isExisting)
                .map(photo => photo.path);
            formData.append('photos_order', JSON.stringify(existingPhotoPaths));

            const response = await axios.put('/api/user/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                navigate('/edit-profile');
            }
        } catch (error) {
            console.error('Error updating photos:', error.response?.data || error);
            alert('Failed to update photos. Please try again.');
        }
    };

    const removePhoto = (index) => {
        setPhotos(prev => {
            const newPhotos = [...prev];
            const photo = newPhotos[index];
            
            // Si c'est une nouvelle photo, révoquer l'URL
            if (!photo.isExisting) {
                URL.revokeObjectURL(photo.preview);
            }
            
            newPhotos.splice(index, 1);
            return newPhotos;
        });
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

    if (loading) {
        return (
            <div className="photos-container">
                <header className="photos-header">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <IoChevronBack />
                    </button>
                    <h2>Loading...</h2>
                </header>
            </div>
        );
    }

    return (
        <div className="photos-container">
            <header className="photos-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <IoChevronBack />
                </button>
                <h2>Edit Your Photos</h2>
            </header>

            <p className="photos-description">
                Add or remove photos to get a higher amount of daily matches.
            </p>

            <div className="photos-grid">
                {renderPhotoSlots()}
            </div>

            <button
                className="continue-button"
                onClick={handleSubmit}
                disabled={photos.length === 0}
            >
                Save Changes
            </button>
        </div>
    );
};

export default EditPhoto;
