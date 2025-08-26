// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require("socket.io");
const fileUpload = require('express-fileupload');

// Import Models
const User = require('./models/userModel');
const Conversation = require('./models/conversationModel');
const Message = require('./models/messageModel');
const TermsOfService = require('./models/termsOfServiceModel');

// Import routes
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const contentRoutes = require('./routes/contentRoutes');
const newsRoutes = require('./routes/newsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentInfoRoutes = require('./routes/paymentInfoRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const privacyPolicyRoutes = require('./routes/privacyPolicyRoutes');
const termsOfServiceRoutes = require('./routes/termsOfServiceRoutes');

const app = express();
const server = http.createServer(app);

// --- SOLUTION: Define allowed origins ---
const allowedOrigins = [
    process.env.CLIENT_URL, // Your Vercel URL from .env
    "http://localhost:3000"  // Your local development URL
].filter(Boolean); // This removes any undefined/null values

console.log("DEBUG: Allowed Origins ->", allowedOrigins); // <-- DEBUG

const io = new Server(server, {
    transports: ['websocket'], // <-- ADD THIS LINE
    cors: {
        origin: function (origin, callback) {
            console.log("DEBUG: CORS check for origin ->", origin); // <-- DEBUG
            // allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
                console.error("DEBUG: CORS Error ->", msg); // <-- DEBUG
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment-info', paymentInfoRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/privacy-policy', privacyPolicyRoutes);
app.use('/api/terms-of-service', termsOfServiceRoutes);

// --- Admin Seeding Function ---
const seedAdminUsers = async () => {
    try {
        const adminCredentialsString = process.env.ADMIN_CREDENTIALS || '[]';
        const adminAccounts = JSON.parse(adminCredentialsString);

        for (const admin of adminAccounts) {
            const userExists = await User.findOne({ email: admin.email });
            if (!userExists) {
                await User.create({
                    name: admin.name,
                    email: admin.email,
                    password: admin.password,
                    role: 'admin',
                    isVerified: true,
                });
                console.log(`Admin user ${admin.name} created.`);
            }
        }
    } catch (error) {
        console.error('Error seeding admin users:', error);
    }
};

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
      console.log('✅ MongoDB connected successfully!');
      seedAdminUsers();
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));


// ====================================================================
// START: SOCKET.IO LOGIC WITH NOTIFICATIONS
// ====================================================================

let userSockets = new Map();

const getOnlineUserIds = () => {
    return Array.from(userSockets.keys());
};

io.on('connection', (socket) => {
    console.log(`✅ DEBUG: Client connected successfully. Socket ID: ${socket.id}`); // <-- DEBUG

    socket.on('registerSocketIds', (ids) => {
        console.log(`DEBUG: Registering IDs for socket ${socket.id} ->`, ids); // <-- DEBUG
        socket.userRolesIds = ids;
        ids.forEach(userId => {
            if (userSockets.has(userId)) {
                userSockets.get(userId).add(socket.id);
            } else {
                userSockets.set(userId, new Set([socket.id]));
            }
        });
        console.log("DEBUG: Current userSockets map ->", userSockets); // <-- DEBUG
        io.emit('getOnlineUsers', getOnlineUserIds());
    });

    socket.on('requestOnlineUsers', () => {
        socket.emit('getOnlineUsers', getOnlineUserIds());
    });

    socket.on('disconnect', () => {
        console.log(`❌ DEBUG: Client disconnected. Socket ID: ${socket.id}`); // <-- DEBUG
        const userIds = socket.userRolesIds;
        if (userIds && Array.isArray(userIds)) {
            userIds.forEach(userId => {
                if (userSockets.has(userId)) {
                    userSockets.get(userId).delete(socket.id);
                    if (userSockets.get(userId).size === 0) {
                        userSockets.delete(userId);
                    }
                }
            });
            console.log("DEBUG: userSockets map after disconnect ->", userSockets); // <-- DEBUG
            io.emit('getOnlineUsers', getOnlineUserIds());
        }
    });

    socket.on('joinRoom', (conversationId) => {
        socket.join(conversationId);
    });

    socket.on('leaveRoom', (conversationId) => {
        socket.leave(conversationId);
    });

    socket.on('sendMessage', async ({ conversationId, senderId, content }) => {
        try {
            const message = new Message({ conversationId, sender: senderId, content });
            await message.save();
            
            const conversation = await Conversation.findByIdAndUpdate(
                conversationId, 
                { lastMessage: content },
                { new: true }
            ).populate('participants');

            const populatedMessage = await Message.findById(message._id).populate('sender', 'name profilePictureUrl');
            
            io.to(conversationId).emit('receiveMessage', populatedMessage);
            io.emit('updateConversationList', conversation);

            // --- NEW: Notification Logic ---
            const recipient = conversation.participants.find(p => p._id.toString() !== senderId);
            if (recipient) {
                const recipientSockets = userSockets.get(recipient._id.toString());
                if (recipientSockets && recipientSockets.size > 0) {
                    recipientSockets.forEach(socketId => {
                        io.to(socketId).emit('newMessageNotification', {
                            conversationId: conversationId,
                            senderName: populatedMessage.sender.name,
                        });
                    });
                }
            }

        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    socket.on('markAsRead', async ({ conversationId, userId }) => {
        try {
            await Message.updateMany(
                { conversationId: conversationId, sender: { $ne: userId }, isRead: false },
                { $set: { isRead: true } }
            );
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    });
});
// ====================================================================
// END: UPDATED SOCKET.IO LOGIC
// ====================================================================

server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
