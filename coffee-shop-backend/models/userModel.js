const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        unique: true
    },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profilePictureUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    onlineStatus: { type: String, enum: ['online', 'offline'], default: 'offline' },
    address: { type: String },
    phoneNumber: { type: String },
    verificationToken: String,
    // ADDED: Field to store the verification token expiration date
    verificationTokenExpires: Date,
    // ADDED: Fields for rate-limiting verification link requests
    verificationAttempts: {
        type: Number,
        default: 0
    },
    lastVerificationAttempt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, { timestamps: true });


// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate a verification token
userSchema.methods.getVerificationToken = function () {
    const token = crypto.randomBytes(20).toString('hex');
    this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
    // ADDED: Set the verification token to expire in 10 minutes
    this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;
    return token;
};

// Method to generate a password reset token
userSchema.methods.getPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes
    return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
