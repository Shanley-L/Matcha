import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../config/axios';
import '../styles/auth.css';
import '../styles/components/logo.css';
import '../styles/components/button.css';

const EmailConfirmation = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    const [verificationMessage, setVerificationMessage] = useState('Your email is being verified...');
    const verificationAttempted = useRef(false);

    useEffect(() => {
        const verifyEmail = async () => {
            if (verificationAttempted.current) return;
            verificationAttempted.current = true;
            
            try {
                await axios.get(`/api/auth/confirm/${token}`);
                setTimeout(() => {
                  setVerificationMessage('Your email is now verified!');
                }, 2000);
                setTimeout(() => {
                    navigate('/login');
                }, 4000);
            } catch (error) {
                console.error('Error verifying email:', error);
                setTimeout(() => {
                  setVerificationMessage('Error verifying email. Redirecting to login...');
                }, 2000);
                setTimeout(() => {
                    navigate('/login');
                }, 4000);
            }
        };

        verifyEmail();
    }, [token, navigate]);

    return (
        <div id="auth-container">
            <div id='logo'>
                <div id='div1'><i className="fa-solid fa-heart"></i></div>
                <div id='div2'></div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h2>Email Verification</h2>
                <p style={{ margin: '2rem 0' }}>{verificationMessage}</p>
            </div>
        </div>
    );
};

export default EmailConfirmation; 