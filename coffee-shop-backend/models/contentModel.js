// models/contentModel.js
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    unique: true, // e.g., 'description', 'quote', 'whyUs'
  },
  title: { // For section titles
    type: String,
  },
  text: { // For main text or quote body
    type: String,
  },
  cite: { // For the quote author
    type: String,
  },
  imageUrl: { // For background images
    type: String,
  },
  // For structured content like the "Why Us" highlights
  details: { 
    type: mongoose.Schema.Types.Mixed, 
  },
}, { timestamps: true });

const Content = mongoose.model('Content', contentSchema);
module.exports = Content;
