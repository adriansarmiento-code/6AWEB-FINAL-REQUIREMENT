const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
        },
        duration: String, // e.g., "1 hour", "2 hours"
      },
    ],
    availability: {
      monday: { available: Boolean, hours: String },
      tuesday: { available: Boolean, hours: String },
      wednesday: { available: Boolean, hours: String },
      thursday: { available: Boolean, hours: String },
      friday: { available: Boolean, hours: String },
      saturday: { available: Boolean, hours: String },
      sunday: { available: Boolean, hours: String },
    },
    location: {
      address: String,
      city: String,
      province: String,
      coordinates: {
        type: { type: String, default: 'Point' },
        coordinates: [Number], // [longitude, latitude]
      },
    },
    serviceRadius: {
      type: Number,
      default: 10, // kilometers
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
providerSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Provider', providerSchema);