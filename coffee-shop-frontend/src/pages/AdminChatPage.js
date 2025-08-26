import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import useFetch from '../hooks/useFetch';

const AdminChatPage = ({ adminInfo }) => {
    const API_URL = process.env.SERVER_URL;
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    
    const { data: conversations, loading, error, setData: setConversations } = useFetch(`${API_URL}/api/chat/conversations`, token, true);
    
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [unreadConversations, setUnreadConversations] = useState(new Set());
    const [isTyping, setIsTyping] = useState(false);
    const socket = useSocket();
    const chatEndRef = useRef(null);

    // Enhanced CSS styles as inline object
    const styles = {
        container: {
            display: 'flex',
            height: 'calc(100vh - 200px)',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            position: 'relative'
        },
        sidebar: {
            width: '100%',
            background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
            borderRight: '1px solid rgba(124, 58, 237, 0.2)',
            overflowY: 'auto',
            backdropFilter: 'blur(10px)',
            position: 'relative'
        },
        sidebarMd: {
            width: '33.333333%'
        },
        conversationItem: {
            padding: '16px',
            cursor: 'pointer',
            borderLeft: '4px solid transparent',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            background: 'linear-gradient(90deg, transparent 0%, rgba(124, 58, 237, 0.05) 100%)',
            animation: 'slideInLeft 0.5s ease-out forwards'
        },
        conversationItemHover: {
            background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
            transform: 'translateX(4px)',
            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.2)'
        },
        conversationItemActive: {
            background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
            borderLeftColor: '#f59e0b',
            transform: 'translateX(8px)'
        },
        chatArea: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
            position: 'relative'
        },
        chatAreaMd: {
            width: '66.666667%'
        },
        header: {
            padding: '16px',
            background: 'linear-gradient(90deg, #1f2937 0%, #374151 100%)',
            borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexShrink: 0,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
        },
        messagesContainer: {
            flexGrow: 1,
            padding: '16px',
            overflowY: 'auto',
            background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
            position: 'relative'
        },
        messageWrapper: {
            marginBottom: '12px',
            display: 'flex',
            animation: 'messageSlideIn 0.4s ease-out forwards',
            opacity: 0
        },
        messageAdmin: {
            justifyContent: 'flex-end'
        },
        messageUser: {
            justifyContent: 'flex-start'
        },
        messageBubble: {
            borderRadius: '12px',
            padding: '12px 16px',
            maxWidth: '70%',
            position: 'relative',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease'
        },
        messageBubbleAdmin: {
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            borderBottomRightRadius: '4px'
        },
        messageBubbleUser: {
            background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
            color: '#e5e7eb',
            borderBottomLeftRadius: '4px'
        },
        inputForm: {
            padding: '16px',
            borderTop: '1px solid rgba(124, 58, 237, 0.2)',
            background: 'linear-gradient(90deg, #1f2937 0%, #374151 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
            backdropFilter: 'blur(10px)'
        },
        input: {
            flexGrow: 1,
            padding: '12px 16px',
            background: 'rgba(17, 24, 39, 0.8)',
            borderRadius: '25px',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            color: 'white',
            outline: 'none',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(5px)'
        },
        inputFocus: {
            borderColor: '#f59e0b',
            boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.1)',
            background: 'rgba(17, 24, 39, 0.9)'
        },
        sendButton: {
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            borderRadius: '50%',
            height: '48px',
            width: '48px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
        },
        sendButtonHover: {
            transform: 'scale(1.1) rotate(5deg)',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.6)'
        },
        sendButtonDisabled: {
            background: '#4b5563',
            cursor: 'not-allowed',
            boxShadow: 'none'
        },
        onlineIndicator: {
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: '12px',
            height: '12px',
            background: '#10b981',
            borderRadius: '50%',
            border: '2px solid #1f2937',
            animation: 'pulse 2s infinite'
        },
        unreadBadge: {
            width: '12px',
            height: '12px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '50%',
            marginRight: '8px',
            flexShrink: 0,
            animation: 'bounce 1s infinite',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
        },
        loadingSpinner: {
            display: 'inline-block',
            width: '20px',
            height: '20px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #f59e0b',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        },
        emptyState: {
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px',
            color: '#6b7280',
            animation: 'fadeIn 1s ease-out'
        },
        typingIndicator: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(75, 85, 99, 0.5)',
            borderRadius: '20px',
            marginBottom: '12px',
            animation: 'fadeIn 0.3s ease-out'
        }
    };

    // CSS animations as a style tag
    const cssAnimations = `
        <style>
            @keyframes slideInLeft {
                from { transform: translateX(-20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes messageSlideIn {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
            }
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-3px); }
                60% { transform: translateY(-1.5px); }
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-10px); }
            }
            .typing-dot {
                width: 8px;
                height: 8px;
                background: #6b7280;
                border-radius: 50%;
                animation: typing 1.4s infinite ease-in-out;
            }
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        </style>
    `;

    useEffect(() => {
        if (conversations && conversations.length > 0) {
            const initialUnread = new Set();
            conversations.forEach(convo => {
                if (convo.unreadCount > 0) {
                    initialUnread.add(convo._id);
                }
            });
            setUnreadConversations(initialUnread);

            if (socket) {
                socket.emit('requestOnlineUsers');
            }
        }
    }, [conversations, socket]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Add animation delay for messages
    useEffect(() => {
        const messageElements = document.querySelectorAll('[data-message]');
        messageElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
            el.style.opacity = '1';
        });
    }, [messages]);

    const fetchMessages = useCallback(async (conversationId) => {
        try {
            const res = await fetch(`${API_URL}/api/chat/messages/${conversationId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setMessages(data);
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        }
    }, [API_URL, token]);

    useEffect(() => {
        if (!socket) return;
        
        const handleOnlineUsers = (onlineUserIds) => {
            setOnlineUsers(onlineUserIds);
        };
        
        const handleReceiveMessage = (message) => {
            if (selectedConversation && message.conversationId === selectedConversation._id) {
                setMessages(prev => [...prev, message]);
            }
        };
        
        const handleUpdateList = (updatedConvo) => {
            setConversations(prev => {
                const otherConversations = (prev || []).filter(c => c._id !== updatedConvo._id);
                const newConversations = [updatedConvo, ...otherConversations];
                return newConversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            });
        };

        const handleNewMessageNotification = ({ conversationId }) => {
            if (selectedConversation?._id !== conversationId) {
                setUnreadConversations(prev => new Set(prev).add(conversationId));
            }
        };

        socket.on('getOnlineUsers', handleOnlineUsers);
        socket.on('receiveMessage', handleReceiveMessage);
        socket.on('updateConversationList', handleUpdateList);
        socket.on('newMessageNotification', handleNewMessageNotification);
        
        socket.emit('requestOnlineUsers');

        return () => {
            socket.off('getOnlineUsers', handleOnlineUsers);
            socket.off('receiveMessage', handleReceiveMessage);
            socket.off('updateConversationList', handleUpdateList);
            socket.off('newMessageNotification', handleNewMessageNotification);
        };
    }, [socket, selectedConversation, setConversations]);

    const handleSelectConversation = (conversation) => {
        if (socket && selectedConversation) {
            socket.emit('leaveRoom', selectedConversation._id);
        }
        setSelectedConversation(conversation);
        fetchMessages(conversation._id);
        if (socket) {
            socket.emit('joinRoom', conversation._id);
            socket.emit('markAsRead', { conversationId: conversation._id, userId: adminInfo.id });
            setUnreadConversations(prev => {
                const newSet = new Set(prev);
                newSet.delete(conversation._id);
                return newSet;
            });
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !socket || !selectedConversation) return;

        if (adminInfo.name === "Anie Suriyani") {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 500);
            
            socket.emit('sendMessage', {
                conversationId: selectedConversation._id,
                senderId: adminInfo.id,
                content: newMessage,
            });
        }
        setNewMessage('');
    };

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <div style={styles.loadingSpinner}></div>
            <p style={{ marginTop: '16px' }}>📨 Memuat percakapan...</p>
        </div>
    );
    
    if (error) return (
        <div style={{ textAlign: 'center', color: '#ef4444', padding: '40px' }}>
            <p>❌ {error}</p>
        </div>
    );

    const userParticipant = selectedConversation?.participants.find(p => p.role === 'user');

    return (
        <>
            <div dangerouslySetInnerHTML={{ __html: cssAnimations }} />
            <div style={styles.container}>
                <div style={{
                    ...styles.sidebar,
                    ...(window.innerWidth >= 768 ? styles.sidebarMd : {}),
                    ...(selectedConversation && window.innerWidth < 768 ? { display: 'none' } : {})
                }}>
                    {conversations && conversations.map((convo, index) => {
                        const userP = convo.participants.find(p => p.role === 'user');
                        const isOnline = userP && onlineUsers.includes(userP._id.toString());
                        const hasUnread = unreadConversations.has(convo._id);
                        const isSelected = selectedConversation?._id === convo._id;
                        
                        return (
                            <div 
                                key={convo._id} 
                                onClick={() => handleSelectConversation(convo)} 
                                style={{
                                    ...styles.conversationItem,
                                    ...(isSelected ? styles.conversationItemActive : {}),
                                    animationDelay: `${index * 0.1}s`
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSelected) {
                                        Object.assign(e.target.style, styles.conversationItemHover);
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSelected) {
                                        e.target.style.background = styles.conversationItem.background;
                                        e.target.style.transform = 'translateX(0)';
                                        e.target.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <img 
                                                src={userP?.profilePictureUrl || 'https://placehold.co/40x40/1f2937/4b5563?text=👤'} 
                                                alt="User" 
                                                style={{ 
                                                    width: '40px', 
                                                    height: '40px', 
                                                    borderRadius: '50%',
                                                    border: '2px solid rgba(124, 58, 237, 0.3)',
                                                    transition: 'all 0.3s ease'
                                                }} 
                                            />
                                            {isOnline && <div style={styles.onlineIndicator}></div>}
                                        </div>
                                        <div>
                                            <p style={{ 
                                                fontWeight: 'bold', 
                                                color: 'white', 
                                                margin: 0,
                                                fontSize: '14px'
                                            }}>
                                                {isOnline ? '🟢' : '⚪'} {userP?.name || 'Pengguna Tidak Dikenal'}
                                            </p>
                                            <p style={{ 
                                                fontSize: '12px', 
                                                color: '#9ca3af',
                                                margin: '2px 0'
                                            }}>
                                                📧 {userP?.email}
                                            </p>
                                            <p style={{ 
                                                fontSize: '12px', 
                                                color: '#6b7280',
                                                margin: 0,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '200px'
                                            }}>
                                                💬 {convo.lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                    {hasUnread && <div style={styles.unreadBadge}></div>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{
                    ...styles.chatArea,
                    ...(window.innerWidth >= 768 ? styles.chatAreaMd : {}),
                    ...(selectedConversation ? { display: 'flex' } : { display: window.innerWidth >= 768 ? 'flex' : 'none' })
                }}>
                    {selectedConversation ? (
                        <>
                            <div style={styles.header}>
                                <button 
                                    onClick={() => setSelectedConversation(null)} 
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '18px',
                                        cursor: 'pointer',
                                        display: window.innerWidth >= 768 ? 'none' : 'block',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(124, 58, 237, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'none';
                                    }}
                                >
                                    ← 
                                </button>
                                <div>
                                    <h3 style={{ 
                                        fontWeight: 'bold', 
                                        color: 'white', 
                                        margin: 0,
                                        fontSize: '18px'
                                    }}>
                                        💬 {userParticipant?.name || 'Chat Terpilih'}
                                    </h3>
                                    <p style={{ 
                                        fontSize: '12px', 
                                        color: '#9ca3af',
                                        margin: '4px 0 0 0'
                                    }}>
                                        📧 {userParticipant?.email}
                                    </p>
                                </div>
                            </div>

                            <div style={styles.messagesContainer}>
                                {messages.map((msg, index) => (
                                    <div 
                                        key={index} 
                                        data-message="true"
                                        style={{
                                            ...styles.messageWrapper,
                                            ...(msg.sender.name === 'Anie Suriyani' ? styles.messageAdmin : styles.messageUser)
                                        }}
                                    >
                                        <div style={styles.messageBubble}>
                                            <p style={{ 
                                                fontWeight: 'bold', 
                                                fontSize: '12px', 
                                                margin: '0 0 4px 0',
                                                color: msg.sender.name === 'Anie Suriyani' ? '#fbbf24' : '#9ca3af'
                                            }}>
                                                {msg.sender.name === 'Anie Suriyani' ? '👩‍💼' : '👤'} {msg.sender.name}
                                            </p>
                                            <div style={{
                                                ...styles.messageBubble,
                                                ...(msg.sender.name === 'Anie Suriyani' ? styles.messageBubbleAdmin : styles.messageBubbleUser),
                                                margin: 0,
                                                maxWidth: 'none'
                                            }}>
                                                <p style={{ margin: 0 }}>{msg.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {isTyping && (
                                    <div style={styles.typingIndicator}>
                                        <span>💭 Sedang mengetik</span>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            <div className="typing-dot"></div>
                                            <div className="typing-dot"></div>
                                            <div className="typing-dot"></div>
                                        </div>
                                    </div>
                                )}
                                
                                <div ref={chatEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} style={styles.inputForm}>
                                <input 
                                    type="text" 
                                    value={newMessage} 
                                    onChange={(e) => setNewMessage(e.target.value)} 
                                    placeholder={adminInfo.name === 'Anie Suriyani' ? "💬 Ketik pesan..." : "👁️ Mode hanya lihat."} 
                                    style={styles.input}
                                    disabled={adminInfo.name !== 'Anie Suriyani'}
                                    onFocus={(e) => {
                                        Object.assign(e.target.style, styles.inputFocus);
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(124, 58, 237, 0.3)';
                                        e.target.style.boxShadow = 'none';
                                        e.target.style.background = 'rgba(17, 24, 39, 0.8)';
                                    }}
                                />
                                <button 
                                    type="submit" 
                                    style={{
                                        ...styles.sendButton,
                                        ...(adminInfo.name !== 'Anie Suriyani' ? styles.sendButtonDisabled : {})
                                    }}
                                    disabled={adminInfo.name !== 'Anie Suriyani'}
                                    onMouseEnter={(e) => {
                                        if (adminInfo.name === 'Anie Suriyani') {
                                            Object.assign(e.target.style, styles.sendButtonHover);
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (adminInfo.name === 'Anie Suriyani') {
                                            e.target.style.transform = 'scale(1) rotate(0deg)';
                                            e.target.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
                                        }
                                    }}
                                >
                                    🚀
                                </button>
                            </form>
                        </>
                    ) : (
                        <div style={styles.emptyState}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                            <p style={{ fontSize: '18px', fontWeight: '500' }}>Pilih percakapan untuk melihat riwayat chat</p>
                            <p style={{ fontSize: '14px', opacity: 0.7 }}>Klik pada salah satu percakapan di samping untuk mulai chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminChatPage;