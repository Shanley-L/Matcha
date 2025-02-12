import React from 'react';
import { IoSettingsSharp } from 'react-icons/io5';
import '../styles/components/PageHeader.css';

const PageHeader = ({ showSettings, onSettingsClick }) => {
    return (
        <header className="page-header">
            <div className="logo-container">
                <div className="logo">
                    <div className="logo-heart"><i className="fa-solid fa-heart"></i></div>
                    <div className="logo-dot"></div>
                </div>
            </div>
            {showSettings && (
                <button className="settings-button" onClick={onSettingsClick}>
                    <IoSettingsSharp />
                </button>
            )}
        </header>
    );
};

export default PageHeader; 