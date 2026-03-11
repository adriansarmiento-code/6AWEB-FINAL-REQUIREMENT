const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['customer', 'provider', 'admin'],
      default: 'customer',
    },
    profileImage: {
      type: String, // Will store Base64 string
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Provider-specific fields
    providerInfo: {
      category: {
        type: String,
        enum: ['plumbing', 'electrical', 'cleaning', 'carpentry', 'painting', 'hvac', 'landscaping', 'appliance-repair', 'other'],
      },
      serviceArea: {
        type: String,
        default: 'Angeles City Center',
      },
      neighborhoods: [{
        type: String,
      }], // e.g., ['Balibago', 'Nepo Mall Area', 'Marquee Mall Area']
      yearsExperience: {
        type: Number,
        min: 0,
      },
      hourlyRate: {
        type: Number,
        min: 0,
      },
      bio: {
        type: String,
        maxlength: 1000,
      },
      skills: [String],
      services: [
        {
          name: {
            type: String,
            required: true,
          },
          description: String,
          price: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      verified: {
        type: Boolean,
        default: false,
      },
      completedJobs: {
        type: Number,
        default: 0,
      },
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      reviewCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);