// models/privacyPolicyModel.js
const mongoose = require('mongoose');

const privacyPolicySchema = new mongoose.Schema({
  // Gunakan 'privacyPolicy' sebagai string unik untuk memastikan hanya ada satu dokumen
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

const PrivacyPolicy = mongoose.model('PrivacyPolicy', privacyPolicySchema);
module.exports = PrivacyPolicy;
