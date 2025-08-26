// controllers/chatController.js
const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');

// Get all conversations for the admin view
exports.getConversations = async (req, res) => {
    try {
        // Add a guard clause to ensure req.user is defined.
        // This prevents the server from crashing if the auth middleware fails.
        if (!req.user || !req.user._id) {
            console.error("Authentication error: req.user is not defined in getConversations.");
            return res.status(401).json({ message: 'Not authorized, user information is missing.' });
        }

        const conversations = await Conversation.find({})
            .populate({
                path: 'participants',
                select: 'name email profilePictureUrl role'
            })
            .sort({ updatedAt: -1 })
            .lean(); // Use .lean() for better performance as we will be modifying the objects

        // For each conversation, count the unread messages for the admin
        const conversationsWithUnread = await Promise.all(conversations.map(async (convo) => {
            const unreadCount = await Message.countDocuments({
                conversationId: convo._id,
                isRead: false,
                sender: { $ne: req.user._id } // This is now safe because of the check above
            });
            return { ...convo, unreadCount };
        }));

        res.json(conversationsWithUnread);
    } catch (error) {
        console.error('Error fetching conversations with unread count:', error);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
};

// Get all messages for a specific conversation
exports.getMessagesForConversation = async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.conversationId })
            .populate('sender', 'name profilePictureUrl')
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

// Get (or create) a conversation for the logged-in user with Anie
exports.getUserConversation = async (req, res) => {
    try {
        const anieEmail = "aniesuryany1@gmail.com";
        const anie = await User.findOne({ email: anieEmail });

        if (!anie) {
            return res.status(404).json({ message: "Chat contact 'Anie' not found in the user database." });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, anie._id] }
        }).populate('participants', 'name profilePictureUrl email');

        if (!conversation) {
            conversation = new Conversation({
                participants: [req.user._id, anie._id]
            });
            await conversation.save();
            conversation = await conversation.populate('participants', 'name profilePictureUrl email');
        }
        
        res.json(conversation);

    } catch (error) {
        res.status(500).json({ message: 'Error getting user conversation' });
    }
};
