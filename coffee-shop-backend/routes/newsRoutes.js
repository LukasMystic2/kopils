// routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getAllNews, 
    createNews, 
    updateNews, 
    deleteNews, 
    getNewsBySlug,
    uploadNewsThumbnail // <-- Make sure to import the new controller
} = require('../controllers/newsController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllNews);
router.get('/:slug', getNewsBySlug);

// Protected admin routes for creating/updating/deleting the article data
router.post('/', protectAdmin, createNews);
router.put('/:id', protectAdmin, updateNews);
router.delete('/:id', protectAdmin, deleteNews);

// --- NEW: DEDICATED ROUTE FOR THUMBNAIL UPLOAD ---
// This route will handle only the file upload part of the process.
router.post('/upload/thumbnail', protectAdmin, uploadNewsThumbnail);

module.exports = router;
