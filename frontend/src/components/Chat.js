import React, { useState, useEffect, useRef } from 'react';
import axios from '../config/axios';
import { useWhoAmI } from '../context/WhoAmIContext';
import { useNotifications } from '../context/NotificationContext';
import '../styles/components/Chat.css';

const Chat = ({ conversationId, otherUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const processedMessageIdsRef = useRef(new Set());
    const { socket, me } = useWhoAmI();
    const { setActiveConversation } = useNotifications();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (conversationId) {
            setActiveConversation(conversationId);
        }
        
        return () => {
            setActiveConversation(null);
        };
    }, [conversationId, setActiveConversation]);

    // Fetch messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true);
                // Reset the processed message IDs when conversation changes
                processedMessageIdsRef.current = new Set();
                
                const response = await axios.get(`/api/conv/${conversationId}/messages`);
                
                // Transform messages if needed to match our component's expected format
                const formattedMessages = response.data.map(msg => ({
                    id: msg.id,
                    sender_id: msg.sender?.id || msg.sender_id,
                    content: msg.message || msg.content,
                    sent_at: msg.created_at || msg.sent_at,
                    messageKey: `server-${msg.id || Math.random().toString(36).substr(2, 9)}`
                }));
                
                // Add all message IDs to the processed set
                formattedMessages.forEach(msg => {
                    if (msg.id) {
                        processedMessageIdsRef.current.add(msg.id);
                    }
                });
                
                setMessages(formattedMessages);
                setLoading(false);
                // Use setTimeout to ensure DOM is updated before scrolling
                setTimeout(scrollToBottom, 100);
            } catch (error) {
                console.error('Error fetching messages:', error);
                setLoading(false);
            }
        };

        if (conversationId) {
            // Use a flag to prevent duplicate API calls
            const controller = new AbortController();
            fetchMessages();
            return () => controller.abort();
        }
    }, [conversationId]);

    // Socket event handlers
    useEffect(() => {
        if (!socket || !conversationId || !me?.id) {
            return;
        }
        
        // Create a flag to track if we've already joined this room
        let hasJoined = false;
        
        // Clean up any existing listeners before setting up new ones
        socket.off('new_message');
        socket.off('typing_status');
        
        socket.emit('join', { conversation_id: conversationId });
        
        // Mark all message notifications from this conversation as read
        try {
            axios.post(`/api/user/notifications/read/type/message`);
        } catch (error) {
            console.error(`Error marking message notifications as read:`, error);
        }
        
        hasJoined = true;

        // Listen for new messages
        const handleNewMessage = (data) => {
            if (data.conversation_id === conversationId.toString()) {
                // Format the message to match our component's expected format
                const newMsg = {
                    id: data.message?.id,
                    sender_id: data.message?.sender?.id || data.message?.sender_id || data.sender?.id,
                    content: data.message?.message || data.message?.content || data.content,
                    sent_at: data.message?.created_at || data.message?.sent_at || data.timestamp || data.sent_at,
                    messageKey: `socket-${data.message?.id || Math.random().toString(36).substr(2, 9)}`
                };
                
                // Skip if we've already processed this message ID
                if (newMsg.id && processedMessageIdsRef.current.has(newMsg.id)) {
                    return;
                }
                
                // Add to processed set if it has an ID
                if (newMsg.id) {
                    processedMessageIdsRef.current.add(newMsg.id);
                }
                
                // Add the message to our state
                setMessages(prev => {
                    // More robust duplicate detection
                    const isDuplicate = prev.some(msg => {
                        // Check by ID if available
                        if (newMsg.id && msg.id === newMsg.id) {
                            return true;
                        }
                        // Check by content, sender and approximate time
                        if (msg.content === newMsg.content && 
                            msg.sender_id === newMsg.sender_id) {
                            // If sent within 60 seconds, consider it a duplicate
                            const msgTime = new Date(msg.sent_at || new Date());
                            const newMsgTime = new Date(newMsg.sent_at || new Date());
                            const timeDiff = Math.abs(msgTime - newMsgTime);
                            if (timeDiff < 1000) { // 10 seconds
                                return true;
                            }
                        }
                        
                        return false;
                    });
                    
                    if (isDuplicate) {
                        return prev;
                    }
                    
                    const newMessages = [...prev, newMsg];
                    setTimeout(scrollToBottom, 100);
                    return newMessages;
                });
            }
        };
        
        // Listen for typing status
        const handleTypingStatus = (data) => {
            if (data.conversation_id === conversationId.toString() && data.user_id !== me.id) {
                setOtherUserTyping(data.is_typing);
            }
        };

        // Add event listeners
        socket.on('new_message', handleNewMessage);
        socket.on('typing_status', handleTypingStatus);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('typing_status', handleTypingStatus);
            
            // Only leave if we joined
            if (hasJoined) {
                socket.emit('leave_conversation', { conversation_id: conversationId });
            }
        };
    }, [socket, conversationId, me?.id]);

    // Handle typing status
    const handleTyping = () => {
        if (!socket) return;
        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing', {
                conversation_id: conversationId,
                is_typing: true
            });
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
        if (!newMessage.trim() || !conversationId || sendingMessage) return;   
        const messageContent = newMessage.trim();
        
        // Clear the input field immediately
        setNewMessage('');
        
        // Reset typing status
        if (isTyping) {
            setIsTyping(false);
            socket.emit('typing', {
                conversation_id: conversationId,
                is_typing: false
            });
        }
        
        try {
            setSendingMessage(true);
            const response = await axios.post(`/api/conv/${conversationId}/messages`, {
                message: messageContent
            });
            
            // Store the server-assigned message ID to help with deduplication
            const serverMessageId = response.data.id;
            if (serverMessageId) {
                processedMessageIdsRef.current.add(serverMessageId);
            }
            
            // We don't need to add the message to the UI here
            // The socket will receive the message and add it to the UI
            
        } catch (error) {
            console.error('Error sending message:', error);
            // Show error to user
            alert('Failed to send message. Please try again.');
        } finally {
            setSendingMessage(false);
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
                {messages.length === 0 ? (
                    <div className="no-messages">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={message.messageKey || message.id || message.tempId || `msg-${index}-${Math.random().toString(36).substr(2, 9)}`}
                            className={`message ${message.sender_id === me?.id ? 'sent' : 'received'} ${message.pending ? 'pending' : ''} ${message.failed ? 'failed' : ''}`}
                        >
                            <div className="message-content">{message.content}</div>
                            <div className="message-time">
                                {message.pending 
                                    ? 'Sending...' 
                                    : message.failed 
                                        ? 'Failed to send' 
                                        : message.sent_at 
                                            ? new Date(message.sent_at).toLocaleTimeString([], { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                              }) 
                                            : 'Sent'}
                            </div>
                        </div>
                    ))
                )}
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
                    onKeyDown={(e) => {
                        if (e.key !== 'Enter') {
                            handleTyping();
                        }
                    }}
                    placeholder="Type a message..."
                    disabled={sendingMessage}
                />
                <button type="submit" disabled={!newMessage.trim() || sendingMessage}>
                    {sendingMessage ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default Chat; 