const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    // highlight-start
    discount: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 100 
    },
    // highlight-end
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category',
        required: true 
    },
    imageUrl: { type: String, required: false },
    stock: { type: Number, required: true, min: 0, default: 0 },
    weight: { type: String, required: false },
    volume: { type: String, required: false },
    isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;