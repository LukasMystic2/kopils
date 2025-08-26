// models/orderModel.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            price: { type: Number, required: true },
            weight: { type: String, required: false },
            category: { type: String, required: false },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product',
            },
        },
    ],
    shippingMethod: {
        type: String,
        required: true,
        enum: ['Pickup', 'Delivery'],
    },
    shippingCost: {
        type: Number,
        default: 0,
    },
    shippingProvider: {
        type: String,
    },
    shippingId: {
        type: String,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending Payment', 'Awaiting Shipping Payment', 'Processing', 'Ready for Pickup', 'Shipped', 'Received', 'Delivered', 'Cancelled'],
        default: 'Pending Payment',
    },
    paymentProof: {
        type: String,
    },
    shippingPaymentProof: {
        type: String,
    },
    cancellationReason: {
        type: String,
    },
    estimatedCompletionDate: {
        type: Date,
    },
    // REMOVED pickupDate field
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
