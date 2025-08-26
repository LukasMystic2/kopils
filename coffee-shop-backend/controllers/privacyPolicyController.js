// controllers/privacyPolicyController.js
const PrivacyPolicy = require('../models/privacyPolicyModel');

// @desc    Get the privacy policy
// @route   GET /api/privacy-policy
// @access  Public
exports.getPrivacyPolicy = async (req, res) => {
  try {
    const policy = await PrivacyPolicy.findOne({ section: 'privacyPolicy' });
    // If the policy document is not found, send an empty object to prevent a crash.
    res.json(policy || {});
  } catch (error) {
    console.error("Error fetching privacy policy:", error);
    res.status(500).json({ message: 'Error fetching privacy policy' });
  }
};

// @desc    Update the privacy policy
// @route   PUT /api/privacy-policy
// @access  Private (Admin only)
exports.updatePrivacyPolicy = async (req, res) => {
  try {
    const { content } = req.body;
    
    // Find the privacy policy document and update its content
    const updatedPolicy = await PrivacyPolicy.findOneAndUpdate(
      { section: 'privacyPolicy' },
      { content },
      { new: true, upsert: true }
    );

    res.json(updatedPolicy);
  } catch (error) {
    console.error("Error updating privacy policy:", error);
    res.status(400).json({ message: 'Error updating privacy policy' });
  }
};
