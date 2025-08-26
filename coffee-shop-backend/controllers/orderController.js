// controllers/orderController.js
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const cloudinary = require('../config/cloudinary');
const { getPublicIdFromUrl } = require('../utils/cloudinaryHelper');

// --- NEW: DEDICATED PAYMENT PROOF UPLOAD CONTROLLER ---
exports.uploadPaymentProof = async (req, res) => {
    try {
        if (!req.files || !req.files.paymentProof) {
            return res.status(400).json({ message: 'No payment proof file uploaded' });
        }
        const file = req.files.paymentProof;
        if (file.size === 0) {
            return res.status(400).json({ message: 'Empty file' });
        }
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'payment_proofs',
            resource_type: 'auto'
        });
        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('Payment proof upload error:', error);
        res.status(500).json({ message: 'Payment proof upload failed' });
    }
};

// --- NEW: DEDICATED SHIPPING PROOF UPLOAD CONTROLLER ---
exports.uploadShippingProofController = async (req, res) => {
    try {
        if (!req.files || !req.files.shippingProof) {
            return res.status(400).json({ message: 'No shipping proof file uploaded' });
        }
        const file = req.files.shippingProof;
        if (file.size === 0) {
            return res.status(400).json({ message: 'Empty file' });
        }
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'shipping_proofs',
            resource_type: 'auto'
        });
        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('Shipping proof upload error:', error);
        res.status(500).json({ message: 'Shipping proof upload failed' });
    }
};

// @desc    Create new order
// @route   POST /api/orders
exports.addOrderItems = async (req, res) => {
    // Expect a clean JSON body, not FormData
    const { orderItems, totalPrice, shippingMethod, paymentProofUrl } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (shippingMethod === 'Delivery' && (!user.address || !user.phoneNumber)) {
            return res.status(400).json({ message: 'Please complete your profile for delivery.' });
        }

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        } 
        
        const order = new Order({
            orderItems: orderItems,
            user: req.user._id,
            totalPrice,
            shippingMethod,
            paymentProof: paymentProofUrl,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Server error while creating order." });
    }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Upload shipping proof for an order
// @route   PUT /api/orders/:id/shipping-proof
exports.uploadShippingProof = async (req, res) => {
    // This controller is now for updating the order with the URL, not uploading the file.
    try {
        const { shippingPaymentProofUrl } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        // Handle cleanup of old proof if new one is uploaded or removed
        if (shippingPaymentProofUrl !== order.shippingPaymentProof) {
            if (order.shippingPaymentProof) {
                const publicId = getPublicIdFromUrl(order.shippingPaymentProof);
                if(publicId) await cloudinary.uploader.destroy(publicId);
            }
        }
        
        order.shippingPaymentProof = shippingPaymentProofUrl || null;
        order.status = 'Processing';
        await order.save();
        res.json({ message: 'Shipping proof uploaded successfully.' });
        
    } catch (error) {
        console.error("Error updating shipping proof:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- ADMIN FUNCTIONS ---

// @desc    Get all orders
// @route   GET /api/orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'name email address phoneNumber').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update order status and shipping cost
// @route   PUT /api/orders/:id
exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = req.body.status || order.status;
            order.shippingProvider = req.body.shippingProvider;
            order.shippingId = req.body.shippingId;
            order.cancellationReason = req.body.cancellationReason;
            order.estimatedCompletionDate = req.body.estimatedCompletionDate;

            if (req.body.shippingCost !== undefined) {
                const newShippingCost = Number(req.body.shippingCost);
                if (newShippingCost > 0 && order.shippingCost === 0) {
                    order.status = 'Awaiting Shipping Payment';
                }
                order.shippingCost = newShippingCost;
            }
            
            // Cleanup logic for proofs when they are removed by the admin
            if (req.body.paymentProof === null && order.paymentProof) {
                const publicId = getPublicIdFromUrl(order.paymentProof);
                if(publicId) await cloudinary.uploader.destroy(publicId);
                order.paymentProof = null;
            }
            if (req.body.shippingPaymentProof === null && order.shippingPaymentProof) {
                const publicId = getPublicIdFromUrl(order.shippingPaymentProof);
                if(publicId) await cloudinary.uploader.destroy(publicId);
                order.shippingPaymentProof = null;
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            if (order.paymentProof) {
                const publicId = getPublicIdFromUrl(order.paymentProof);
                if (publicId) await cloudinary.uploader.destroy(publicId);
            }
            if (order.shippingPaymentProof) {
                const publicId = getPublicIdFromUrl(order.shippingPaymentProof);
                if (publicId) await cloudinary.uploader.destroy(publicId);
            }
            
            await order.deleteOne();
            res.json({ message: 'Order removed' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
