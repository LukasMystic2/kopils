const express = require('express');
const router = express.Router();
const {
  getAboutContent,
  updateAboutContent,
  uploadEditorMedia // <- updated
} = require('../controllers/aboutController');

const { protectAdmin } = require('../middleware/authMiddleware');

// Public route
router.get('/', getAboutContent);

// Protected admin route to update content
router.put('/', protectAdmin, updateAboutContent);

// ✅ New route for editor image upload
// ✅ Unified media upload route
router.post('/upload/editor', protectAdmin, uploadEditorMedia);


module.exports = router;
