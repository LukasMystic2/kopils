// routes/privacyPolicyRoutes.js
const express = require('express');
const router = express.Router();
const { getPrivacyPolicy, updatePrivacyPolicy } = require('../controllers/privacyPolicyController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getPrivacyPolicy)
  .put(protectAdmin, updatePrivacyPolicy);

module.exports = router;
