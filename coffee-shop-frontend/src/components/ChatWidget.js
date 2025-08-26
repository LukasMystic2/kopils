import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

const ChatWidget = ({ userInfo }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversation, setConversation] = useState(null);
    const [anieIsOnline, setAnieIsOnline] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [mounted, setMounted] = useState(false);
    const socket = useSocket();
    const chatEndRef = useRef(null);
    const API_URL = `${process.env.SERVER_URL}`;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen && userInfo) {
            setUnreadCount(0);
            
            const fetchConversation = async () => {
                try {
                    const res = await fetch(`${API_URL}/api/chat/my-conversation`, {
                        headers: { 'Authorization': `Bearer ${userInfo.token}` }
                    });
                    if (!res.ok) throw new Error('Could not start conversation.');
                    const convData = await res.json();
                    setConversation(convData);

                    const messagesRes = await fetch(`${API_URL}/api/chat/my-messages/${convData._id}`, {
                        headers: { 'Authorization': `Bearer ${userInfo.token}` }
                    });
                    if (!messagesRes.ok) throw new Error('Could not fetch messages.');
                    const messagesData = await messagesRes.json();
                    setMessages(Array.isArray(messagesData) ? messagesData : []);

                    if (socket) {
                        socket.emit('markAsRead', { conversationId: convData._id, userId: userInfo._id });
                    }

                } catch (error) {
                    console.error("Failed to fetch chat data:", error);
                    setMessages([]);
                }
            };
            fetchConversation();
        }
    }, [isOpen, userInfo, socket, API_URL]);

    useEffect(() => {
        if (!socket) return;

        if (conversation) {
            socket.emit('joinRoom', conversation._id);
            socket.emit('requestOnlineUsers');
        }

        const handleReceiveMessage = (message) => {
            if (message.conversationId === conversation?._id) {
                setMessages(prev => [...prev, message]);
                 if (!isOpen) {
                    setUnreadCount(prev => prev + 1);
                }
            }
        };

        const handleOnlineUsers = (onlineUserIds) => {
            const anie = conversation?.participants.find(p => p.email === "aniesuryany1@gmail.com");
            if (anie) {
                setAnieIsOnline(onlineUserIds.includes(anie._id.toString()));
            }
        };

        const handleNewMessageNotification = (data) => {
             if (data.conversationId !== conversation?._id && !isOpen) {
                setUnreadCount(prev => prev + 1);
            }
        };

        socket.on('receiveMessage', handleReceiveMessage);
        socket.on('getOnlineUsers', handleOnlineUsers);
        socket.on('newMessageNotification', handleNewMessageNotification);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
            socket.off('getOnlineUsers', handleOnlineUsers);
            socket.off('newMessageNotification', handleNewMessageNotification);
        };
    }, [socket, conversation, isOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !socket || !conversation) return;

        socket.emit('sendMessage', {
            conversationId: conversation._id,
            senderId: userInfo._id,
            content: newMessage,
        });
        setNewMessage('');
    };

    if (!userInfo || userInfo.role === 'admin' || !userInfo.isVerified) {
        return null;
    }

    return (
        <>
            {/* Chat Window */}
            <div 
                style={{
                    position: 'fixed',
                    bottom: '8rem', 
                    left: '1.25rem',
                    width: 'calc(100% - 2.5rem)',
                    maxWidth: '384px', // sm:w-96
                    height: '60vh',
                    background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.85), rgba(17, 24, 39, 0.85))',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '1rem', // rounded-2xl
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                    // FIX: Increased z-index to layer correctly with modals
                    zIndex: 1000,
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                    pointerEvents: isOpen ? 'auto' : 'none',
                }}
            >
                {/* Header */}
                <div className="p-4 rounded-t-lg flex justify-between items-center flex-shrink-0" style={{borderBottom: '1px solid rgba(75, 85, 99, 0.5)'}}>
                    <div>
                        <h3 className="font-bold text-white">Chat with Anie ☕</h3>
                        <div className={`text-xs flex items-center gap-2 ${anieIsOnline ? 'text-green-400' : 'text-gray-400'}`}>
                            <div className={`w-2 h-2 rounded-full transition-colors ${anieIsOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                            {anieIsOnline ? 'Online' : 'Offline'}
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-2xl transition-colors">&times;</button>
                </div>
                
                {/* Messages */}
                <div className="flex-grow p-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`mb-3 flex ${msg.sender?._id === userInfo._id ? 'justify-end' : 'justify-start'}`} style={{ animation: 'fadeInUp 0.4s ease-out forwards' }}>
                            <div className={`rounded-xl px-4 py-2 max-w-xs shadow-md ${msg.sender?._id === userInfo._id ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Form */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700/50 flex items-center gap-2 flex-shrink-0">
                    <input 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tulis pesan..."
                        className="flex-grow p-2 bg-gray-900/80 rounded-lg border-2 border-transparent text-white focus:ring-0 focus:border-amber-500 focus:outline-none transition-all duration-300"
                    />
                    <button type="submit" className="bg-amber-600 text-white rounded-full h-10 w-10 flex-shrink-0 flex items-center justify-center hover:bg-amber-500 transition-colors transform hover:scale-110">
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>

            {/* Chat Toggle Button & Text */}
            <div 
                className="fixed bottom-5 left-5 flex flex-col items-center gap-2"
                // FIX: Increased z-index to layer correctly with modals
                style={{ zIndex: 10 }}
            >
                 {/* Text bubble */}
                <div style={{
                    transition: 'all 0.5s ease-out',
                    opacity: !isOpen && mounted ? 1 : 0,
                    transform: !isOpen && mounted ? 'translateY(0)' : 'translateY(10px)',
                }}>
                    <div className="bg-gray-800/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm border border-gray-700/50">
                        <p className="text-sm font-semibold">Tanya di sini!</p>
                    </div>
                </div>
                
                {/* Main button */}
                <div className="relative">
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full shadow-lg transform hover:scale-110 transition-all duration-300"
                        style={{
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
                            animation: !isOpen ? 'pulseGlow 2s infinite' : 'none',
                        }}
                    >
                        <i className={`fas ${isOpen ? 'fa-times' : 'fa-comments'} text-2xl text-white transition-transform duration-300 ${isOpen ? 'rotate-[360deg]' : ''}`}></i>
                    </button>
                    {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-gray-950" style={{ animation: 'popIn 0.3s ease-out' }}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.4); }
                    50% { box-shadow: 0 0 35px rgba(251, 191, 36, 0.7); }
                }
                @keyframes popIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    80% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
                /* Custom scrollbar */
                .overflow-y-auto::-webkit-scrollbar { width: 5px; }
                .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
                .overflow-y-auto::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.4); border-radius: 3px; }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: rgba(251, 191, 36, 0.6); }
            `}</style>
        </>
    );
};

export default ChatWidget;
