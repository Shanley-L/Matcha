import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from '../config/axios';
import { io } from 'socket.io-client';
import socketConfig from '../config/socketConfig';

const WhoAmIContext = createContext();

export const useWhoAmI = () => {
    const context = useContext(WhoAmIContext);
    if (!context) {
        throw new Error('useWhoAmI must be used within a WhoAmIProvider');
    }
    return context;
};

export const WhoAmIProvider = ({ children }) => {
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const fetchAttemptedRef = useRef(false);
    const socketInitializedRef = useRef(false);
    const socketRef = useRef(null);

    // Clean up socket connection
    const cleanupSocket = useCallback(() => {
        if (socketRef.current) {
            console.log('Cleaning up socket connection');
            socketRef.current.close();
            setSocket(null);
            socketRef.current = null;
            socketInitializedRef.current = false;
        }
    }, []);

    // Initialize socket connection
    const initializeSocket = useCallback(() => {
        if (!me || socketInitializedRef.current || !me.id) return;
        
        console.log('Initializing socket connection for user:', me.id);
        console.log('Using socket URL:', socketConfig.url);
        socketInitializedRef.current = true;
        
        const newSocket = io(socketConfig.url, {
            ...socketConfig.options,
            query: {
                user_id: me.id
            }
        });
        
        newSocket.on('connect', () => {
            console.log('Socket connected successfully');
            console.log('Socket ID:', newSocket.id);
            
            // Explicitly join the user's personal room for notifications
            console.log(`Explicitly joining room: user_${me.id}`);
            newSocket.emit('join_room', { room: `user_${me.id}` });
        });
        
        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            socketInitializedRef.current = false;
        });
        
        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            socketInitializedRef.current = false;
        });
        
        // Debug event to check if we're receiving any events
        newSocket.onAny((event, ...args) => {
            console.log(`Socket event received: ${event}`, args);
        });
        
        socketRef.current = newSocket;
        setSocket(newSocket);
    }, [me]);

    const fetchMe = useCallback(async () => {
        // Prevent multiple fetch attempts
        if (fetchAttemptedRef.current) return;
        
        try {
            setLoading(true);
            console.log('Fetching user data...');
            
            // Check if the user is authenticated
            const response = await axios.get('/api/auth/whoami');
            console.log('User data fetched successfully');
            setMe(response.data);
            setError(null);
        } catch (err) {
            // Only log detailed error in development
            console.error('Error fetching user data:', err.response?.status || err.message);
            
            // Handle 401 Unauthorized differently - this is expected when not logged in
            if (err.response?.status === 401) {
                console.log('User not authenticated');
                setError('Not authenticated');
            } else {
                setError(err.message || 'Failed to fetch user data');
            }
            setMe(null);
            cleanupSocket();
        } finally {
            setLoading(false);
            fetchAttemptedRef.current = true;
        }
    }, [cleanupSocket]);

    // Manual refetch that resets the fetchAttempted flag
    const refetchMe = useCallback(async () => {
        fetchAttemptedRef.current = false;
        
        try {
            setLoading(true);
            console.log('Refetching user data...');
            const response = await axios.get('/api/auth/whoami');
            console.log('User data refetched successfully');
            setMe(response.data);
            setError(null);
        } catch (err) {
            console.error('Error refetching user data:', err.response?.status || err.message);
            
            if (err.response?.status === 401) {
                console.log('User not authenticated');
                setError('Not authenticated');
            } else {
                setError(err.message || 'Failed to fetch user data');
            }
            setMe(null);
            cleanupSocket();
        } finally {
            setLoading(false);
        }
    }, [cleanupSocket]);

    // Fetch user data on mount
    useEffect(() => {
        fetchMe();
    }, [fetchMe]);
    
    // Initialize socket when user data is available
    useEffect(() => {
        if (me && me.id) {
            initializeSocket();
        } else if (!me) {
            cleanupSocket();
        }
        
        return () => {
            cleanupSocket();
        };
    }, [me, initializeSocket, cleanupSocket]);

    const value = {
        me,
        loading,
        error,
        socket,
        refetchMe
    };

    return (
        <WhoAmIContext.Provider value={value}>
            {children}
        </WhoAmIContext.Provider>
    );
}; 