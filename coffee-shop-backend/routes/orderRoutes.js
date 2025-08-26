// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { 
    addOrderItems, 
    getMyOrders, 
    getOrders, 
    updateOrder, 
    deleteOrder, 
    uploadShippingProof, 
    uploadPaymentProof, // New upload controller
    uploadShippingProofController // New upload controller
} = require('../controllers/orderController');
const { protect, protectAdmin } = require('../middleware/authMiddleware');
// const multer = require('multer'); // Removed multer

// const storage = multer.memoryStorage(); // Removed multer storage setup
// const upload = multer({ storage: storage }); // Removed multer upload setup

// User routes
router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id/shipping-proof').put(protect, uploadShippingProof);

// --- NEW: DEDICATED ROUTES FOR PAYMENT PROOFS ---
router.post('/upload/payment-proof', protect, uploadPaymentProof);
router.post('/upload/shipping-proof', protect, uploadShippingProofController);

// Admin routes
router.route('/').get(protectAdmin, getOrders);
router.route('/:id')
    .put(protectAdmin, updateOrder)
    .delete(protectAdmin, deleteOrder);

module.exports = router;
