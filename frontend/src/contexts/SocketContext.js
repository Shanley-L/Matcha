import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user && user.id) {
            const newSocket = io('http://localhost:5000', {
                query: { user_id: user.id },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000
            });

            newSocket.on('connect', () => {
                console.log('Connected to socket server');
                setIsConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('Disconnected from socket server');
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setIsConnected(false);
            });

            newSocket.on('error', (error) => {
                console.error('Socket error:', error);
            });

            setSocket(newSocket);

            return () => {
                if (newSocket) {
                    newSocket.disconnect();
                    newSocket.close();
                }
            };
        }
    }, [user]);

    const value = {
        socket,
        isConnected,
        // Helper functions for common socket operations
        joinChat: (conversationId) => {
            if (socket) {
                socket.emit('join_chat', { conversation_id: conversationId });
            }
        },
        leaveChat: (conversationId) => {
            if (socket) {
                socket.emit('leave_chat', { conversation_id: conversationId });
            }
        },
        sendMessage: (conversationId, content) => {
            if (socket && user) {
                const message = {
                    conversation_id: conversationId,
                    sender_id: user.id,
                    content,
                    sent_at: new Date().toISOString()
                };
                socket.emit('send_message', message);
                return message;
            }
        },
        sendTypingStatus: (conversationId) => {
            if (socket && user) {
                socket.emit('typing', {
                    conversation_id: conversationId,
                    user_id: user.id
                });
            }
        },
        sendNotification: (targetUserId, type, data) => {
            if (socket && user) {
                socket.emit('notification', {
                    target_user_id: targetUserId,
                    type,
                    data,
                    sender_id: user.id
                });
            }
        }
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}; 