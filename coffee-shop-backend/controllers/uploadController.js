// controllers/uploadController.js
const cloudinary = require('../config/cloudinary');

// Handles media uploads specifically from the ReactQuill editor
exports.uploadEditorMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        // Upload to a specific folder for content media
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: 'news_content' }, (error, result) => {
                if (result) resolve(result);
                else reject(error);
            });
            stream.end(req.file.buffer);
        });
        // Return the secure URL and the type of media (image/video)
        res.status(200).json({ url: result.secure_url, type: result.resource_type });
    } catch (error) {
        console.error('Error uploading media:', error);
        res.status(500).json({ message: 'Error uploading media.' });
    }
};
