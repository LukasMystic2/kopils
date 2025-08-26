// routes/termsOfServiceRoutes.js
const express = require('express');
const router = express.Router();
const { getTermsOfService, updateTermsOfService } = require('../controllers/termsOfServiceController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getTermsOfService)
  .put(protectAdmin, updateTermsOfService);

module.exports = router;
