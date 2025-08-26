import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

const OrderPage = ({ userInfo, showNotification }) => {
    const { cartItems, updateQty, removeFromCart, clearCart } = useCart();
    const API_URL = `${process.env.SERVER_URL}`;
    const { data: paymentInfo } = useFetch(`${API_URL}/api/payment-info`);
    const [proofFile, setProofFile] = useState(null);
    const [shippingMethod, setShippingMethod] = useState('Delivery');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    const navigate = useNavigate();

    const isProfileComplete = userInfo && userInfo.address && userInfo.phoneNumber;
    const totalPrice = cartItems.reduce((a, c) => a + c.price * c.qty, 0);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    };

    const handleCheckout = async () => {
        if (shippingMethod === 'Delivery' && !isProfileComplete) {
            showNotification('Please complete your profile for delivery.', 'error');
            return;
        }
        if (!proofFile) {
            showNotification('Please upload your payment proof.', 'error');
            return;
        }
        setIsSubmitting(true);

        try {
            // Step 1: Upload the payment proof image
            const formData = new FormData();
            formData.append('paymentProof', proofFile);
            
            const uploadResponse = await fetch(`${API_URL}/api/orders/upload/payment-proof`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: formData,
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.message || 'Failed to upload payment proof.');
            }
            const uploadResult = await uploadResponse.json();
            const paymentProofUrl = uploadResult.url;

            // Step 2: Create the order with the returned URL
            const orderData = {
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    price: item.price,
                    product: item._id,
                    weight: item.weight,
                    // Note: Assumes the category name is available on the cart item.
                    // This handles if item.category is an object ({name: '...'}) or a string.
                    category: item.category?.name || item.category,
                })),
                totalPrice,
                shippingMethod,
                paymentProofUrl,
            };
            
            const orderResponse = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify(orderData),
            });

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json();
                throw new Error(errorData.message || 'Failed to create order.');
            }
            
            showNotification('Order placed successfully! Your payment will be verified.');
            clearCart();
            navigate('/my-orders');

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main 
            className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-white"
            style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.6s ease-out'
            }}
        >
            <div 
                style={{
                    textAlign: 'center',
                    marginBottom: '2rem',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(-30px)',
                    transition: 'all 0.8s ease-out 0.2s'
                }}
            >
                <h1 
                    className="text-4xl font-heading font-bold"
                    style={{
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: '0.5rem'
                    }}
                >
                    Keranjang Belanja Anda
                </h1>
                <div 
                    style={{
                        width: '100px',
                        height: '4px',
                        background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                        margin: '0 auto',
                        borderRadius: '2px',
                        transform: mounted ? 'scaleX(1)' : 'scaleX(0)',
                        transition: 'transform 0.8s ease-out 0.5s'
                    }}
                />
            </div>

            {cartItems.length === 0 ? (
                <div 
                    className="text-center text-gray-400"
                    style={{
                        padding: '4rem 2rem',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'scale(1)' : 'scale(0.9)',
                        transition: 'all 0.6s ease-out 0.4s'
                    }}
                >
                    <div 
                        style={{
                            fontSize: '4rem',
                            marginBottom: '1rem',
                            opacity: '0.3'
                        }}
                    >
                        🛒
                    </div>
                    <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Keranjang Anda kosong.</p>
                    <Link 
                        to="/products" 
                        className="text-amber-400 hover:underline inline-block"
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))',
                            border: '2px solid #fbbf24',
                            borderRadius: '25px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            display: 'inline-block'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 25px rgba(251, 191, 36, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        Mulai Belanja
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items Section */}
                    <div 
                        className="lg:col-span-2"
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateX(0)' : 'translateX(-50px)',
                            transition: 'all 0.8s ease-out 0.3s'
                        }}
                    >
                        <div 
                            className="bg-gray-800 p-6 rounded-lg"
                            style={{
                                background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95))',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(75, 85, 99, 0.3)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                borderRadius: '16px'
                            }}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 
                                    className="text-2xl font-bold"
                                    style={{
                                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}
                                >
                                    Item di Keranjang
                                </h2>
                                <Link 
                                    to="/products" 
                                    className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        background: 'rgba(251, 191, 36, 0.1)',
                                        border: '1px solid rgba(251, 191, 36, 0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(251, 191, 36, 0.2)';
                                        e.target.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(251, 191, 36, 0.1)';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <i className="fas fa-plus mr-2"></i>Tambah Item
                                </Link>
                            </div>
                            
                            {cartItems.map((item, index) => (
                                <div 
                                    key={item._id} 
                                    className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-700 py-4 gap-4"
                                    style={{
                                        opacity: mounted ? 1 : 0,
                                        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                                        transition: `all 0.6s ease-out ${0.1 * index + 0.5}s`,
                                        background: 'rgba(55, 65, 81, 0.3)',
                                        borderRadius: '12px',
                                        margin: '8px 0',
                                        padding: '16px',
                                        border: '1px solid rgba(75, 85, 99, 0.2)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(55, 65, 81, 0.5)';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(55, 65, 81, 0.3)';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div 
                                            style={{
                                                position: 'relative',
                                                overflow: 'hidden',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            <img 
                                                src={item.imageUrl || 'https://placehold.co/80x80/1f2937/4b5563?text=KopiLS'} 
                                                alt={item.name} 
                                                className="w-20 h-20 object-cover rounded"
                                                style={{
                                                    transition: 'transform 0.3s ease',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-bold" style={{ marginBottom: '4px' }}>{item.name}</p>
                                            <p 
                                                className="text-sm text-gray-400"
                                                style={{
                                                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    backgroundClip: 'text',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {formatPrice(item.price)}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Kategori: {item.category?.name || item.category || 'N/A'}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Berat: {item.weight || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="number" 
                                            value={item.qty} 
                                            onChange={(e) => updateQty(item._id, Number(e.target.value))}
                                            className="w-16 p-2 bg-gray-900 rounded border border-gray-600 text-center"
                                            min="1"
                                            max={item.stock}
                                            style={{
                                                borderRadius: '8px',
                                                border: '2px solid rgba(75, 85, 99, 0.5)',
                                                background: 'rgba(17, 24, 39, 0.8)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#fbbf24';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                        <button 
                                            onClick={() => removeFromCart(item._id)} 
                                            className="text-red-500 hover:text-red-400"
                                            style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                                                e.target.style.transform = 'scale(1.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                                                e.target.style.transform = 'scale(1)';
                                            }}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary Section */}
                    <div 
                        className="lg:col-span-1"
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateX(0)' : 'translateX(50px)',
                            transition: 'all 0.8s ease-out 0.4s'
                        }}
                    >
                        <div 
                            className="bg-gray-800 p-6 rounded-lg self-start sticky top-4"
                            style={{
                                background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95))',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(75, 85, 99, 0.3)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                borderRadius: '16px'
                            }}
                        >
                            <h2 
                                className="text-2xl font-bold border-b border-gray-700 pb-4 mb-4"
                                style={{
                                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    borderImage: 'linear-gradient(90deg, #fbbf24, #f59e0b) 1'
                                }}
                            >
                                Ringkasan Pesanan
                            </h2>
                            
                            <div 
                                className="flex justify-between mb-6"
                                style={{
                                    padding: '16px',
                                    background: 'rgba(251, 191, 36, 0.1)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(251, 191, 36, 0.2)'
                                }}
                            >
                                <span className="text-lg">Subtotal</span>
                                <span 
                                    className="text-lg font-bold"
                                    style={{
                                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}
                                >
                                    {formatPrice(totalPrice)}
                                </span>
                            </div>
                            
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">Metode Pengiriman</h3>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setShippingMethod('Delivery')} 
                                        className="flex-1 p-3 rounded-lg border-2 transition-all duration-300"
                                        style={{
                                            background: shippingMethod === 'Delivery' 
                                                ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))' 
                                                : 'rgba(55, 65, 81, 0.5)',
                                            borderColor: shippingMethod === 'Delivery' ? '#fbbf24' : 'rgba(75, 85, 99, 0.5)',
                                            transform: shippingMethod === 'Delivery' ? 'translateY(-2px)' : 'translateY(0)',
                                            boxShadow: shippingMethod === 'Delivery' ? '0 4px 15px rgba(251, 191, 36, 0.3)' : 'none'
                                        }}
                                    >
                                        📦 Pengiriman
                                    </button>
                                    <button 
                                        onClick={() => setShippingMethod('Pickup')} 
                                        className="flex-1 p-3 rounded-lg border-2 transition-all duration-300"
                                        style={{
                                            background: shippingMethod === 'Pickup' 
                                                ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))' 
                                                : 'rgba(55, 65, 81, 0.5)',
                                            borderColor: shippingMethod === 'Pickup' ? '#fbbf24' : 'rgba(75, 85, 99, 0.5)',
                                            transform: shippingMethod === 'Pickup' ? 'translateY(-2px)' : 'translateY(0)',
                                            boxShadow: shippingMethod === 'Pickup' ? '0 4px 15px rgba(251, 191, 36, 0.3)' : 'none'
                                        }}
                                    >
                                        🏪 Ambil Sendiri
                                    </button>
                                </div>
                            </div>

                            {shippingMethod === 'Delivery' && (
                                <div 
                                    className="bg-gray-700 p-4 rounded-lg mb-4"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.8), rgba(31, 41, 55, 0.8))',
                                        border: '1px solid rgba(251, 191, 36, 0.2)',
                                        borderRadius: '12px',
                                        animation: 'slideIn 0.5s ease-out'
                                    }}
                                >
                                    <h3 className="font-bold text-lg mb-3" style={{ color: '#fbbf24' }}>
                                        📋 Detail Pengiriman
                                    </h3>
                                    <div style={{ lineHeight: '1.8' }}>
                                        <p className="text-sm text-gray-300">
                                            <strong className="text-amber-400">Nama:</strong> {userInfo.name}
                                        </p>
                                        <p className="text-sm text-gray-300">
                                            <strong className="text-amber-400">Alamat:</strong> {userInfo.address || 'Belum diatur'}
                                        </p>
                                        <p className="text-sm text-gray-300">
                                            <strong className="text-amber-400">Nomor Telepon:</strong> {userInfo.phoneNumber || 'Belum diatur'}
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            {shippingMethod === 'Delivery' && (!isProfileComplete) && (
                                <div 
                                    className="p-4 rounded-lg mb-4"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
                                        border: '2px solid rgba(239, 68, 68, 0.4)',
                                        borderLeft: '4px solid #ef4444',
                                        borderRadius: '12px',
                                        animation: 'pulse 2s infinite'
                                    }}
                                >
                                    <p className="font-bold text-red-300">⚠️ Profil Belum Lengkap</p>
                                    <p className="text-sm text-red-200">
                                        Silakan tambahkan alamat dan nomor telepon Anda di{' '}
                                        <Link 
                                            to="/profile" 
                                            className="font-bold underline text-red-100 hover:text-white"
                                            style={{ transition: 'color 0.3s ease' }}
                                        >
                                            profil
                                        </Link>
                                        {' '}Anda untuk pengiriman.
                                    </p>
                                </div>
                            )}

                            {/* Important Notice */}
                            <div 
                                className="p-4 rounded-lg mb-4"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))',
                                    border: '2px solid rgba(251, 191, 36, 0.3)',
                                    borderLeft: '4px solid #fbbf24',
                                    borderRadius: '12px'
                                }}
                            >
                                <p className="font-bold text-amber-300">💡 Penting!</p>
                                <p className="text-sm text-amber-100" style={{ lineHeight: '1.6' }}>
                                    Sebelum checkout, mohon pastikan nama, alamat, dan nomor telepon Anda sudah benar. Jika tidak, perbarui di halaman profil. Harap chat dengan Anie untuk memastikan ketersediaan produk.
                                    <br /><br />
                                    Untuk pengiriman, pastikan alamat Anda sudah mencantumkan <b>kecamatan, kabupaten, dan kode pos</b> agar pesanan Anda dapat diproses dengan cepat dan akurat.
                                </p>
                            </div>
                            
                            {shippingMethod === 'Delivery' && (
                                <div 
                                    className="p-4 rounded-lg mb-4"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))',
                                        border: '2px solid rgba(239, 68, 68, 0.3)',
                                        borderLeft: '4px solid #ef4444',
                                        borderRadius: '12px'
                                    }}
                                >
                                    <p className="font-bold text-red-300">🚚 Pemberitahuan Biaya Pengiriman</p>
                                    <p className="text-sm text-red-200">
                                        Biaya pengiriman akan dibebankan secara terpisah setelah pesanan Anda diverifikasi oleh admin.
                                    </p>
                                </div>
                            )}
                            
                            {/* Payment Details */}
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))',
                                        border: '2px solid rgba(251, 191, 36, 0.4)',
                                        borderRadius: '12px',
                                        color: '#fbbf24',
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem',
                                        transition: 'all 0.3s ease',
                                        marginBottom: '1rem'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3))';
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    💳 {showPaymentDetails ? 'Sembunyikan' : 'Lihat'} Detail Pembayaran
                                    <i className={`fas fa-chevron-${showPaymentDetails ? 'up' : 'down'} ml-2`}></i>
                                </button>
                                
                                <div
                                    style={{
                                        maxHeight: showPaymentDetails ? '1000px' : '0',
                                        overflow: 'hidden',
                                        transition: 'all 0.5s ease-out',
                                        opacity: showPaymentDetails ? 1 : 0
                                    }}
                                >
                                    {paymentInfo?.qrisImageUrl && (
                                        <div 
                                            className="mb-4 text-center"
                                            style={{
                                                padding: '16px',
                                                background: 'rgba(55, 65, 81, 0.3)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(75, 85, 99, 0.3)'
                                            }}
                                        >
                                            <p className="font-semibold mb-3" style={{ color: '#fbbf24' }}>📱 Bayar dengan QRIS:</p>
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                <img 
                                                    src={paymentInfo.qrisImageUrl} 
                                                    alt="QRIS Code" 
                                                    className="w-96 h-100 rounded"
                                                    style={{
                                                        border: '3px solid rgba(251, 191, 36, 0.3)',
                                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.transform = 'scale(1.05)';
                                                        e.target.style.boxShadow = '0 8px 25px rgba(251, 191, 36, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.transform = 'scale(1)';
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {paymentInfo?.bankName && (
                                        <div 
                                            style={{
                                                padding: '16px',
                                                background: 'rgba(55, 65, 81, 0.3)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(75, 85, 99, 0.3)',
                                                marginTop: '12px'
                                            }}
                                        >
                                            <p className="font-semibold mb-2" style={{ color: '#fbbf24' }}>🏦 Atau Transfer Bank:</p>
                                            <div 
                                                style={{
                                                    background: 'rgba(17, 24, 39, 0.5)',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(251, 191, 36, 0.2)'
                                                }}
                                            >
                                                <p className="text-sm font-mono">
                                                    <strong>{paymentInfo.bankName}:</strong><br />
                                                    <span style={{ fontSize: '1.1rem', color: '#fbbf24' }}>{paymentInfo.accountNumber}</span><br />
                                                    <em>a/n {paymentInfo.accountName}</em>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upload Payment Proof */}
                            <div className="mt-6">
                                <label 
                                    className="block text-sm font-medium mb-3"
                                    style={{ color: '#fbbf24' }}
                                >
                                    📎 Unggah Bukti Pembayaran
                                </label>
                                <div 
                                    style={{
                                        position: 'relative',
                                        border: '2px dashed rgba(251, 191, 36, 0.4)',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        textAlign: 'center',
                                        background: proofFile ? 'rgba(34, 197, 94, 0.1)' : 'rgba(55, 65, 81, 0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.target.style.background = 'rgba(251, 191, 36, 0.1)';
                                        e.target.style.borderColor = '#fbbf24';
                                    }}
                                    onDragLeave={(e) => {
                                        e.target.style.background = proofFile ? 'rgba(34, 197, 94, 0.1)' : 'rgba(55, 65, 81, 0.3)';
                                        e.target.style.borderColor = 'rgba(251, 191, 36, 0.4)';
                                    }}
                                >
                                    <input 
                                        type="file" 
                                        onChange={(e) => setProofFile(e.target.files[0])} 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept="image/*"
                                    />
                                    <div>
                                        {proofFile ? (
                                            <div>
                                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
                                                <p className="text-green-400 font-semibold">{proofFile.name}</p>
                                                <p className="text-sm text-green-300">File berhasil dipilih!</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <div style={{ fontSize: '2rem', marginBottom: '8px', opacity: '0.5' }}>📁</div>
                                                <p className="text-gray-300">Klik atau seret file bukti pembayaran ke sini</p>
                                                <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG, atau JPEG</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button 
                                onClick={handleCheckout} 
                                disabled={isSubmitting || (shippingMethod === 'Delivery' && !isProfileComplete) || !proofFile} 
                                className="w-full p-4 rounded-lg mt-6 font-bold transition-all duration-300"
                                style={{
                                    background: isSubmitting || (shippingMethod === 'Delivery' && !isProfileComplete) || !proofFile
                                        ? 'rgba(75, 85, 99, 0.5)'
                                        : 'linear-gradient(135deg, #f59e0b, #d97706, #b45309)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1.1rem',
                                    cursor: isSubmitting || (shippingMethod === 'Delivery' && !isProfileComplete) || !proofFile ? 'not-allowed' : 'pointer',
                                    boxShadow: isSubmitting || (shippingMethod === 'Delivery' && !isProfileComplete) || !proofFile 
                                        ? 'none' 
                                        : '0 4px 20px rgba(245, 158, 11, 0.4)',
                                    transform: isSubmitting ? 'scale(0.98)' : 'scale(1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    if (!e.target.disabled) {
                                        e.target.style.background = 'linear-gradient(135deg, #d97706, #b45309, #92400e)';
                                        e.target.style.transform = 'translateY(-2px) scale(1.02)';
                                        e.target.style.boxShadow = '0 8px 30px rgba(245, 158, 11, 0.6)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!e.target.disabled) {
                                        e.target.style.background = 'linear-gradient(135deg, #f59e0b, #d97706, #b45309)';
                                        e.target.style.transform = 'translateY(0) scale(1)';
                                        e.target.style.boxShadow = '0 4px 20px rgba(245, 158, 11, 0.4)';
                                    }
                                }}
                            >
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    {isSubmitting ? (
                                        <span>
                                            <div 
                                                style={{
                                                    display: 'inline-block',
                                                    width: '20px',
                                                    height: '20px',
                                                    border: '2px solid rgba(255,255,255,0.3)',
                                                    borderTop: '2px solid white',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite',
                                                    marginRight: '8px'
                                                }}
                                            ></div>
                                            Memproses Pesanan...
                                        </span>
                                    ) : (
                                        <span>
                                            🚀 Buat Pesanan
                                        </span>
                                    )}
                                </div>
                                {!isSubmitting && !(shippingMethod === 'Delivery' && !isProfileComplete) && proofFile && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '-100%',
                                            width: '100%',
                                            height: '100%',
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                            transform: 'translateY(-50%)',
                                            animation: 'shimmer 2s infinite'
                                        }}
                                    ></div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes shimmer {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }

                @media (max-width: 640px) {
                    .grid {
                        gap: 1rem;
                    }
                    
                    .sticky {
                        position: relative !important;
                        top: auto !important;
                    }
                }

                /* Smooth scrollbar for mobile */
                * {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(251, 191, 36, 0.3) rgba(17, 24, 39, 0.3);
                }
                
                *::-webkit-scrollbar {
                    width: 6px;
                }
                
                *::-webkit-scrollbar-track {
                    background: rgba(17, 24, 39, 0.3);
                    border-radius: 3px;
                }
                
                *::-webkit-scrollbar-thumb {
                    background: rgba(251, 191, 36, 0.3);
                    border-radius: 3px;
                }
                
                *::-webkit-scrollbar-thumb:hover {
                    background: rgba(251, 191, 36, 0.5);
                }

                /* Touch improvements for mobile */
                @media (max-width: 768px) {
                    input, button {
                        font-size: 16px !important; /* Prevents zoom on iOS */
                    }
                    
                    .grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .sticky {
                        position: static !important;
                        margin-top: 1rem;
                    }
                }
            `}</style>
        </main>
    );
};

export default OrderPage;
