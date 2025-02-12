import { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import axios from '../config/axios';

// Move publicRoutes outside the component to avoid re-renders
const PUBLIC_ROUTES = ['/login', '/register', '/unverified', '/confirm'];

const ProtectedRoute = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('/api/user/profile/secure');
                setIsAuthenticated(true);
                setIsEmailVerified(response.data.is_email_verified);
            } catch (error) {
                setIsAuthenticated(false);
                setIsEmailVerified(false);
            } finally {
                setIsLoading(false);
            }
        };

        // Don't check auth for public routes
        if (!PUBLIC_ROUTES.some(route => location.pathname.startsWith(route))) {
            checkAuth();
        } else {
            setIsLoading(false);
        }
    }, [location.pathname]); // location.pathname is stable and provided by react-router

    if (isLoading) {
        return null; // or a loading spinner
    }

    // If it's a public route, allow access
    if (PUBLIC_ROUTES.some(route => location.pathname.startsWith(route))) {
        // If user is authenticated, redirect them away from auth pages
        if (isAuthenticated) {
            // If email is not verified, send to unverified page
            if (!isEmailVerified && location.pathname !== '/unverified') {
                return <Navigate to="/unverified" replace />;
            }
            // If email is verified, send to home
            if (isEmailVerified && PUBLIC_ROUTES.some(route => location.pathname.startsWith(route))) {
                return <Navigate to="/home" replace />;
            }
        }
        return children;
    }

    // Handle protected routes
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isEmailVerified) {
        return <Navigate to="/unverified" replace />;
    }

    return children;
};

export default ProtectedRoute; 