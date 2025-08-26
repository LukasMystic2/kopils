import React, { useState } from 'react';
import useFetch from '../hooks/useFetch';

const OrderManager = ({ order, token, showNotification, onUpdate }) => {
    const [status, setStatus] = useState(order.status);
    const [shippingCost, setShippingCost] = useState(order.shippingCost || 0);
    const [shippingProvider, setShippingProvider] = useState(order.shippingProvider || '');
    const [shippingId, setShippingId] = useState(order.shippingId || '');
    const [cancellationReason, setCancellationReason] = useState(order.cancellationReason || '');
    const [estimatedCompletionDate, setEstimatedCompletionDate] = useState(order.estimatedCompletionDate ? new Date(order.estimatedCompletionDate).toISOString().split('T')[0] : '');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    
    const API_URL = `${process.env.SERVER_URL}`;

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            const response = await fetch(`${API_URL}/api/orders/${order._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, shippingCost, shippingProvider, shippingId, cancellationReason, estimatedCompletionDate }),
            });
            if (!response.ok) throw new Error('Failed to update order');
            onUpdate();
            showNotification('✅ Order updated successfully!');
        } catch (err) {
            showNotification(`❌ ${err.message}`, 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemoveProof = async (proofType) => {
        if (window.confirm(`🗑️ Are you sure you want to remove this ${proofType.replace('Proof', '')} proof?`)) {
            try {
                const response = await fetch(`${API_URL}/api/orders/${order._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ [proofType]: null }),
                });
                if (!response.ok) throw new Error('Failed to remove proof');
                onUpdate();
                showNotification('🗑️ Proof removed successfully!');
            } catch (err) {
                showNotification(`❌ ${err.message}`, 'error');
            }
        }
    };

    const handleDeleteOrder = async () => {
        if (window.confirm('⚠️ Are you sure you want to permanently delete this order? This cannot be undone.')) {
            try {
                const response = await fetch(`${API_URL}/api/orders/${order._id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to delete order');
                onUpdate();
                showNotification('🗑️ Order deleted successfully!');
            } catch (err) {
                showNotification(`❌ ${err.message}`, 'error');
            }
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const deliveryStatuses = ['Pending Payment', 'Awaiting Shipping Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const pickupStatuses = ['Pending Payment', 'Processing', 'Ready for Pickup', 'Received', 'Cancelled'];

    const getStatusColor = (status) => {
        const colors = {
            'Pending Payment': 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
            'Awaiting Shipping Payment': 'bg-orange-500/20 text-orange-300 border-orange-400/30',
            'Processing': 'bg-blue-500/20 text-blue-300 border-blue-400/30',
            'Shipped': 'bg-purple-500/20 text-purple-300 border-purple-400/30',
            'Delivered': 'bg-green-500/20 text-green-300 border-green-400/30',
            'Ready for Pickup': 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
            'Received': 'bg-green-500/20 text-green-300 border-green-400/30',
            'Cancelled': 'bg-red-500/20 text-red-300 border-red-400/30'
        };
        return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    };

    const getStatusEmoji = (status) => {
        const emojis = {
            'Pending Payment': '💰',
            'Awaiting Shipping Payment': '🚚💰',
            'Processing': '⚙️',
            'Shipped': '📦',
            'Delivered': '✅',
            'Ready for Pickup': '📋',
            'Received': '✅',
            'Cancelled': '❌'
        };
        return emojis[status] || '📋';
    };

    const cardStyle = {
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(156, 163, 175, 0.2)',
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isExpanded 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.3)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
    };

    const buttonStyle = {
        transition: 'all 0.2s ease',
        transform: 'translateY(0)',
    };

    const hoverButtonStyle = {
        transform: 'translateY(-2px)',
    };

    return (
        <div 
            style={cardStyle}
            className="p-6 space-y-6 hover:shadow-2xl"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = isExpanded ? 'scale(1.02)' : 'scale(1)'}
        >
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-amber-400 text-xl">
                            📋 Order #{order._id.substring(0,8)}
                        </h3>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                            {getStatusEmoji(status)} {status}
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                        📅 {formatDate(order.createdAt)}
                    </p>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                        {order.shippingMethod === 'Delivery' ? '🚚' : '🏪'} {order.shippingMethod}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={buttonStyle}
                        className="bg-blue-600/80 text-white py-2 px-4 rounded-lg hover:bg-blue-500 text-sm font-medium backdrop-blur-sm border border-blue-500/30"
                        onMouseEnter={(e) => Object.assign(e.target.style, hoverButtonStyle)}
                        onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
                    >
                        {isExpanded ? '📖 Less' : '📝 Details'}
                    </button>
                    <button 
                        onClick={handleDeleteOrder}
                        style={buttonStyle}
                        className="bg-red-600/80 text-white py-2 px-4 rounded-lg hover:bg-red-500 text-sm font-medium backdrop-blur-sm border border-red-500/30"
                        onMouseEnter={(e) => Object.assign(e.target.style, hoverButtonStyle)}
                        onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>

            {/* Expandable Content */}
            <div 
                style={{
                    maxHeight: isExpanded ? '2000px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.5s ease-in-out, opacity 0.3s ease',
                    opacity: isExpanded ? 1 : 0
                }}
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-b border-gray-700/50 py-6">
                    {/* Customer Details */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                            👤 Customer Details
                        </h4>
                        <div className="space-y-2 bg-gray-900/50 p-4 rounded-lg border border-gray-700/30">
                            <p className="text-sm text-gray-300 font-medium">{order.user.name}</p>
                            <p className="text-sm text-gray-400 flex items-center gap-2">📧 {order.user.email}</p>
                            <p className="text-sm text-gray-400 flex items-center gap-2">📱 {order.user.phoneNumber || 'No phone number'}</p>
                            <p className="text-sm text-gray-400 mt-3 flex items-start gap-2">
                                🏠 <span>{order.user.address || 'N/A'}</span>
                            </p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                            🛒 Order Items
                        </h4>
                        <div className="space-y-2 bg-gray-900/50 p-4 rounded-lg border border-gray-700/30">
                            {order.orderItems.map((item, index) => (
                                <div key={item._id || index} className="p-2 bg-gray-800/50 rounded">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-300 font-semibold">📦 {item.name}</p>
                                        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                                            {item.qty}x
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 pl-1">
                                        <p>Kategori: <span className="font-medium text-gray-300">{item.category || 'N/A'}</span></p>
                                        <p>Berat: <span className="font-medium text-gray-300">{item.weight || 'N/A'}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Proofs */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                            💳 Payment Proofs
                        </h4>
                        <div className="space-y-3 bg-gray-900/50 p-4 rounded-lg border border-gray-700/30">
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Item Payment</p>
                                {order.paymentProof ? (
                                    <div className="flex items-center justify-between gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded">
                                        <span className="text-sm text-green-300">✅ Uploaded</span>
                                        <div className="flex gap-2">
                                            <a href={order.paymentProof} target="_blank" rel="noopener noreferrer" 
                                               className="text-blue-400 hover:text-blue-300 text-xs underline">View</a>
                                            <button onClick={() => handleRemoveProof('paymentProof')} 
                                                    className="text-red-400 hover:text-red-300 text-xs underline">Remove</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-2 bg-gray-500/10 border border-gray-500/20 rounded">
                                        <p className="text-sm text-gray-500">❌ No proof uploaded</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Shipping Payment</p>
                                {order.shippingPaymentProof ? (
                                    <div className="flex items-center justify-between gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded">
                                        <span className="text-sm text-green-300">✅ Uploaded</span>
                                        <div className="flex gap-2">
                                            <a href={order.shippingPaymentProof} target="_blank" rel="noopener noreferrer" 
                                               className="text-blue-400 hover:text-blue-300 text-xs underline">View</a>
                                            <button onClick={() => handleRemoveProof('shippingPaymentProof')} 
                                                    className="text-red-400 hover:text-red-300 text-xs underline">Remove</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-2 bg-gray-500/10 border border-gray-500/20 rounded">
                                        <p className="text-sm text-gray-500">❌ No proof uploaded</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Management Section */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                        ⚙️ Manage Order
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 uppercase tracking-wide font-medium">Status</label>
                            <select 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)} 
                                className="w-full p-3 bg-gray-900/80 rounded-lg border border-gray-600/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            >
                                {(order.shippingMethod === 'Delivery' ? deliveryStatuses : pickupStatuses).map(s => 
                                    <option key={s} value={s}>{getStatusEmoji(s)} {s}</option>
                                )}
                            </select>
                        </div>
                        
                        {status === 'Processing' && (
                            <div className="space-y-2" style={{
                                animation: 'fadeIn 0.3s ease-in-out'
                            }}>
                                <label className="text-xs text-gray-400 uppercase tracking-wide font-medium">Est. Completion</label>
                                <input 
                                    type="date" 
                                    value={estimatedCompletionDate} 
                                    onChange={(e) => setEstimatedCompletionDate(e.target.value)} 
                                    className="w-full p-3 bg-gray-900/80 rounded-lg border border-gray-600/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                                />
                            </div>
                        )}
                        
                        {order.shippingMethod === 'Delivery' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 uppercase tracking-wide font-medium">💰 Shipping Cost</label>
                                    <input 
                                        type="number" 
                                        value={shippingCost} 
                                        onChange={(e) => setShippingCost(Number(e.target.value))} 
                                        className="w-full p-3 bg-gray-900/80 rounded-lg border border-gray-600/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 uppercase tracking-wide font-medium">🚚 Provider</label>
                                    <input 
                                        type="text" 
                                        value={shippingProvider} 
                                        onChange={(e) => setShippingProvider(e.target.value)} 
                                        className="w-full p-3 bg-gray-900/80 rounded-lg border border-gray-600/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                                        placeholder="e.g. JNE, J&T"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 uppercase tracking-wide font-medium">📦 Tracking ID</label>
                                    <input 
                                        type="text" 
                                        value={shippingId} 
                                        onChange={(e) => setShippingId(e.target.value)} 
                                        className="w-full p-3 bg-gray-900/80 rounded-lg border border-gray-600/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                                        placeholder="Enter tracking number"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    
                    {status === 'Cancelled' && (
                        <div className="mt-4 space-y-2" style={{
                            animation: 'fadeIn 0.3s ease-in-out'
                        }}>
                            <label className="text-xs text-gray-400 uppercase tracking-wide font-medium">❌ Cancellation Reason</label>
                            <textarea 
                                value={cancellationReason} 
                                onChange={(e) => setCancellationReason(e.target.value)} 
                                placeholder="Reason visible to customer..." 
                                className="w-full p-3 bg-gray-900/80 rounded-lg border border-gray-600/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none" 
                                rows="3" 
                            />
                        </div>
                    )}
                    
                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleUpdate}
                            disabled={isUpdating}
                            style={{
                                ...buttonStyle,
                                background: isUpdating 
                                    ? 'linear-gradient(135deg, rgba(107, 114, 128, 0.8) 0%, rgba(75, 85, 99, 0.8) 100%)'
                                    : 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(21, 128, 61, 0.8) 100%)',
                                backdropFilter: 'blur(10px)',
                                border: isUpdating ? '1px solid rgba(107, 114, 128, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                            }}
                            className={`text-white py-3 px-6 rounded-lg font-medium flex items-center gap-2 ${isUpdating ? 'cursor-not-allowed' : 'hover:shadow-lg'}`}
                            onMouseEnter={(e) => !isUpdating && Object.assign(e.target.style, hoverButtonStyle)}
                            onMouseLeave={(e) => !isUpdating && Object.assign(e.target.style, buttonStyle)}
                        >
                            {isUpdating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>💾 Save Changes</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Total Section */}
            <div className="text-right font-semibold border-t border-gray-700/50 pt-4">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-4 py-2 rounded-lg border border-amber-500/30">
                    <span className="text-amber-400">💰 Total:</span>
                    <span className="text-xl text-white">{formatPrice(order.totalPrice + shippingCost)}</span>
                </div>
            </div>
        </div>
    );
};

const ManageOrders = ({ showNotification, token }) => {
    const API_URL = `${process.env.SERVER_URL}`;
    const { data: orders, loading, error, setData: setOrders } = useFetch(`${API_URL}/api/orders`, token, true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const handleOrderUpdate = async () => {
        const response = await fetch(`${API_URL}/api/orders`, { headers: { 'Authorization': `Bearer ${token}` }});
        const updatedOrders = await response.json();
        setOrders(updatedOrders);
    };

    const filteredOrders = orders ? orders.filter(order => {
        const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    }) : [];

    const allStatuses = ['All', 'Pending Payment', 'Awaiting Shipping Payment', 'Processing', 'Shipped', 'Delivered', 'Ready for Pickup', 'Received', 'Cancelled'];

    if (loading) return (
        <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto"></div>
                <p className="text-gray-400">📋 Loading orders...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="text-center py-12">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-400">❌ {error}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header with Search and Filter */}
            <div 
                className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50"
                style={{
                    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(31, 41, 55, 0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">📋 Order Management</h2>
                        <p className="text-gray-400 text-sm">
                            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="🔍 Search orders, customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-4 pr-4 py-3 bg-gray-900/80 rounded-lg border border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-48 px-4 py-3 bg-gray-900/80 rounded-lg border border-gray-600/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        >
                            {allStatuses.map(status => (
                                <option key={status} value={status}>
                                    {status === 'All' ? '📊 All Status' : status}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => (
                        <div
                            key={order._id}
                            style={{
                                animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`
                            }}
                        >
                            <OrderManager 
                                order={order} 
                                token={token} 
                                showNotification={showNotification} 
                                onUpdate={handleOrderUpdate} 
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8 max-w-md mx-auto">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-gray-400 text-lg mb-2">No orders found</p>
                            <p className="text-gray-500 text-sm">
                                {searchTerm || statusFilter !== 'All' 
                                    ? 'Try adjusting your search or filter criteria' 
                                    : 'Orders will appear here once customers place them'
                                }
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes fadeInUp {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
            `}</style>
        </div>
    );
};

export default ManageOrders;
