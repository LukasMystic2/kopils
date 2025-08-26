// controllers/newsController.js
const News = require('../models/newsModel');
const cloudinary = require('../config/cloudinary');
const { getPublicIdFromUrl } = require('../utils/cloudinaryHelper');

// Helper functions
const findCloudinaryUrls = (html) => {
    if (!html) return [];
    const regex = /https?:\/\/res\.cloudinary\.com\/[^\/]+\/(image|video)\/upload\/[^\s"]+/g;
    return html.match(regex) || [];
};
const getResourceTypeFromUrl = (url) => {
    if (url.includes('/video/')) return 'video';
    return 'image';
};
// Simple slug generator to match Mongoose-slug-generator's likely behavior
const generateSlug = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
};


// --- DEDICATED THUMBNAIL UPLOAD CONTROLLER (No changes here) ---
exports.uploadNewsThumbnail = async (req, res) => {
    console.log('--- DEBUG: ENTERING uploadNewsThumbnail ---');
    try {
        if (!req.files || !req.files.thumbnail) {
            console.log('--- DEBUG: No thumbnail file found in req.files ---');
            return res.status(400).json({ message: 'No thumbnail file uploaded' });
        }
        console.log('--- DEBUG: Thumbnail file found, proceeding to upload. ---');
        const file = req.files.thumbnail;
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'news_thumbnails',
            resource_type: 'auto'
        });
        console.log('--- DEBUG: Thumbnail uploaded successfully to Cloudinary. ---');
        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('--- DEBUG: Thumbnail upload error ---', error);
        res.status(500).json({ message: 'Thumbnail upload failed' });
    }
};

exports.getAllNews = async (req, res) => {
    try {
        const news = await News.find({}).sort({ createdAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching news' });
    }
};

// --- UPDATED: createNews with proactive duplicate title check ---
exports.createNews = async (req, res) => {
    console.log('\n--- DEBUG: ENTERING createNews ---');
    try {
        const { title } = req.body;

        // NEW: Proactively check for a duplicate title before attempting to save.
        const potentialSlug = generateSlug(title);
        const existingArticle = await News.findOne({ slug: potentialSlug });

        if (existingArticle) {
            console.log(`--- DEBUG: Duplicate title detected. Existing slug: ${potentialSlug}`);
            // Return a 409 Conflict status with a clear message for the notification system.
            return res.status(409).json({ message: `An article with the title "${title}" already exists. Please use a different title.` });
        }
        
        const author = req.user.name;
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'Request body is empty. Check server middleware.' });
        }

        const isTopNewsBoolean = req.body.isTopNews === 'true';
        const newArticleData = {
            ...req.body,
            isTopNews: isTopNewsBoolean,
            author: author,
            lastUpdatedBy: author,
        };

        const newArticle = new News(newArticleData);
        await newArticle.save();
        
        console.log('--- DEBUG: Article saved successfully. ---');
        res.status(201).json(newArticle);
    } catch (error) {
        console.error('--- DEBUG: Error in createNews catch block ---', error);
        // Fallback check for race conditions, just in case.
        if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
            return res.status(409).json({ message: `An article with the title "${req.body.title}" already exists. Please use a different title.` });
        }
        res.status(400).json({ message: 'Error creating news', error: error.message });
    }
};

// --- UPDATED: updateNews with proactive duplicate title check ---
exports.updateNews = async (req, res) => {
    console.log('\n--- DEBUG: ENTERING updateNews ---');
    try {
        const { id } = req.params;
        const { title } = req.body;

        // NEW: Proactively check if the new title will conflict with another article.
        if (title) {
            const potentialSlug = generateSlug(title);
            // Find an article with the same slug, but it must NOT be the same article we are currently editing.
            const existingArticle = await News.findOne({ slug: potentialSlug, _id: { $ne: id } });
            if (existingArticle) {
                console.log(`--- DEBUG: Duplicate title detected on update. Existing slug: ${potentialSlug}`);
                return res.status(409).json({ message: `Another article with the title "${title}" already exists. Please use a different title.` });
            }
        }

        const article = await News.findById(id);
        if (!article) return res.status(404).json({ message: 'News not found' });

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'Request body is empty. Check server middleware.' });
        }

        const isTopNewsBoolean = req.body.isTopNews === 'true';
        const updateData = { 
            ...req.body,
            isTopNews: isTopNewsBoolean,
            lastUpdatedBy: req.user.name,
        };

        const oldUrls = findCloudinaryUrls(article.content);
        const newUrls = findCloudinaryUrls(req.body.content);
        const urlsToDelete = oldUrls.filter(url => !newUrls.includes(url));
        for (const url of urlsToDelete) {
            const publicId = getPublicIdFromUrl(url);
            const resourceType = getResourceTypeFromUrl(url);
            if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        }

        const updatedNews = await News.findByIdAndUpdate(id, updateData, { new: true });
        console.log('--- DEBUG: Article updated successfully. ---');
        res.json(updatedNews);
    } catch (error) {
        console.error("--- DEBUG: Error in updateNews catch block ---", error);
        // Fallback check for race conditions.
        if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
            return res.status(409).json({ message: `An article with the title "${req.body.title}" already exists. Please use a different title.` });
        }
        res.status(400).json({ message: 'Error updating news', error: error.message });
    }
};

// --- Other functions (no changes) ---
exports.deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await News.findById(id);
        if (!article) return res.status(404).json({ message: 'News not found' });

        if (article.thumbnailUrl) {
            const publicId = getPublicIdFromUrl(article.thumbnailUrl);
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }
        const urlsToDelete = findCloudinaryUrls(article.content);
        for (const url of urlsToDelete) {
            const publicId = getPublicIdFromUrl(url);
            const resourceType = getResourceTypeFromUrl(url);
            if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        }

        await News.findByIdAndDelete(id);
        res.json({ message: 'News deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting news' });
    }
};

exports.getNewsBySlug = async (req, res) => {
    try {
        const article = await News.findOne({ slug: req.params.slug });
        if (!article) return res.status(404).json({ message: 'News article not found' });
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching news article' });
    }
};
