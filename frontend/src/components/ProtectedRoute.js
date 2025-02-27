import { useLocation, Navigate } from 'react-router-dom';
import { useWhoAmI } from '../context/WhoAmIContext';

// Move publicRoutes outside the component to avoid re-renders
const PUBLIC_ROUTES = ['/login', '/register', '/unverified', '/confirm'];

const ProtectedRoute = ({ children }) => {
    const { me, loading, error } = useWhoAmI();
    const location = useLocation();

    // If still loading, show loading indicator
    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    // If it's a public route, allow access
    if (PUBLIC_ROUTES.some(route => location.pathname.startsWith(route))) {
        // If user is authenticated, redirect them away from auth pages
        if (me) {
            // If email is not verified, send to unverified page
            if (!me.is_email_verified && location.pathname !== '/unverified') {
                return <Navigate to="/unverified" replace />;
            }
            // If email is verified, send to home
            if (me.is_email_verified && PUBLIC_ROUTES.some(route => location.pathname.startsWith(route))) {
                return <Navigate to="/home" replace />;
            }
        }
        return children;
    }

    // For protected routes, check if user is authenticated
    if (error || !me) {
        return <Navigate to="/login" replace />;
    }

    // Check email verification for protected routes
    if (!me.is_email_verified) {
        return <Navigate to="/unverified" replace />;
    }

    return children;
};

export default ProtectedRoute; 