const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, providerInfo } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user object
    const userData = {
      name,
      email,
      phone,
      password,
      role: role || 'customer',
    };

    // Add provider info if role is provider
    if (role === 'provider' && providerInfo) {
      // Add default services based on category
      const defaultServices = getDefaultServicesByCategory(providerInfo.category);
      
      userData.providerInfo = {
        ...providerInfo,
        services: defaultServices, // Add default services
      };
    }

    // Create user
    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage, 
        providerInfo: user.providerInfo,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      
      // If provider, allow updating provider info
      if (req.body.providerInfo && user.role === 'provider') {
        user.providerInfo = { ...user.providerInfo, ...req.body.providerInfo };
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        providerInfo: updatedUser.providerInfo,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to get default services by category
function getDefaultServicesByCategory(category) {
  const serviceTemplates = {
    plumbing: [
      { name: 'Emergency Leak Repair', description: 'Fix urgent leaks and pipe issues', price: 800 },
      { name: 'Drain Cleaning', description: 'Unclog drains and sewers', price: 500 },
      { name: 'Fixture Installation', description: 'Install sinks, faucets, toilets', price: 1000 },
    ],
    electrical: [
      { name: 'Wiring Repair', description: 'Fix electrical wiring issues', price: 1200 },
      { name: 'Outlet Installation', description: 'Install new electrical outlets', price: 600 },
      { name: 'Light Fixture Setup', description: 'Install ceiling lights and fixtures', price: 800 },
    ],
    cleaning: [
      { name: 'Deep Cleaning', description: 'Thorough cleaning of entire space', price: 1500 },
      { name: 'Regular Cleaning', description: 'Standard cleaning service', price: 800 },
      { name: 'Move-in/Move-out', description: 'Cleaning for moving situations', price: 2000 },
    ],
    carpentry: [
      { name: 'Furniture Repair', description: 'Fix broken furniture', price: 900 },
      { name: 'Custom Cabinet', description: 'Build custom cabinets', price: 3000 },
      { name: 'Door Installation', description: 'Install or repair doors', price: 1500 },
    ],
  };

  return serviceTemplates[category] || [
    { name: 'General Service', description: 'Basic service offering', price: 500 },
  ];
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage, // ✅ ADD THIS
        providerInfo: user.providerInfo,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage, 
      providerInfo: user.providerInfo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      
      if (req.body.providerInfo && user.role === 'provider') {
        user.providerInfo = { ...user.providerInfo, ...req.body.providerInfo };
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        providerInfo: updatedUser.providerInfo,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};