import React from 'react';
import '../styles/components/ConfirmationPopup.css';

const ConfirmationPopup = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <div className="popup-header">
                    <h2>{title}</h2>
                    <button className="close-button" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="popup-content">
                    <p>{message}</p>
                </div>
                <div className="popup-actions">
                    {cancelText && (
                        <button 
                            className="popup-button cancel" 
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {cancelText}
                        </button>
                    )}
                    {confirmText && (
                        <button 
                            className={`popup-button confirm ${!cancelText ? 'full-width' : ''}`}
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPopup; 