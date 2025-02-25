import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../config/axios';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        // Skip auth check for public routes
        const publicRoutes = ['/', '/login', '/register', '/confirm', '/unverified'];
        const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));
        
        if (!isPublicRoute) {
            checkAuthStatus();
        } else {
            setLoading(false);
        }
    }, [location.pathname]);

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get('/api/user/profile/secure');
            setUser(response.data);
        } catch (error) {
            // Only log errors that aren't 401 or 404 (expected for non-logged in users)
            if (error.response?.status !== 401 && error.response?.status !== 404) {
                console.error('Auth check error:', error);
            }
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await axios.post('/api/auth/login', credentials);
            if (response.data.user) {
                setUser(response.data.user);
                return { success: true };
            }
            return { success: false, error: response.data.message };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
            setUser(null);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Logout failed' 
            };
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        setUser,
        checkAuthStatus // Export this so we can manually check auth status when needed
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 