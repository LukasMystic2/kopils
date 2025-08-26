// controllers/userController.js
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const cloudinary = require('../config/cloudinary');
const { getPublicIdFromUrl } = require('../utils/cloudinaryHelper');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        const nameExists = await User.findOne({ name });
        if (nameExists) {
            return res.status(400).json({ message: 'This username is already taken.' });
        }

        const user = new User({ name, email, password });
        const verificationToken = user.getVerificationToken();
        await user.save();

        // This URL points to your BACKEND API endpoint, so it should NOT be changed.
        const verifyUrl = `${req.protocol}://${req.get('host')}/api/users/verify/${verificationToken}`;
        const message = `<p>Please verify your email by clicking this link: <a href="${verifyUrl}">${verifyUrl}</a>. This link is valid for 10 minutes.</p>`;
        
        await sendEmail({
            email: user.email,
            subject: 'Kopi LS - Email Verification',
            message,
        });

        res.status(201).json({ 
            message: 'Registration successful! Please check your email to verify your account.',
            needsVerification: true
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.verifyUser = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({ 
            verificationToken: hashedToken,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            const expiredUser = await User.findOne({ verificationToken: hashedToken });
            if (expiredUser) {
                return res.status(400).send('<h1>This verification link has expired. Please register again.</h1>');
            }
            return res.status(400).send('<h1>Invalid verification link.</h1>');
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        user.verificationAttempts = 0;
        user.lastVerificationAttempt = undefined;

        await user.save();
        
        // CHANGED: Redirect to the frontend URL from environment variables
        res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
    } catch (error) {
        res.status(500).send('<h1>Server Error</h1>');
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        if (!user.isVerified) {
            if (await user.matchPassword(password)) {
                return res.status(401).json({ message: 'Please verify your email before logging in.', needsVerification: true, email: user.email });
            }
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        if (await user.matchPassword(password)) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                profilePictureUrl: user.profilePictureUrl,
                address: user.address,
                phoneNumber: user.phoneNumber,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
        }

        const resetToken = user.getPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // CHANGED: Use the frontend URL from environment variables for the reset link
        const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;
        const message = `<p>You are receiving this email because you (or someone else) has requested the reset of a password. Please click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a>. This link is valid for 10 minutes.</p>`;

        await sendEmail({
            email: user.email,
            subject: 'Kopi LS - Password Reset',
            message,
        });

        res.status(200).json({ message: 'Email sent!' });
    } catch (error) {
        res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or has expired' });
        }

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful! You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.resendVerificationLink = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified.' });
        }

        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        if (user.lastVerificationAttempt && now - user.lastVerificationAttempt < oneHour) {
            if (user.verificationAttempts >= 3) {
                return res.status(429).json({ message: 'Too many requests. Please try again in an hour.' });
            }
        } else {
            user.verificationAttempts = 0;
        }

        const verificationToken = user.getVerificationToken();
        user.verificationAttempts += 1;
        user.lastVerificationAttempt = now;
        await user.save();

        // This URL points to your BACKEND API endpoint, so it should NOT be changed.
        const verifyUrl = `${req.protocol}://${req.get('host')}/api/users/verify/${verificationToken}`;
        const message = `<p>Please verify your email by clicking this link: <a href="${verifyUrl}">${verifyUrl}</a>. This link is valid for 10 minutes.</p>`;
        
        await sendEmail({
            email: user.email,
            subject: 'Kopi LS - Email Verification',
            message,
        });

        res.status(200).json({ message: 'A new verification link has been sent to your email.' });
    } catch (error) {
        console.error('Error resending verification link:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePictureUrl: user.profilePictureUrl,
            address: user.address,
            phoneNumber: user.phoneNumber,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.files || !req.files.profilePicture) {
            return res.status(400).json({ message: 'No profile picture uploaded' });
        }
        const file = req.files.profilePicture;
        
        if (file.size === 0) {
            console.error("Attempted to upload an empty file.");
            return res.status(400).json({ message: 'Empty file' });
        }
        
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'profile_pictures',
            resource_type: 'auto'
        });
        
        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('Profile picture upload error:', error);
        res.status(500).json({ message: 'Profile picture upload failed' });
    }
};

exports.updateUserProfile = async (req, res) => {
    const { name, email, password, address, phoneNumber, profilePictureUrl } = req.body;
    
    const user = await User.findById(req.user._id);

    if (user) {
        if (name && name !== user.name) {
            const nameExists = await User.findOne({ name: name });
            if (nameExists && nameExists._id.toString() !== user._id.toString()) {
                return res.status(400).json({ message: 'This username is already taken.' });
            }
            user.name = name;
        }
        
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email: email });
            if (emailExists && emailExists._id.toString() !== user._id.toString()) {
                return res.status(400).json({ message: 'This email is already in use.' });
            }
            
            user.email = email;
            user.isVerified = false;
            const verificationToken = user.getVerificationToken();
            
            // This URL points to your BACKEND API endpoint, so it should NOT be changed.
            const verifyUrl = `${req.protocol}://${req.get('host')}/api/users/verify/${verificationToken}`;
            const message = `<p>You have updated your email. Please re-verify your new email address by clicking this link: <a href="${verifyUrl}">${verifyUrl}</a>. This link is valid for 10 minutes.</p>`;
            await sendEmail({ email: user.email, subject: 'Kopi LS - Email Verification', message });
        }

        if (password) {
            user.password = password;
        }
        
        user.address = address;
        user.phoneNumber = phoneNumber;

        if (profilePictureUrl !== user.profilePictureUrl) {
            if (user.profilePictureUrl) {
                const publicId = getPublicIdFromUrl(user.profilePictureUrl);
                if (publicId) await cloudinary.uploader.destroy(publicId);
            }
        }
        user.profilePictureUrl = profilePictureUrl || null;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profilePictureUrl: updatedUser.profilePictureUrl,
            isVerified: updatedUser.isVerified,
            address: updatedUser.address,
            phoneNumber: updatedUser.phoneNumber,
            token: generateToken(updatedUser._id),
            needsVerification: !updatedUser.isVerified,
        });

    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.onlineStatus = req.body.status;
            await user.save();
            res.json({ message: 'Status updated successfully.' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};