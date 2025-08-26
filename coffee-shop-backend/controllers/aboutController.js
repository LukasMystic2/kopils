// controllers/aboutController.js
const About = require('../models/aboutModel');
const cloudinary = require('../config/cloudinary');
const { getPublicIdFromUrl } = require('../utils/cloudinaryHelper');

// Helper function to find all Cloudinary URLs in the HTML content
const findCloudinaryUrls = (html) => {
  if (!html) return [];
  const regex = /https?:\/\/res\.cloudinary\.com\/[^\/]+\/(image|video)\/upload\/[^\s"]+/g;
  return html.match(regex) || [];
};

// Helper to determine if a URL is for an image or video
const getResourceTypeFromUrl = (url) => {
  if (url.includes('/video/')) return 'video';
  return 'image';
};

// GET the about page content
exports.getAboutContent = async (req, res) => {
  try {
    // Find the single document for the about page, or create it if it doesn't exist
    let aboutContent = await About.findOne({ key: 'about-us' });
    if (!aboutContent) {
      aboutContent = await About.create({
        content: '<p>Welcome to our About Page! Edit this content in the admin panel.</p>',
        lastUpdatedBy: 'System'
      });
    }
    res.json(aboutContent);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching about page content' });
  }
};

// UPDATE the about page content
exports.updateAboutContent = async (req, res) => {
  try {
    const { content } = req.body;
    const adminName = req.user.name; 

    const currentContent = await About.findOne({ key: 'about-us' });

    // --- Cloudinary Asset Cleanup ---
    const oldUrls = findCloudinaryUrls(currentContent ? currentContent.content : '');
    const newUrls = findCloudinaryUrls(content);
    const urlsToDelete = oldUrls.filter(url => !newUrls.includes(url));

    for (const url of urlsToDelete) {
      const publicId = getPublicIdFromUrl(url);
      const resourceType = getResourceTypeFromUrl(url);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      }
    }
    // --- End Cleanup ---

    const updatedContent = await About.findOneAndUpdate(
      { key: 'about-us' },
      { content, lastUpdatedBy: adminName },
      { new: true, upsert: true } // Upsert will create the document if it doesn't exist
    );

    res.json(updatedContent);
  } catch (error) {
    console.error("Update About Page Error:", error);
    res.status(400).json({ message: 'Error updating about page', error: error.message });
  }
};

// UPLOAD editor media (image or video)
exports.uploadEditorMedia = async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Accept image or video
    const file = req.files.image || req.files.video;
    if (!file) {
      return res.status(400).json({ message: 'File must be an image or a video' });
    }

    // Determine resource type
    const isVideo = file.mimetype.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'about-editor',
      resource_type: resourceType
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({ message: 'Media upload failed' });
  }
};
