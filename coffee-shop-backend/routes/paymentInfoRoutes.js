const express = require('express');
const router = express.Router();
const { getPaymentInfo, updatePaymentInfo, uploadQrisImage } = require('../controllers/paymentInfoController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getPaymentInfo)
    .post(protectAdmin, updatePaymentInfo);

// --- NEW: DEDICATED ROUTE FOR QRIS IMAGE UPLOAD ---
// This route will handle only the file upload part of the process.
router.post('/upload/qrisImage', protectAdmin, uploadQrisImage);

module.exports = router;
