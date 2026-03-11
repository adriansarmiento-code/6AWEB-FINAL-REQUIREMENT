const Booking = require('../models/Booking');
const User = require('../models/User');
const { 
  notifyBookingCreated, 
  notifyBookingStatusUpdate,
  notifyPaymentReceived 
} = require('../utils/notificationService');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const {
      providerId,
      service,
      scheduledDate,
      scheduledTime,
      address,
      contactPhone,
      contactEmail,
      notes,
    } = req.body;

    // Verify provider exists
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Calculate platform fee (10% of service price)
    const platformFee = service.price * 0.10;
    const totalAmount = service.price + platformFee;

    const booking = await Booking.create({
      customer: req.user._id,
      provider: providerId,
      service,
      scheduledDate,
      scheduledTime,
      address,
      contactPhone,
      contactEmail,
      notes,
      platformFee,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
    });

    await notifyBookingCreated(booking, req.user._id, providerId);

    // Populate customer and provider info
    await booking.populate('customer', 'name email phone');
    await booking.populate('provider', 'name email phone providerInfo');

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    const { status, role } = req.query;

    let query = {};

    // If user is provider, show bookings where they are the provider
    // If customer, show bookings where they are the customer
    if (role === 'provider') {
      query.provider = req.user._id;
    } else {
      query.customer = req.user._id;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone providerInfo')
      .sort({ createdAt: -1 });

    res.json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone providerInfo');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (
      booking.customer._id.toString() !== req.user._id.toString() &&
      booking.provider._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isProvider = booking.provider.toString() === req.user._id.toString();

    if (!isCustomer && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    const { status, paymentStatus } = req.body;
    const oldStatus = booking.status; 

    // Update status
    if (status) {
      // Only provider can confirm
      if (status === 'confirmed' && !isProvider) {
        return res.status(403).json({ message: 'Only provider can confirm booking' });
      }
      
      // Only customer can mark as completed
      if (status === 'completed' && !isCustomer) {
        return res.status(403).json({ message: 'Only customer can mark as completed' });
      }

      booking.status = status;

      // If completed, update provider stats
      if (status === 'completed') {
        await User.findByIdAndUpdate(booking.provider, {
          $inc: { 'providerInfo.completedJobs': 1 },
        });
      }
    }

    // Update payment status
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();

    await booking.populate('customer', 'name email phone');
    await booking.populate('provider', 'name email phone');

    // ✅ Create notifications if status changed
    if (status && status !== oldStatus) {
      await notifyBookingStatusUpdate(
        booking,
        booking.customer._id,
        booking.provider._id,
        status
      );
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized
    if (
      booking.customer.toString() !== req.user._id.toString() &&
      booking.provider.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Can't cancel if already completed
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};