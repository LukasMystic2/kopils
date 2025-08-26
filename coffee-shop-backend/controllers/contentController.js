const Content = require('../models/contentModel');
const cloudinary = require('../config/cloudinary');
const { getPublicIdFromUrl } = require('../utils/cloudinaryHelper');

exports.getAllContent = async (req, res) => {
    try {
        const content = await Content.find({});
        const contentMap = content.reduce((acc, item) => {
            acc[item.section] = item;
            return acc;
        }, {});
        res.json(contentMap);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching content' });
    }
};

exports.uploadContentImage = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        const file = req.files.image;

        if (file.size === 0) {
            console.error("Attempted to upload an empty file.");
            return res.status(400).json({ message: 'Empty file' });
        }

        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'site-content',
            resource_type: 'auto'
        });

        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('Content image upload error:', error);
        res.status(500).json({ message: 'Content image upload failed' });
    }
};

exports.uploadHeroImages = async (req, res) => {
    try {
        if (!req.files || !req.files.images) {
            return res.status(400).json({ message: 'No images uploaded' });
        }
        
        const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        
        const uploadedUrls = [];
        for (const file of files) {
            if (file.size === 0) {
                console.error("Attempted to upload an empty file.");
                continue;
            }
            
            const result = await cloudinary.uploader.upload(file.tempFilePath, {
                folder: 'hero',
                resource_type: 'auto'
            });
            uploadedUrls.push(result.secure_url);
        }

        res.json({ urls: uploadedUrls });
    } catch (error) {
        console.error('Hero images upload error:', error);
        res.status(500).json({ message: 'Hero images upload failed' });
    }
};

exports.updateContent = async (req, res) => {
    try {
        const { section, imageUrl, title, text, cite, details } = req.body;

        const existingContent = await Content.findOne({ section });

        // Cleanup logic for old image
        if (!imageUrl && existingContent && existingContent.imageUrl) {
            const publicId = getPublicIdFromUrl(existingContent.imageUrl);
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }

        const updateData = { imageUrl };
        
        // Dynamically set the update data based on the content section type
        if (details) {
            // This is for the "Why Us" section
            updateData.details = details;
            updateData.title = null;
            updateData.text = null;
            updateData.cite = null;
        } else {
            // This is for simple sections like "description" or "quote"
            updateData.title = title;
            updateData.text = text;
            updateData.cite = cite;
            updateData.details = null;
        }
        
        const content = await Content.findOneAndUpdate({ section }, updateData, { new: true, upsert: true });
        res.json(content);
    } catch (error) {
        console.error("Error updating content:", error);
        res.status(400).json({ message: 'Error updating content' });
    }
};

exports.updateHeroContent = async (req, res) => {
    try {
        const { slides } = req.body;
        
        const existingContent = await Content.findOne({ section: 'hero' });
        
        const oldImageUrls = existingContent?.details?.map(slide => slide.imageUrl) || [];
        const newImageUrls = slides.map(slide => slide.imageUrl);
        const urlsToDelete = oldImageUrls.filter(url => !newImageUrls.includes(url));
        
        for(const url of urlsToDelete) {
             const publicId = getPublicIdFromUrl(url);
             if (publicId) await cloudinary.uploader.destroy(publicId);
        }

        const content = await Content.findOneAndUpdate(
            { section: 'hero' },
            { details: slides },
            { new: true, upsert: true }
        );
        res.json(content);
    } catch (error) {
        console.error("Error updating hero content:", error);
        res.status(400).json({ message: 'Error updating hero content' });
    }
};
