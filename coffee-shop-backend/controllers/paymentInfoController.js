const PaymentInfo = require('../models/paymentInfoModel');
const cloudinary = require('../config/cloudinary');
const { getPublicIdFromUrl } = require('../utils/cloudinaryHelper');

exports.getPaymentInfo = async (req, res) => {
    try {
        const info = await PaymentInfo.findOne({ key: 'main' });
        // If the info document is not found, send an empty object to prevent a crash.
        res.json(info || {}); 
    } catch (error) {
        // This is a more specific catch for database-related errors.
        console.error("Error fetching payment info:", error);
        res.status(500).json({ message: 'Error fetching payment info' });
    }
};

// --- DEDICATED QRIS IMAGE UPLOAD CONTROLLER ---
exports.uploadQrisImage = async (req, res) => {
    try {
        if (!req.files || !req.files.qrisImage) {
            return res.status(400).json({ message: 'No QRIS file uploaded' });
        }
        const file = req.files.qrisImage;

        // Check if the file is empty before attempting to upload to Cloudinary.
        if (file.size === 0) {
            console.error("Attempted to upload an empty file.");
            return res.status(400).json({ message: 'Empty file' });
        }

        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'payment',
            resource_type: 'auto'
        });

        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('QRIS image upload error:', error);
        res.status(500).json({ message: 'QRIS image upload failed' });
    }
};


exports.updatePaymentInfo = async (req, res) => {
    try {
        const { bankName, accountNumber, accountName, qrisImageUrl } = req.body;

        const existingInfo = await PaymentInfo.findOne({ key: 'main' });

        if (!qrisImageUrl && existingInfo && existingInfo.qrisImageUrl) {
            const publicId = getPublicIdFromUrl(existingInfo.qrisImageUrl);
            if(publicId) await cloudinary.uploader.destroy(publicId);
        }

        const info = await PaymentInfo.findOneAndUpdate(
            { key: 'main' },
            { bankName, accountNumber, accountName, qrisImageUrl },
            { new: true, upsert: true }
        );
        res.json(info);
    } catch (error) {
        console.error("Error updating payment info:", error);
        res.status(400).json({ message: 'Error updating payment info' });
    }
};
