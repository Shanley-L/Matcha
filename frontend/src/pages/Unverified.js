import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import '../styles/components/logo.css';
import '../styles/components/button.css';

const Unverified = () => {
    const navigate = useNavigate();

    return (
        <div id="auth-container">
            <div id='logo'>
                <div id='div1'><i className="fa-solid fa-heart"></i></div>
                <div id='div2'></div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h2>Email Verification Required</h2>
                <p style={{ margin: '2rem 0' }}>Please validate your email by clicking the link sent to your email.</p>
                <button 
                    id='authButton' 
                    onClick={() => navigate('/login')}
                    style={{ width: '200px' }}
                >
                    Go to Login
                </button>
            </div>
        </div>
    );
};

export default Unverified; 