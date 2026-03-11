const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getStats = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const activeProviders = await User.countDocuments({ 
      role: 'provider', 
      isActive: true 
    });
    
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const inProgressBookings = await Booking.countDocuments({ status: 'in-progress' });
    
    // Calculate revenue from completed bookings
    const revenueData = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Calculate monthly revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenueData = await Booking.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1)
          }
        } 
      },
      { $group: { _id: null, total: { $sum: '$platformFee' } } }
    ]);
    const monthlyRevenue = monthlyRevenueData.length > 0 ? monthlyRevenueData[0].total : 0;

    // Calculate growth percentages (mock for now - you can implement real calculation)
    const userGrowth = 12;
    const providerGrowth = 8;
    const bookingGrowth = 15;
    const revenueGrowth = 23;

    res.json({
      totalUsers,
      totalCustomers,
      totalProviders,
      activeProviders,
      totalBookings,
      completedBookings,
      pendingBookings,
      inProgressBookings,
      totalRevenue,
      totalReviews,
      monthlyRevenue,
      growth: {
        users: userGrowth,
        providers: providerGrowth,
        bookings: bookingGrowth,
        revenue: revenueGrowth,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get recent activity
// @route   GET /api/admin/activity
// @access  Private (Admin only)
const getRecentActivity = async (req, res) => {
  try {
    // Get recent users (last 10)
    const recentUsers = await User.find({ role: { $ne: 'admin' } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name role createdAt');

    // Get recent bookings (last 10)
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'name')
      .populate('provider', 'name')
      .select('customer provider service status createdAt');

    // Get recent reviews (last 10)
    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'name')
      .populate('provider', 'name')
      .select('customer provider rating createdAt');

    // Combine and sort all activities
    const activities = [];

    recentUsers.forEach(user => {
      activities.push({
        type: 'user',
        icon: '👤',
        title: 'New user registered',
        description: `${user.name} joined as a ${user.role}`,
        time: user.createdAt,
      });
    });

    recentBookings.forEach(booking => {
      activities.push({
        type: 'booking',
        icon: '📅',
        title: booking.status === 'completed' ? 'Booking completed' : 'New booking',
        description: `${booking.service.name} by ${booking.provider.name}`,
        time: booking.createdAt,
      });
    });

    recentReviews.forEach(review => {
      activities.push({
        type: 'review',
        icon: '⭐',
        title: 'New review posted',
        description: `${review.rating}-star review for ${review.provider.name}`,
        time: review.createdAt,
      });
    });

    // Sort by time and get latest 10
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const latestActivities = activities.slice(0, 10);

    res.json({ activities: latestActivities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { search, filter } = req.query;

    let query = { role: { $ne: 'admin' } };

    // Apply filters
    if (filter === 'customers') {
      query.role = 'customer';
    } else if (filter === 'providers') {
      query.role = 'provider';
    } else if (filter === 'active') {
      query.isActive = true;
    } else if (filter === 'inactive') {
      query.isActive = false;
    }

    // Apply search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all providers with filters
// @route   GET /api/admin/providers
// @access  Private (Admin only)
const getAllProviders = async (req, res) => {
  try {
    const { search, filter } = req.query;

    let query = { role: 'provider' };

    // Apply filters
    if (filter === 'verified') {
      query['providerInfo.verified'] = true;
    } else if (filter === 'pending') {
      query['providerInfo.verified'] = false;
    } else if (filter === 'suspended') {
      query.isActive = false;
    }

    // Apply search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const providers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({ providers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify a provider
// @route   PUT /api/admin/providers/:id/verify
// @access  Private (Admin only)
const verifyProvider = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);

    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }

    provider.providerInfo.verified = true;
    await provider.save();

    res.json({ message: 'Provider verified successfully', provider });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all bookings with filters
// @route   GET /api/admin/bookings
// @access  Private (Admin only)
const getAllBookings = async (req, res) => {
  try {
    const { search, filter } = req.query;

    let query = {};

    // Apply status filter
    if (filter && filter !== 'all') {
      query.status = filter;
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .sort({ createdAt: -1 });
    
    // Apply search after population
    let filteredBookings = bookings;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBookings = bookings.filter(booking => 
        booking._id.toString().includes(search) ||
        booking.customer.name.toLowerCase().includes(searchLower) ||
        booking.provider.name.toLowerCase().includes(searchLower) ||
        booking.service.name.toLowerCase().includes(searchLower)
      );
    }

    res.json({ bookings: filteredBookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all reviews with filters
// @route   GET /api/admin/reviews
// @access  Private (Admin only)
const getAllReviews = async (req, res) => {
  try {
    const { filter } = req.query;

    let query = {};

    // Apply status filter
    if (filter && filter !== 'all') {
      query.status = filter;
    }

    const reviews = await Review.find(query)
      .populate('customer', 'name')
      .populate('provider', 'name')
      .populate('booking', 'service')
      .sort({ createdAt: -1 });
    
    res.json({ reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update review status
// @route   PUT /api/admin/reviews/:id/status
// @access  Private (Admin only)
const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('customer', 'name')
      .populate('provider', 'name')
      .populate('booking', 'service');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Suspend/unsuspend a user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin only)
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'reactivated' : 'suspended'}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export all functions
module.exports = {
  getStats,
  getRecentActivity,
  getAllUsers,
  getAllProviders,
  verifyProvider,
  getAllBookings,
  getAllReviews,
  updateReviewStatus,
  suspendUser,
};