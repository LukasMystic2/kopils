// models/messageModel.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    // NEW: Add isRead field with a default value of false
    isRead: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

// Create a TTL index on the `createdAt` field.
// Documents will automatically be deleted 7 days (604800 seconds) after their creation time.
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });


const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
