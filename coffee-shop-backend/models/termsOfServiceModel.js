// models/termsOfServiceModel.js
const mongoose = require('mongoose');

const termsOfServiceSchema = new mongoose.Schema({
  // Gunakan 'termsOfService' sebagai string unik untuk memastikan hanya ada satu dokumen
  section: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const TermsOfService = mongoose.model('TermsOfService', termsOfServiceSchema);
module.exports = TermsOfService;
