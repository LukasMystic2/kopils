import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

const MyOrdersPage = ({ userInfo, showNotification }) => {
    const API_URL = `${process.env.SERVER_URL}`;
    const { data: orders, loading, error, setData: setOrders } = useFetch(`${API_URL}/api/orders/myorders`, userInfo?.token, true);
    const [shippingProofFile, setShippingProofFile] = useState(null);
    const [uploadingOrderId, setUploadingOrderId] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [visibleCards, setVisibleCards] = useState({});

    useEffect(() => {
        setMounted(true);
        
        // Staggered animation for order cards
        if (orders && orders.length > 0) {
            orders.forEach((_, index) => {
                setTimeout(() => {
                    setVisibleCards(prev => ({ ...prev, [index]: true }));
                }, index * 150 + 600);
            });
        }

        // Scroll progress tracking
        const handleScroll = () => {
            const winHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight - winHeight;
            const scrollTop = window.pageYOffset;
            const progress = (scrollTop / docHeight) * 100;
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [orders]);

    const handleUploadShippingProof = async (orderId) => {
        if (!shippingProofFile) {
            showNotification('📁 Please select a file to upload.', 'error');
            return;
        }
        setUploadingOrderId(orderId);

        const formData = new FormData();
        formData.append('shippingProof', shippingProofFile);

        try {
            // Step 1: Upload the shipping proof file
            const uploadResponse = await fetch(`${API_URL}/api/orders/upload/shipping-proof`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${userInfo.token}` },
                body: formData,
            });
            if (!uploadResponse.ok) throw new Error('Failed to upload proof.');
            const uploadResult = await uploadResponse.json();
            const shippingPaymentProofUrl = uploadResult.url;

            // Step 2: Update the order with the new URL
            const updateResponse = await fetch(`${API_URL}/api/orders/${orderId}/shipping-proof`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ shippingPaymentProofUrl }),
            });
            if (!updateResponse.ok) throw new Error('Failed to update order with shipping proof URL.');

            showNotification('✅ Shipping payment proof uploaded successfully!');
            
            // Refetch orders to show the new status
            const updatedOrdersRes = await fetch(`${API_URL}/api/orders/myorders`, { headers: { 'Authorization': `Bearer ${userInfo.token}` }});
            const updatedOrders = await updatedOrdersRes.json();
            setOrders(updatedOrders);
            setShippingProofFile(null);
        } catch (err) {
            showNotification(`❌ ${err.message}`, 'error');
        } finally {
            setUploadingOrderId(null);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            'Processing': { 
                text: '#38bdf8', 
                bg: 'rgba(56, 189, 248, 0.15)', 
                border: '#38bdf8', 
                emoji: '👩‍🍳',
                title: 'Sedang Diproses',
                description: 'Tim kami sedang menyiapkan pesanan Anda dengan teliti'
            },
            'Shipped': { 
                text: '#facc15', 
                bg: 'rgba(250, 204, 21, 0.15)', 
                border: '#facc15', 
                emoji: '🚚',
                title: 'Dalam Perjalanan',
                description: 'Pesanan sedang dalam perjalanan ke alamat Anda'
            },
            'Delivered': { 
                text: '#4ade80', 
                bg: 'rgba(74, 222, 128, 0.15)', 
                border: '#4ade80', 
                emoji: '✅',
                title: 'Terkirim',
                description: 'Pesanan telah berhasil dikirim'
            },
            'Cancelled': { 
                text: '#f87171', 
                bg: 'rgba(248, 113, 113, 0.15)', 
                border: '#f87171', 
                emoji: '❌',
                title: 'Dibatalkan',
                description: 'Pesanan telah dibatalkan'
            },
            'Ready for Pickup': { 
                text: '#2dd4bf', 
                bg: 'rgba(45, 212, 191, 0.15)', 
                border: '#2dd4bf', 
                emoji: '🏪',
                title: 'Siap Diambil',
                description: 'Pesanan sudah siap untuk diambil'
            },
            'Received': { 
                text: '#4ade80', 
                bg: 'rgba(74, 222, 128, 0.15)', 
                border: '#4ade80', 
                emoji: '🎉',
                title: 'Diterima',
                description: 'Pesanan telah diterima dengan baik'
            },
            'Awaiting Shipping Payment': { 
                text: '#fbbf24', 
                bg: 'rgba(251, 191, 36, 0.15)', 
                border: '#fbbf24', 
                emoji: '⏳',
                title: 'Menunggu Pembayaran',
                description: 'Menunggu pembayaran ongkos kirim'
            }
        };
        return statusMap[status] || { 
            text: '#9ca3af', 
            bg: 'rgba(156, 163, 175, 0.15)', 
            border: '#9ca3af', 
            emoji: '📄',
            title: 'Status Tidak Diketahui',
            description: 'Status pesanan belum jelas'
        };
    };

    const loadingStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.9))',
        borderRadius: '1.5rem',
        margin: '2rem',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(251, 191, 36, 0.2)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
    };

    const spinnerStyle = {
        width: '70px',
        height: '70px',
        border: '6px solid rgba(251, 191, 36, 0.2)',
        borderTop: '6px solid #fbbf24',
        borderRight: '6px solid #f59e0b',
        borderRadius: '50%',
        animation: 'spinGradient 1.2s linear infinite, pulse 2s ease-in-out infinite',
        marginBottom: '2rem'
    };

    if (loading) return (
        <div style={loadingStyle}>
            <div style={spinnerStyle}></div>
            <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#fbbf24',
                marginBottom: '0.5rem',
                animation: 'textGlow 2s ease-in-out infinite alternate'
            }}>
                🛍️ Memuat Pesanan Anda...
            </div>
            <p style={{ 
                color: '#9ca3af', 
                fontSize: '1rem',
                textAlign: 'center',
                animation: 'fadeInOut 3s ease-in-out infinite'
            }}>
                ✨ Menyiapkan informasi pesanan terbaru
            </p>
        </div>
    );

    if (error) return (
        <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            margin: '2rem auto',
            maxWidth: '600px',
            background: 'linear-gradient(135deg, rgba(248, 113, 113, 0.1), rgba(220, 38, 38, 0.1))',
            borderRadius: '1.5rem',
            border: '2px solid rgba(248, 113, 113, 0.3)',
            boxShadow: '0 20px 40px rgba(248, 113, 113, 0.2)',
            animation: 'shake 0.6s ease-in-out, fadeIn 0.8s ease-out'
        }}>
            <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1rem',
                animation: 'bounce 2s infinite'
            }}>😟</div>
            <h2 style={{ 
                fontSize: '1.8rem', 
                fontWeight: '800', 
                color: '#f87171',
                marginBottom: '1rem'
            }}>
                Oops! Terjadi Kesalahan
            </h2>
            <p style={{ color: '#fca5a5', fontSize: '1.1rem' }}>{error}</p>
        </div>
    );

    const progressBarStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${scrollProgress}%`,
        height: '5px',
        background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #d97706)',
        zIndex: 1000,
        transition: 'width 0.2s ease-out',
        boxShadow: '0 3px 15px rgba(251, 191, 36, 0.6)'
    };

    return (
        <>
            <div style={progressBarStyle}></div>
            <main style={{
                maxWidth: '80rem',
                margin: '0 auto',
                padding: 'clamp(1rem, 4vw, 2rem)',
                color: 'white',
                minHeight: '100vh',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {/* Enhanced Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '3rem',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0) scale(1)' : 'translateY(-30px) scale(0.9)',
                    transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
                }}>
                    <h1 style={{
                        fontSize: 'clamp(2rem, 6vw, 4rem)',
                        fontWeight: '900',
                        background: 'linear-gradient(135deg, #d97706, #fbbf24, #f59e0b, #fbbf24, #d97706)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: '1rem',
                        backgroundSize: '300% auto',
                        animation: 'textShimmer 4s linear infinite, titleBounce 3s ease-in-out infinite',
                        textShadow: '0 5px 25px rgba(251, 191, 36, 0.4)',
                        letterSpacing: '-0.02em'
                    }}>
                        Pesanan Saya
                    </h1>
                    
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        marginTop: '1rem'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '4px',
                            background: 'linear-gradient(90deg, transparent, #fbbf24)',
                            borderRadius: '2px',
                            transform: mounted ? 'scaleX(1)' : 'scaleX(0)',
                            transition: 'transform 0.8s ease-out 0.8s'
                        }} />
                        <div style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(251, 191, 36, 0.1)',
                            borderRadius: '2rem',
                            fontSize: '0.9rem',
                            color: '#fbbf24',
                            fontWeight: '600',
                            border: '1px solid rgba(251, 191, 36, 0.3)'
                        }}>
                            📦 {orders?.length || 0} Pesanan
                        </div>
                        <div style={{
                            width: '60px',
                            height: '4px',
                            background: 'linear-gradient(90deg, #fbbf24, transparent)',
                            borderRadius: '2px',
                            transform: mounted ? 'scaleX(1)' : 'scaleX(0)',
                            transition: 'transform 0.8s ease-out 0.8s'
                        }} />
                    </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {orders && orders.length > 0 ? (
                        orders.map((order, index) => {
                            const grandTotal = order.totalPrice + (order.shippingCost || 0);
                            const statusInfo = getStatusInfo(order.status);
                            const isVisible = visibleCards[index];
                            const isHovered = hoveredCard === order._id;
                            
                            return (
                                <div 
                                    key={order._id}
                                    style={{
                                        background: `linear-gradient(135deg, 
                                            rgba(31, 41, 55, ${isHovered ? '0.9' : '0.8'}), 
                                            rgba(17, 24, 39, ${isHovered ? '0.9' : '0.8'}))`,
                                        backdropFilter: 'blur(20px)',
                                        border: `2px solid ${isHovered ? 'rgba(251, 191, 36, 0.5)' : 'rgba(75, 85, 99, 0.3)'}`,
                                        borderRadius: '1.5rem',
                                        padding: 'clamp(1rem, 3vw, 2rem)',
                                        boxShadow: isHovered ? 
                                            '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(251, 191, 36, 0.2)' : 
                                            '0 15px 35px rgba(0, 0, 0, 0.3)',
                                        opacity: isVisible ? 1 : 0,
                                        transform: isVisible ? 
                                            (isHovered ? 'translateY(-10px) scale(1.02)' : 'translateY(0) scale(1)') : 
                                            'translateY(40px) scale(0.95)',
                                        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={() => setHoveredCard(order._id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    {/* Animated border effect */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '3px',
                                        background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)',
                                        borderRadius: '1.5rem 1.5rem 0 0',
                                        opacity: isHovered ? 1 : 0,
                                        transition: 'opacity 0.3s ease'
                                    }} />
                                    
                                    {/* Order Header */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: window.innerWidth < 640 ? 'column' : 'row',
                                        justifyContent: 'space-between',
                                        alignItems: window.innerWidth < 640 ? 'flex-start' : 'center',
                                        marginBottom: '2rem',
                                        paddingBottom: '1.5rem',
                                        borderBottom: '1px solid rgba(75, 85, 99, 0.5)',
                                        gap: '1rem'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.2rem',
                                                    animation: 'orderPulse 2s ease-in-out infinite'
                                                }}>
                                                    📋
                                                </div>
                                                <h2 style={{
                                                    fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                                                    fontWeight: '800',
                                                    color: '#fbbf24',
                                                    margin: 0
                                                }}>
                                                    Order #{order._id.substring(0, 8)}
                                                </h2>
                                            </div>
                                            <p style={{
                                                fontSize: '0.9rem',
                                                color: '#9ca3af',
                                                margin: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                � Dipesan pada: {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                        
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: window.innerWidth < 640 ? 'flex-start' : 'flex-end',
                                            gap: '0.75rem'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.75rem 1.25rem',
                                                borderRadius: '2rem',
                                                color: statusInfo.text,
                                                backgroundColor: statusInfo.bg,
                                                border: `2px solid ${statusInfo.border}`,
                                                fontSize: '0.9rem',
                                                fontWeight: '700',
                                                transition: 'all 0.3s ease',
                                                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                                boxShadow: isHovered ? `0 8px 25px ${statusInfo.bg}` : 'none'
                                            }}>
                                                <span style={{ fontSize: '1.2rem' }}>{statusInfo.emoji}</span>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                                        {statusInfo.title}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                                                        {order.status}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Order Body */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
                                        gap: '2rem',
                                        marginBottom: '1.5rem'
                                    }}>
                                        {/* Items List */}
                                        <div style={{
                                            background: 'rgba(55, 65, 81, 0.2)',
                                            borderRadius: '1rem',
                                            padding: '1.5rem',
                                            border: '1px solid rgba(75, 85, 99, 0.3)'
                                        }}>
                                            <h3 style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                marginBottom: '1rem',
                                                color: '#fbbf24',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                🛍️ Rincian Item
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {order.orderItems.map((item, itemIndex) => (
                                                    <div 
                                                        key={item._id || itemIndex}
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '1rem',
                                                            borderRadius: '0.75rem',
                                                            background: 'rgba(31, 41, 55, 0.4)',
                                                            border: '1px solid rgba(75, 85, 99, 0.2)',
                                                            transition: 'all 0.3s ease',
                                                            animation: `slideInLeft 0.6s ease-out ${itemIndex * 0.1}s forwards`,
                                                            opacity: 0
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateX(5px)';
                                                            e.currentTarget.style.background = 'rgba(31, 41, 55, 0.6)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateX(0)';
                                                            e.currentTarget.style.background = 'rgba(31, 41, 55, 0.4)';
                                                        }}
                                                    >
                                                        <div>
                                                            <div style={{
                                                                color: '#e5e7eb',
                                                                fontWeight: '600',
                                                                fontSize: '0.9rem'
                                                            }}>
                                                                {item.name}
                                                            </div>
                                                            <div style={{
                                                                color: '#9ca3af',
                                                                fontSize: '0.8rem',
                                                                marginTop: '0.25rem'
                                                            }}>
                                                                Qty: {item.qty} × {formatPrice(item.price)}
                                                            </div>
                                                            {/* Display Category and Weight */}
                                                            <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                                                Kategori: <span style={{ fontWeight: '500', color: '#d1d5db' }}>{item.category || 'N/A'}</span>
                                                            </div>
                                                            <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                                                Berat: <span style={{ fontWeight: '500', color: '#d1d5db' }}>{item.weight || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            color: '#fbbf24',
                                                            fontWeight: '700',
                                                            fontSize: '0.95rem',
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            {formatPrice(item.price * item.qty)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Totals Summary */}
                                        <div style={{
                                            background: 'rgba(55, 65, 81, 0.2)',
                                            borderRadius: '1rem',
                                            padding: '1.5rem',
                                            border: '1px solid rgba(75, 85, 99, 0.3)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between'
                                        }}>
                                            <h3 style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                marginBottom: '1rem',
                                                color: '#fbbf24',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                💰 Rincian Biaya
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '0.5rem 0',
                                                    borderBottom: '1px dashed rgba(156, 163, 175, 0.3)'
                                                }}>
                                                    <span style={{ color: '#d1d5db', fontSize: '0.9rem' }}>Subtotal</span>
                                                    <span style={{ color: '#9ca3af', fontFamily: 'monospace', fontWeight: '600' }}>
                                                        {formatPrice(order.totalPrice)}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '0.5rem 0',
                                                    borderBottom: '1px dashed rgba(156, 163, 175, 0.3)'
                                                }}>
                                                    <span style={{ color: '#d1d5db', fontSize: '0.9rem' }}>
                                                        🚚 Pengiriman ({order.shippingMethod})
                                                    </span>
                                                    <span style={{ 
                                                        color: order.status === 'Cancelled' && order.shippingMethod === 'Pickup' 
                                                                ? '#f87171' 
                                                                : order.shippingCost ? '#9ca3af' : '#f59e0b',
                                                        fontFamily: 'monospace',
                                                        fontWeight: '600',
                                                        fontSize: '0.85rem',
                                                        textDecoration: order.status === 'Cancelled' && order.shippingMethod === 'Pickup' ? 'line-through' : 'none'
                                                    }}>
                                                        {order.status === 'Cancelled' && order.shippingMethod === 'Pickup' 
                                                            ? 'Dibatalkan' 
                                                            : (order.shippingCost ? formatPrice(order.shippingCost) : '⏳ Menunggu')}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '1rem 0 0 0',
                                                    marginTop: '0.5rem',
                                                    borderTop: '2px solid rgba(251, 191, 36, 0.3)'
                                                }}>
                                                    <span style={{
                                                        color: '#fbbf24',
                                                        fontSize: '1.1rem',
                                                        fontWeight: '800'
                                                    }}>
                                                        💎 Grand Total
                                                    </span>
                                                    <span style={{
                                                        color: '#fbbf24',
                                                        fontSize: '1.2rem',
                                                        fontFamily: 'monospace',
                                                        fontWeight: '800',
                                                        textShadow: '0 0 10px rgba(251, 191, 36, 0.3)'
                                                    }}>
                                                        {formatPrice(grandTotal)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced Status Banners */}
                                    {order.status === 'Processing' && order.estimatedCompletionDate && (
                                        <div style={{
                                            padding: '1.5rem',
                                            borderRadius: '1rem',
                                            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(14, 165, 233, 0.1))',
                                            borderLeft: '5px solid #38bdf8',
                                            marginBottom: '1rem',
                                            animation: 'pulseGlow 3s infinite, slideInUp 0.6s ease-out',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '2px',
                                                background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                                                animation: 'shimmerLine 2s linear infinite'
                                            }} />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.5rem',
                                                    animation: 'processingPulse 2s ease-in-out infinite'
                                                }}>
                                                    👩‍🍳
                                                </div>
                                                <div>
                                                    <p style={{
                                                        fontWeight: '800',
                                                        color: '#38bdf8',
                                                        margin: 0,
                                                        fontSize: '1.1rem'
                                                    }}>
                                                        🔥 Sedang Dalam Proses!
                                                    </p>
                                                    <p style={{
                                                        fontSize: '0.9rem',
                                                        color: '#d1d5db',
                                                        margin: '0.25rem 0 0 0'
                                                    }}>
                                                        Pesanan Anda sedang disiapkan dengan teliti. Estimasi selesai pada: <strong style={{ color: '#38bdf8' }}>{formatDate(order.estimatedCompletionDate)}</strong>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {order.status === 'Cancelled' && order.cancellationReason && (
                                        <div style={{
                                            padding: '1.5rem',
                                            borderRadius: '1rem',
                                            background: 'linear-gradient(135deg, rgba(248, 113, 113, 0.1), rgba(239, 68, 68, 0.1))',
                                            borderLeft: '5px solid #f87171',
                                            marginBottom: '1rem',
                                            animation: 'slideInUp 0.6s ease-out'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #f87171, #ef4444)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.5rem'
                                                }}>
                                                    😞
                                                </div>
                                                <div>
                                                    <p style={{
                                                        fontWeight: '800',
                                                        color: '#f87171',
                                                        margin: 0,
                                                        fontSize: '1.1rem'
                                                    }}>
                                                        ❌ Pesanan Dibatalkan
                                                    </p>
                                                    <p style={{
                                                        fontSize: '0.9rem',
                                                        color: '#d1d5db',
                                                        margin: '0.25rem 0 0 0'
                                                    }}>
                                                        <strong>Alasan:</strong> {order.cancellationReason}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {order.shippingMethod === 'Pickup' && order.status === 'Ready for Pickup' && order.estimatedCompletionDate && (
                                        <div style={{
                                            padding: '1.5rem',
                                            borderRadius: '1rem',
                                            background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.1), rgba(20, 184, 166, 0.1))',
                                            borderLeft: '5px solid #2dd4bf',
                                            marginBottom: '1rem',
                                            animation: 'pulseGlow 3s infinite, slideInUp 0.6s ease-out',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '2px',
                                                background: 'linear-gradient(90deg, transparent, #2dd4bf, transparent)',
                                                animation: 'shimmerLine 2s linear infinite'
                                            }} />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.5rem',
                                                    animation: 'pickupReady 2s ease-in-out infinite'
                                                }}>
                                                    🏪
                                                </div>
                                                <div>
                                                    <p style={{
                                                        fontWeight: '800',
                                                        color: '#2dd4bf',
                                                        margin: 0,
                                                        fontSize: '1.1rem'
                                                    }}>
                                                        🎉 Siap Diambil!
                                                    </p>
                                                    <p style={{
                                                        fontSize: '0.9rem',
                                                        color: '#d1d5db',
                                                        margin: '0.25rem 0 0 0'
                                                    }}>
                                                        Pesanan siap diambil pada atau setelah <strong style={{ color: '#2dd4bf' }}>{formatDate(order.estimatedCompletionDate)}</strong>. 
                                                        <a 
                                                            href="https://maps.app.goo.gl/96GfTxSETvJzNx457" 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                color: '#2dd4bf',
                                                                fontWeight: '700',
                                                                textDecoration: 'underline',
                                                                marginLeft: '0.5rem',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.color = '#14b8a6';
                                                                e.target.style.textShadow = '0 0 8px rgba(45, 212, 191, 0.6)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.color = '#2dd4bf';
                                                                e.target.style.textShadow = 'none';
                                                            }}
                                                        >
                                                            📍 Lihat Lokasi
                                                        </a>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {order.status === 'Awaiting Shipping Payment' && (
                                        <div style={{
                                            padding: '1.5rem',
                                            borderRadius: '1rem',
                                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))',
                                            borderLeft: '5px solid #fbbf24',
                                            marginBottom: '1rem',
                                            animation: 'pulseGlow 3s infinite, slideInUp 0.6s ease-out',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '2px',
                                                background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)',
                                                animation: 'shimmerLine 2s linear infinite'
                                            }} />
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                                                <div style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.5rem',
                                                    animation: 'paymentPending 2s ease-in-out infinite',
                                                    flexShrink: 0
                                                }}>
                                                    ⏳
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{
                                                        fontWeight: '800',
                                                        color: '#fbbf24',
                                                        margin: 0,
                                                        fontSize: '1.1rem'
                                                    }}>
                                                        💳 Pembayaran Diperlukan
                                                    </p>
                                                    <p style={{
                                                        fontSize: '0.9rem',
                                                        color: '#d1d5db',
                                                        margin: '0.25rem 0 1rem 0'
                                                    }}>
                                                        Silakan bayar ongkos kirim sebesar <strong style={{ 
                                                            color: '#fbbf24',
                                                            fontSize: '1.05rem',
                                                            fontFamily: 'monospace'
                                                        }}>{formatPrice(order.shippingCost)}</strong> dan unggah bukti pembayaran.
                                                    </p>
                                                    
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: window.innerWidth < 640 ? 'column' : 'row',
                                                        gap: '1rem',
                                                        alignItems: window.innerWidth < 640 ? 'stretch' : 'center'
                                                    }}>
                                                        <div style={{
                                                            flex: 1,
                                                            position: 'relative'
                                                        }}>
                                                            <input 
                                                                type="file" 
                                                                onChange={(e) => setShippingProofFile(e.target.files[0])}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '0.75rem',
                                                                    borderRadius: '0.75rem',
                                                                    border: '2px dashed rgba(251, 191, 36, 0.5)',
                                                                    background: 'rgba(31, 41, 55, 0.5)',
                                                                    color: '#d1d5db',
                                                                    fontSize: '0.9rem',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                                onFocus={(e) => {
                                                                    e.target.style.borderColor = '#fbbf24';
                                                                    e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
                                                                }}
                                                                onBlur={(e) => {
                                                                    e.target.style.borderColor = 'rgba(251, 191, 36, 0.5)';
                                                                    e.target.style.boxShadow = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                        
                                                        <button 
                                                            onClick={() => handleUploadShippingProof(order._id)} 
                                                            disabled={uploadingOrderId === order._id}
                                                            style={{
                                                                padding: '0.75rem 1.5rem',
                                                                borderRadius: '0.75rem',
                                                                border: 'none',
                                                                background: uploadingOrderId === order._id ? 
                                                                    'linear-gradient(135deg, #6b7280, #4b5563)' :
                                                                    'linear-gradient(135deg, #22c55e, #16a34a)',
                                                                color: 'white',
                                                                fontSize: '0.9rem',
                                                                fontWeight: '700',
                                                                cursor: uploadingOrderId === order._id ? 'not-allowed' : 'pointer',
                                                                transition: 'all 0.3s ease',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '0.5rem',
                                                                minWidth: '140px',
                                                                boxShadow: uploadingOrderId !== order._id ? '0 4px 15px rgba(34, 197, 94, 0.3)' : 'none'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (uploadingOrderId !== order._id) {
                                                                    e.target.style.transform = 'translateY(-2px)';
                                                                    e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.4)';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (uploadingOrderId !== order._id) {
                                                                    e.target.style.transform = 'translateY(0)';
                                                                    e.target.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.3)';
                                                                }
                                                            }}
                                                        >
                                                            {uploadingOrderId === order._id ? (
                                                                <>
                                                                    <div style={{
                                                                        width: '18px',
                                                                        height: '18px',
                                                                        border: '2px solid rgba(255,255,255,0.3)',
                                                                        borderTop: '2px solid white',
                                                                        borderRadius: '50%',
                                                                        animation: 'spin 1s linear infinite'
                                                                    }}></div>
                                                                    <span>Mengunggah...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span>📤</span>
                                                                    <span>Unggah Bukti</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Shipping Info */}
                                    {order.shippingId && (
                                        <div style={{
                                            padding: '1.5rem',
                                            borderRadius: '1rem',
                                            background: 'rgba(55, 65, 81, 0.3)',
                                            border: '1px solid rgba(75, 85, 99, 0.5)',
                                            animation: 'slideInUp 0.6s ease-out'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.5rem'
                                                }}>
                                                    🚚
                                                </div>
                                                <div>
                                                    <p style={{
                                                        fontWeight: '800',
                                                        color: '#8b5cf6',
                                                        margin: 0,
                                                        fontSize: '1.1rem'
                                                    }}>
                                                        📦 Info Pengiriman
                                                    </p>
                                                    <p style={{
                                                        fontSize: '0.9rem',
                                                        color: '#d1d5db',
                                                        margin: '0.25rem 0 0 0'
                                                    }}>
                                                        <strong>Provider:</strong> {order.shippingProvider} | 
                                                        <strong> No. Resi:</strong> <span style={{
                                                            fontFamily: 'monospace',
                                                            background: 'rgba(139, 92, 246, 0.2)',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '0.25rem',
                                                            marginLeft: '0.5rem'
                                                        }}>{order.shippingId}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: 'clamp(2rem, 8vw, 4rem)',
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
                            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s',
                            background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.8))',
                            borderRadius: '2rem',
                            border: '2px dashed rgba(75, 85, 99, 0.4)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                        }}>
                            <div style={{
                                fontSize: '5rem',
                                marginBottom: '1.5rem',
                                opacity: '0.4',
                                animation: 'float 3s ease-in-out infinite'
                            }}>
                                📦
                            </div>
                            <h2 style={{
                                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                                fontWeight: '800',
                                color: '#9ca3af',
                                marginBottom: '1rem'
                            }}>
                                Belum Ada Pesanan
                            </h2>
                            <p style={{
                                fontSize: '1.1rem',
                                color: '#6b7280',
                                marginBottom: '2rem',
                                maxWidth: '400px',
                                margin: '0 auto 2rem auto',
                                lineHeight: 1.6
                            }}>
                                Anda belum memiliki pesanan. Mulai jelajahi produk kami dan buat pesanan pertama Anda!
                            </p>
                            <Link 
                                to="/products"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '1rem 2rem',
                                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))',
                                    border: '2px solid #fbbf24',
                                    borderRadius: '3rem',
                                    textDecoration: 'none',
                                    fontWeight: '700',
                                    fontSize: '1.1rem',
                                    color: '#fbbf24',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.25))';
                                    e.target.style.transform = 'translateY(-3px) scale(1.05)';
                                    e.target.style.boxShadow = '0 15px 35px rgba(251, 191, 36, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))';
                                    e.target.style.transform = 'translateY(0) scale(1)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                <span style={{ fontSize: '1.3rem' }}>🛍️</span>
                                <span>Mulai Belanja Sekarang</span>
                                <span style={{ fontSize: '1.2rem' }}>✨</span>
                            </Link>
                        </div>
                    )}
                </div>
                
                <style>{`
                    @keyframes spinGradient {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                    
                    @keyframes textGlow {
                        0% { text-shadow: 0 0 10px rgba(251, 191, 36, 0.5); }
                        100% { text-shadow: 0 0 20px rgba(251, 191, 36, 0.8), 0 0 30px rgba(251, 191, 36, 0.6); }
                    }
                    
                    @keyframes fadeInOut {
                        0%, 100% { opacity: 0.6; }
                        50% { opacity: 1; }
                    }
                    
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-8px); }
                        75% { transform: translateX(8px); }
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; transform: scale(0.9); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    
                    @keyframes bounce {
                        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                        40% { transform: translateY(-10px); }
                        60% { transform: translateY(-5px); }
                    }
                    
                    @keyframes textShimmer {
                        0% { background-position: 300% center; }
                        100% { background-position: -300% center; }
                    }
                    
                    @keyframes titleBounce {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-8px); }
                    }
                    
                    @keyframes orderPulse {
                        0%, 100% { 
                            transform: scale(1); 
                            box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); 
                        }
                        50% { 
                            transform: scale(1.05); 
                            box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); 
                        }
                    }
                    
                    @keyframes slideInLeft {
                        from { opacity: 0; transform: translateX(-30px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    
                    @keyframes slideInUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    
                    @keyframes pulseGlow {
                        0%, 100% { 
                            box-shadow: 0 0 15px -5px currentColor; 
                        }
                        50% { 
                            box-shadow: 0 0 25px 0px currentColor; 
                        }
                    }
                    
                    @keyframes shimmerLine {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(200%); }
                    }
                    
                    @keyframes processingPulse {
                        0%, 100% { 
                            transform: scale(1); 
                            box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7); 
                        }
                        50% { 
                            transform: scale(1.1); 
                            box-shadow: 0 0 0 15px rgba(56, 189, 248, 0); 
                        }
                    }
                    
                    @keyframes pickupReady {
                        0%, 100% { 
                            transform: scale(1) rotate(0deg); 
                            box-shadow: 0 0 0 0 rgba(45, 212, 191, 0.7); 
                        }
                        50% { 
                            transform: scale(1.1) rotate(5deg); 
                            box-shadow: 0 0 0 15px rgba(45, 212, 191, 0); 
                        }
                    }
                    
                    @keyframes paymentPending {
                        0%, 100% { 
                            transform: scale(1); 
                            box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); 
                        }
                        50% { 
                            transform: scale(1.08); 
                            box-shadow: 0 0 0 12px rgba(251, 191, 36, 0); 
                        }
                    }
                    
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-15px); }
                    }

                    /* Custom scrollbar */
                    ::-webkit-scrollbar {
                        width: 8px;
                    }

                    ::-webkit-scrollbar-track {
                        background: rgba(17, 24, 39, 0.3);
                        border-radius: 4px;
                    }

                    ::-webkit-scrollbar-thumb {
                        background: linear-gradient(180deg, rgba(251, 191, 36, 0.6), rgba(245, 158, 11, 0.6));
                        border-radius: 4px;
                    }

                    ::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(180deg, rgba(251, 191, 36, 0.8), rgba(245, 158, 11, 0.8));
                    }

                    /* Mobile optimizations */
                    @media (max-width: 768px) {
                        .order-item {
                            padding: 0.75rem;
                        }
                        
                        .status-badge {
                            font-size: 0.8rem;
                            padding: 0.5rem 1rem;
                        }
                    }

                    /* Smooth scrolling */
                    html {
                        scroll-behavior: smooth;
                    }
                `}</style>
            </main>
        </>
    );
};

export default MyOrdersPage;
