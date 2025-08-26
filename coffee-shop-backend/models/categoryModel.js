const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    isProtected: { // To prevent deletion of core categories
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
