// productRoutes.js
const express = require('express');
const router = express.Router();
const { getAllProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');

// REMOVED: All multer configuration has been deleted from this file.

// The routes no longer need the multer middleware. 
// express-fileupload handles it globally.
router.get('/', getAllProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;