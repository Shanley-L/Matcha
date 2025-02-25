import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import axios from '../config/axios';
import '../styles/components/Chat.css';

const Chat = ({ conversationId, otherUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const { socket } = useSocket();
    const { user } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = useCallback(async () => {
        try {
            const response = await axios.get(`/api/conv/${conversationId}/messages`);
            setMessages(response.data);
            setLoading(false);
            scrollToBottom();
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Failed to load messages');
            setLoading(false);
        }
    }, [conversationId]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        if (socket) {
            // Join the conversation room
            socket.emit('join_chat', { conversation_id: conversationId });

            // Listen for new messages
            socket.on('new_message', (data) => {
                if (data.conversation_id === conversationId) {
                    setMessages(prev => [...prev, data]);
                    scrollToBottom();
                }
            });

            return () => {
                socket.off('new_message');
                socket.emit('leave_chat', { conversation_id: conversationId });
            };
        }
    }, [socket, conversationId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageContent = newMessage.trim();
        setNewMessage('');

        try {
            const response = await axios.post(`/api/conv/${conversationId}/messages`, {
                message: messageContent
            });

            // Don't add a temporary message, wait for the server response
            if (response.data) {
                setMessages(prev => [...prev, response.data]);
                scrollToBottom();

                // Emit the message through socket
                if (socket) {
                    socket.emit('send_message', {
                        conversation_id: conversationId,
                        content: messageContent,
                        sender_id: user.id
                    });
                }
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message');
        }
    };

    if (loading) {
        return <div className="chat-loading">Loading messages...</div>;
    }

    if (error) {
        return <div className="chat-error">{error}</div>;
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div
                    className="chat-user-photo"
                    style={{
                        backgroundImage: `url(${otherUser.photos && otherUser.photos.length > 0 
                            ? otherUser.photos[0] 
                            : '/default-profile.png'})`
                    }}
                />
                <div className="chat-user-info">
                    <h3>{otherUser.firstname}</h3>
                    <p>{otherUser.country}</p>
                </div>
            </div>

            <div className="messages-container">
                {messages.map((message) => {
                    const senderId = message?.sender?.id || message?.sender_id;
                    const isSentByMe = senderId === user?.id;
                    
                    return (
                        <div
                            key={message.id}
                            className={`message ${isSentByMe ? 'sent' : 'received'}`}
                        >
                            <div className="message-content">
                                {message.message || message.content}
                            </div>
                            <div className="message-time">
                                {new Date(message.created_at || message.sent_at).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="message-input-container">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                />
                <button type="submit" className="send-button">
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat; 