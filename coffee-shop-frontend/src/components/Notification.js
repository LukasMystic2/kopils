import React, { useEffect, useState, useCallback } from 'react';

const Notification = ({ message, type, onClose }) => {
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(100);

    const handleClose = useCallback(() => {
        setVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    }, [onClose]);

    useEffect(() => {
        if (message) {
            setVisible(true);
            setProgress(100);
            
            // Progress bar animation
            const progressTimer = setInterval(() => {
                setProgress(prev => {
                    if (prev <= 0) {
                        clearInterval(progressTimer);
                        return 0;
                    }
                    return prev - (100 / 30); // 30 steps over 3 seconds
                });
            }, 100);

            // Auto close timer
            const closeTimer = setTimeout(() => {
                handleClose();
            }, 3000);

            return () => {
                clearTimeout(closeTimer);
                clearInterval(progressTimer);
            };
        }
    }, [message, handleClose]);

    if (!message) return null;

    const getNotificationStyle = (type) => {
        const styles = {
            success: {
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(21, 128, 61, 0.95) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                icon: '✅',
                progressColor: 'rgba(255, 255, 255, 0.3)'
            },
            error: {
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                icon: '❌',
                progressColor: 'rgba(255, 255, 255, 0.3)'
            },
            warning: {
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(180, 83, 9, 0.95) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                icon: '⚠️',
                progressColor: 'rgba(255, 255, 255, 0.3)'
            },
            info: {
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(29, 78, 216, 0.95) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                icon: 'ℹ️',
                progressColor: 'rgba(255, 255, 255, 0.3)'
            }
        };
        return styles[type] || styles.info;
    };

    const notificationStyle = getNotificationStyle(type);

    const containerStyle = {
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        left: '1rem',
        zIndex: 9999,
        maxWidth: '400px',
        margin: '0 auto',
        // Mobile responsive positioning
        '@media (min-width: 640px)': {
            left: 'auto',
            margin: '0'
        }
    };

    const cardStyle = {
        ...notificationStyle,
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '1rem',
        boxShadow: visible 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        transform: visible 
            ? 'translateY(0) scale(1)' 
            : 'translateY(-100px) scale(0.95)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        overflow: 'hidden',
    };

    const progressBarStyle = {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '3px',
        width: `${progress}%`,
        background: 'rgba(255, 255, 255, 0.8)',
        transition: 'width 0.1s linear',
        borderRadius: '0 0 16px 16px',
    };

    const closeButtonStyle = {
        background: 'rgba(255, 255, 255, 0.2)',
        border: 'none',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
    };

    return (
        <div style={containerStyle} className="pointer-events-none">
            <div 
                style={cardStyle}
                className="pointer-events-auto relative"
            >
                {/* Main Content */}
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div 
                        className="flex-shrink-0 text-2xl"
                        style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                        }}
                    >
                        {notificationStyle.icon}
                    </div>
                    
                    {/* Message */}
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm leading-relaxed break-words">
                            {message}
                        </p>
                    </div>
                    
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        style={closeButtonStyle}
                        className="flex-shrink-0 hover:bg-white/30 active:scale-95"
                        aria-label="Close notification"
                    >
                        ×
                    </button>
                </div>
                
                {/* Progress Bar */}
                <div 
                    style={progressBarStyle}
                    className="absolute"
                />
                
                {/* Subtle Animation Overlay */}
                <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        background: `linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)`,
                        transform: visible ? 'translateX(100%)' : 'translateX(-100%)',
                        transition: 'transform 0.6s ease-out',
                        transitionDelay: '0.2s'
                    }}
                />
            </div>
            
            {/* Custom styles for responsive behavior */}
            <style>{`
                @media (max-width: 640px) {
                    .notification-container {
                        left: 0.5rem;
                        right: 0.5rem;
                        top: 0.5rem;
                    }
                }
                
                @media (min-width: 641px) {
                    .notification-container {
                        left: auto;
                        right: 1rem;
                        max-width: 400px;
                        margin: 0;
                    }
                }

                /* Smooth entrance animation */
                @keyframes slideInDown {
                    from {
                        transform: translateY(-100px) scale(0.95);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }

                /* Bounce effect for success */
                @keyframes bounceIn {
                    0% {
                        transform: translateY(-100px) scale(0.3);
                        opacity: 0;
                    }
                    50% {
                        transform: translateY(-10px) scale(1.05);
                    }
                    70% {
                        transform: translateY(-5px) scale(1.02);
                    }
                    100% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }

                /* Shake effect for errors */
                @keyframes shakeIn {
                    0% {
                        transform: translateY(-100px) translateX(0);
                        opacity: 0;
                    }
                    60% {
                        transform: translateY(0) translateX(0);
                        opacity: 1;
                    }
                    65% {
                        transform: translateY(0) translateX(-5px);
                    }
                    75% {
                        transform: translateY(0) translateX(5px);
                    }
                    85% {
                        transform: translateY(0) translateX(-3px);
                    }
                    95% {
                        transform: translateY(0) translateX(2px);
                    }
                    100% {
                        transform: translateY(0) translateX(0);
                    }
                }
            `}</style>
        </div>
    );
};

// Enhanced Notification Manager for multiple notifications
export const NotificationManager = ({ notifications, onRemove }) => {
    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
            <div className="flex flex-col gap-2 p-4 sm:p-6 sm:items-end">
                {notifications.map((notification, index) => (
                    <div
                        key={notification.id}
                        style={{
                            animation: `slideInDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.1}s both`
                        }}
                    >
                        <Notification
                            message={notification.message}
                            type={notification.type}
                            onClose={() => onRemove(notification.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

// Hook for managing notifications
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        const notification = { id, message, type };
        
        setNotifications(prev => [...prev, notification]);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
        
        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return {
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        // Convenience methods
        success: (message) => addNotification(message, 'success'),
        error: (message) => addNotification(message, 'error'),
        warning: (message) => addNotification(message, 'warning'),
        info: (message) => addNotification(message, 'info'),
    };
};

export default Notification;