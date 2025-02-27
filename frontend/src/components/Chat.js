import React, { useState, useEffect, useRef } from 'react';
import axios from '../config/axios';
import { useWhoAmI } from '../context/WhoAmIContext';
import '../styles/components/Chat.css';

const Chat = ({ conversationId, otherUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const { socket, me } = useWhoAmI();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`/api/conv/${conversationId}/messages`);
                setMessages(response.data);
                setLoading(false);
                scrollToBottom();
            } catch (error) {
                console.error('Error fetching messages:', error);
                setLoading(false);
            }
        };

        if (conversationId) {
            fetchMessages();
        }
    }, [conversationId]);

    // Socket event handlers
    useEffect(() => {
        if (!socket) {
            console.log('Socket not available for chat');
            return;
        }
        
        if (conversationId) {
            console.log(`Joining conversation room: ${conversationId}`);
            // Join the conversation room
            socket.emit('join', { conversation_id: conversationId });

            // Listen for new messages
            socket.on('new_message', (data) => {
                if (data.conversation_id === conversationId) {
                    setMessages(prev => [...prev, data.message]);
                    scrollToBottom();
                }
            });

            // Listen for typing status
            socket.on('typing_status', (data) => {
                if (data.conversation_id === conversationId && data.user_id !== me.id) {
                    setOtherUserTyping(data.is_typing);
                }
            });

            return () => {
                console.log(`Leaving conversation room: ${conversationId}`);
                socket.off('new_message');
                socket.off('typing_status');
            };
        }
    }, [socket, conversationId, me?.id]);

    // Handle typing status
    const handleTyping = () => {
        if (!socket || !isTyping) {
            setIsTyping(true);
            if (socket) {
                socket.emit('typing', {
                    conversation_id: conversationId,
                    is_typing: true
                });
            }
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            if (socket) {
                socket.emit('typing', {
                    conversation_id: conversationId,
                    is_typing: false
                });
            }
        }, 2000);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await axios.post(`/api/conv/${conversationId}/messages`, {
                message: newMessage.trim()
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    if (loading) {
        return <div className="chat-loading">Loading messages...</div>;
    }

    return (
        <div className="chat">
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

            <div className="chat-messages">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`message ${message.sender_id === me?.id ? 'sent' : 'received'}`}
                    >
                        <div className="message-content">{message.content}</div>
                        <div className="message-time">
                            {new Date(message.sent_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                        </div>
                    </div>
                ))}
                {otherUserTyping && (
                    <div className="typing-indicator">
                        {otherUser.firstname} is typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleTyping}
                    placeholder="Type a message..."
                />
                <button type="submit" disabled={!newMessage.trim()}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat; 