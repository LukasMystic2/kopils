// controllers/productController.js
const Product = require('../models/productModel');
const cloudinary = require('../config/cloudinary');
const { getPublicIdFromUrl } = require('../utils/cloudinaryHelper');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}).populate('category');
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        let imageUrl = null;
        // Check for files from express-fileupload
        if (req.files && req.files.image) {
            const imageFile = req.files.image;
            // Upload using the temp file path
            const result = await cloudinary.uploader.upload(imageFile.tempFilePath, {
                folder: 'products'
            });
            imageUrl = result.secure_url;
        }

        const newProduct = new Product({ ...req.body, isFeatured: req.body.isFeatured === 'true', imageUrl });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ message: 'Error creating product' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        let imageUrl = product.imageUrl;

        // Check for new file upload
        if (req.files && req.files.image) {
            // Delete old image if it exists
            if (product.imageUrl) {
                const publicId = getPublicIdFromUrl(product.imageUrl);
                if (publicId) await cloudinary.uploader.destroy(publicId);
            }
            // Upload the new image
            const imageFile = req.files.image;
            const result = await cloudinary.uploader.upload(imageFile.tempFilePath, {
                folder: 'products'
            });
            imageUrl = result.secure_url;
        } 
        // Logic for removing an image without uploading a new one
        else if (req.body.imageUrl === '' && product.imageUrl) {
            const publicId = getPublicIdFromUrl(product.imageUrl);
            if (publicId) await cloudinary.uploader.destroy(publicId);
            imageUrl = null;
        }

        const updatedData = { ...req.body, isFeatured: req.body.isFeatured === 'true', imageUrl };
        const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ message: 'Error updating product' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.imageUrl) {
            const publicId = getPublicIdFromUrl(product.imageUrl);
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }

        await Product.findByIdAndDelete(id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error deleting product' });
    }
};