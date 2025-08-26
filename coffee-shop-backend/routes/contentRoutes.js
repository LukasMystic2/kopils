const express = require('express');
const router = express.Router();
const { 
    getAllContent, 
    updateContent, 
    updateHeroContent,
    uploadContentImage, 
    uploadHeroImages 
} = require('../controllers/contentController');

// Public routes
router.get('/', getAllContent);

// Protected admin routes for updating content sections
router.post('/', updateContent);

// Dedicated route for the complex hero section
router.post('/hero', updateHeroContent);

// --- DEDICATED ROUTE FOR SINGLE IMAGE UPLOAD (Why Us, Description, Quote) ---
router.post('/upload/image', uploadContentImage);

// --- DEDICATED ROUTE FOR MULTIPLE HERO IMAGES UPLOAD ---
router.post('/hero/upload/images', uploadHeroImages);

module.exports = router;
