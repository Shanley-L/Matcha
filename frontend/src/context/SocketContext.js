import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useUser } from './UserContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            // Create socket connection
            const newSocket = io('http://localhost:5000', {
                withCredentials: true,
            });

            // Set up event listeners
            newSocket.on('connect', () => {
                console.log('Socket connected');
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            setSocket(newSocket);

            // Cleanup on unmount
            return () => {
                newSocket.close();
            };
        } else {
            // If user logs out, close socket
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}; 