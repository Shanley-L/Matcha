import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UploadPhotos = () => {
    const [photos, setPhotos] = useState([]);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        if (e.target.files.length + photos.length > 4) {
            alert("Vous ne pouvez sélectionner que 4 photos !");
            return;
        }
        setPhotos([...photos, ...Array.from(e.target.files)]);
    };

    const handleSubmit = () => {
        // Envoyer les photos au backend
        navigate('/profile'); // Redirection finale
    };

    return (
        <div>
            <h2>Sélectionnez 4 photos</h2>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} />
            <div>
                {photos.map((photo, index) => (
                    <img key={index} src={URL.createObjectURL(photo)} alt={`preview-${index}`} width="100" />
                ))}
            </div>
            <button onClick={handleSubmit}>Terminer</button>
        </div>
    );
};

export default UploadPhotos;
