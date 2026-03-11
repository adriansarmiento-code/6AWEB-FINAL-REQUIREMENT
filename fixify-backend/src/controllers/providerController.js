const User = require('../models/User');
const Provider = require('../models/Provider');

// @desc    Get all providers with filters
// @route   GET /api/providers
// @access  Public
exports.getProviders = async (req, res) => {
  try {
    const { category, minRating, maxDistance, verified, sort, serviceArea } = req.query;

    let query = { role: 'provider', isActive: true };

    if (category) {
      query['providerInfo.category'] = category;
    }

    if (minRating) {
      query['providerInfo.rating'] = { $gte: parseFloat(minRating) };
    }

    if (verified === 'true') {
      query['providerInfo.verified'] = true;
    }
    
    if (serviceArea) {
      query['providerInfo.serviceArea'] = serviceArea;
    }

    let providers = await User.find(query).select('-password');

    // Sort results
    if (sort === 'rating') {
      providers.sort((a, b) => (b.providerInfo?.rating || 0) - (a.providerInfo?.rating || 0));
    } else if (sort === 'price-low') {
      providers.sort((a, b) => (a.providerInfo?.hourlyRate || 0) - (b.providerInfo?.hourlyRate || 0));
    } else if (sort === 'price-high') {
      providers.sort((a, b) => (b.providerInfo?.hourlyRate || 0) - (a.providerInfo?.hourlyRate || 0));
    } else if (sort === 'experience') {
      providers.sort((a, b) => (b.providerInfo?.yearsExperience || 0) - (a.providerInfo?.yearsExperience || 0));
    } else if (sort === 'reviews') {
      providers.sort((a, b) => (b.providerInfo?.reviewCount || 0) - (a.providerInfo?.reviewCount || 0));
    }


    res.json({
      count: providers.length, 
      providers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single provider by ID
// @route   GET /api/providers/:id
// @access  Public
exports.getProviderById = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id).select('-password');

    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Get additional provider details if exists
    const providerDetails = await Provider.findOne({ user: req.params.id });

    res.json({
      ...provider.toObject(),
      details: providerDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update provider profile
// @route   PUT /api/providers/:id
// @access  Private (Provider only)
exports.updateProvider = async (req, res) => {
  try {
    // Check if user owns this provider profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Update user fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.providerInfo) {
      user.providerInfo = { ...user.providerInfo, ...req.body.providerInfo };
    }

    const updatedUser = await user.save();

    // Update or create provider details
    if (req.body.services || req.body.availability || req.body.location) {
      await Provider.findOneAndUpdate(
        { user: req.params.id },
        {
          services: req.body.services,
          availability: req.body.availability,
          location: req.body.location,
          serviceRadius: req.body.serviceRadius,
        },
        { upsert: true, new: true }
      );
    }

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};