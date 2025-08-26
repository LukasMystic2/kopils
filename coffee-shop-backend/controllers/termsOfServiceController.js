// controllers/termsOfServiceController.js
const TermsOfService = require('../models/termsOfServiceModel');

// @desc    Get the terms of service
// @route   GET /api/terms-of-service
// @access  Public
exports.getTermsOfService = async (req, res) => {
  try {
    const terms = await TermsOfService.findOne({ section: 'termsOfService' });
    // If the terms document is not found, send an empty object to prevent a crash.
    res.json(terms || {});
  } catch (error) {
    console.error("Error fetching terms of service:", error);
    res.status(500).json({ message: 'Error fetching terms of service' });
  }
};

// @desc    Update the terms of service
// @route   PUT /api/terms-of-service
// @access  Private (Admin only)
exports.updateTermsOfService = async (req, res) => {
  try {
    const { content } = req.body;
    
    // Find the terms of service document and update its content
    const updatedTerms = await TermsOfService.findOneAndUpdate(
      { section: 'termsOfService' },
      { content },
      { new: true, upsert: true }
    );

    res.json(updatedTerms);
  } catch (error) {
    console.error("Error updating terms of service:", error);
    res.status(400).json({ message: 'Error updating terms of service' });
  }
};
