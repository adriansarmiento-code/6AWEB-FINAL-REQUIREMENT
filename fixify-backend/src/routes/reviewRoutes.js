const express = require('express');
const router = express.Router();
const {
  createReview,
  getProviderReviews,
  addResponse,
  getAllReviews,
  updateReviewStatus,
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/', protect, admin, getAllReviews);
router.get('/provider/:providerId', getProviderReviews);
router.put('/:id/response', protect, addResponse);
router.put('/:id/status', protect, admin, updateReviewStatus);

module.exports = router;