// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { getConversations, getMessagesForConversation, getUserConversation } = require('../controllers/chatController');
const { protectAdmin, protect } = require('../middleware/authMiddleware');

// --- Admin Routes (Protected) ---
// Gets a list of all conversations for the admin dashboard.
router.get('/conversations', protectAdmin, getConversations);
// Gets all messages for a specific conversation selected by an admin.
router.get('/messages/:conversationId', protectAdmin, getMessagesForConversation);

// --- User Routes (Protected) ---
// Gets (or creates) the conversation between the logged-in user and Anie.
router.get('/my-conversation', protect, getUserConversation);
// Gets all messages for the logged-in user's conversation.
router.get('/my-messages/:conversationId', protect, getMessagesForConversation);

module.exports = router;
