const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    response: {
      text: String,
      date: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'flagged', 'removed'],
      default: 'approved',
    },
  },
  {
    timestamps: true,
  }
);

// Update provider rating when review is saved
reviewSchema.post('save', async function () {
  const User = mongoose.model('User');
  
  const reviews = await mongoose.model('Review').find({
    provider: this.provider,
    status: 'approved',
  });

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  await User.findByIdAndUpdate(this.provider, {
    'providerInfo.rating': averageRating,
    'providerInfo.reviewCount': reviews.length,
  });
});

module.exports = mongoose.model('Review', reviewSchema);