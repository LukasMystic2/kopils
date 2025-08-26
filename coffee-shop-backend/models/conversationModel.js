const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    // Participants will be the user's ID and Anie's admin ID
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    lastMessage: {
        type: String,
        default: "No messages yet."
    }
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;