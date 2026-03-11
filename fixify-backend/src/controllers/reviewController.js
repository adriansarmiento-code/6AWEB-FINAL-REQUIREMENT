const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { notifyNewReview } = require('../utils/notificationService'); 

// @desc    Create review for completed booking
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Verify booking exists and is completed
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this booking' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }

    const review = await Review.create({
      booking: bookingId,
      customer: req.user._id,
      provider: booking.provider,
      rating,
      comment,
    });

    // Update booking hasReview flag
    booking.hasReview = true;
    await booking.save();

    await review.populate('customer', 'name');
    await review.populate('provider', 'name providerInfo');

    // ✅ Create notification for provider
    await notifyNewReview(review, booking.provider, req.user.name, rating);

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
exports.getProviderReviews = async (req, res) => {
  try {
    const { status } = req.query;

    let query = { provider: req.params.providerId };

    // Filter by status if provided (for moderation)
    if (status) {
      query.status = status;
    } else {
      // By default, only show approved reviews
      query.status = 'approved';
    }

    const reviews = await Review.find(query)
      .populate('customer', 'name')
      .populate('booking', 'service')
      .sort({ createdAt: -1 });

    res.json({
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add provider response to review
// @route   PUT /api/reviews/:id/response
// @access  Private (Provider only)
exports.addResponse = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the provider being reviewed
    if (review.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this review' });
    }

    review.response = {
      text: req.body.response,
      date: Date.now(),
    };

    await review.save();

    await review.populate('customer', 'name');
    await review.populate('provider', 'name providerInfo');

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all reviews (admin)
// @route   GET /api/reviews
// @access  Private (Admin only)
exports.getAllReviews = async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const reviews = await Review.find(query)
      .populate('customer', 'name email')
      .populate('provider', 'name email providerInfo')
      .populate('booking', 'service')
      .sort({ createdAt: -1 });

    res.json({
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update review status (admin)
// @route   PUT /api/reviews/:id/status
// @access  Private (Admin only)
exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('customer', 'name')
      .populate('provider', 'name providerInfo');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};