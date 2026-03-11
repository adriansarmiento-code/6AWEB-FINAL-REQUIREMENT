const express = require('express');
const router = express.Router();
const {
  getProviders,
  getProviderById,
  updateProvider,
} = require('../controllers/providerController');
const { protect, providerOrAdmin } = require('../middleware/auth');

router.get('/', getProviders);
router.get('/:id', getProviderById);
router.put('/:id', protect, providerOrAdmin, updateProvider);

module.exports = router;