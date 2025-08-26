// utils/cloudinaryHelper.js

// Extracts the public_id from a full Cloudinary URL
exports.getPublicIdFromUrl = (url) => {
    if (!url) return null;
    // Example: http://res.cloudinary.com/cloud_name/image/upload/v123/folder/public_id.jpg
    // We want to extract "folder/public_id"
    try {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1 || uploadIndex + 2 >= parts.length) return null;
        
        const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
        const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
        return publicId;
    } catch (error) {
        console.error("Could not extract public_id from URL:", url, error);
        return null;
    }
};
