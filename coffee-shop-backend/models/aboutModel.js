// models/aboutModel.js
const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  // Using a fixed key to ensure there's only one "About Us" document
  key: { type: String, default: 'about-us', unique: true },
  content: { type: String, required: true },
  lastUpdatedBy: { type: String }, 
}, { timestamps: true }); 

const About = mongoose.model('About', aboutSchema);
module.exports = About;