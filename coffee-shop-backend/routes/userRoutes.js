// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    verifyUser, 
    forgotPassword, 
    resetPassword, 
    // ADDED: Ensure resendVerificationLink is imported
    resendVerificationLink, 
    getUserProfile, 
    updateUserProfile, 
    uploadProfilePicture 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify/:token', verifyUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
// ADDED: New route for resending verification link
router.post('/resend-verification', resendVerificationLink);

// Add the protected profile route
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// --- NEW: DEDICATED ROUTE FOR PROFILE PICTURE UPLOAD ---
router.post('/profile/upload/picture', protect, uploadProfilePicture);

module.exports = router;
