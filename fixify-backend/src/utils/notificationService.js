const Notification = require('../models/Notification');

// Create a notification
const createNotification = async (userId, type, title, message, options = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      relatedId: options.relatedId,
      relatedModel: options.relatedModel,
      link: options.link,
    });

    console.log(`✅ Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
  }
};

// Booking-related notifications
const notifyBookingCreated = async (booking, customerId, providerId) => {
  // Notify customer
  await createNotification(
    customerId,
    'booking',
    'Booking Confirmed',
    `Your booking for ${booking.service.name} has been created and sent to the provider.`,
    {
      relatedId: booking._id,
      relatedModel: 'Booking',
      link: '/dashboard',
    }
  );

  // Notify provider
  await createNotification(
    providerId,
    'booking',
    'New Booking Request',
    `You have a new booking request for ${booking.service.name}.`,
    {
      relatedId: booking._id,
      relatedModel: 'Booking',
      link: '/provider-dashboard',
    }
  );
};

const notifyBookingStatusUpdate = async (booking, customerId, providerId, newStatus) => {
  const statusMessages = {
    confirmed: {
      customerTitle: 'Booking Confirmed',
      customerMessage: 'Your booking has been confirmed by the provider!',
    },
    'in-progress': {
      customerTitle: 'Service Started',
      customerMessage: 'Your service provider has started working on your request.',
    },
    completed: {
      customerTitle: 'Service Completed',
      customerMessage: 'Your service has been completed. Please leave a review!',
      providerTitle: 'Service Marked Complete',
      providerMessage: 'Customer marked the service as complete. Payment will be released.',
    },
    cancelled: {
      customerTitle: 'Booking Cancelled',
      customerMessage: 'Your booking has been cancelled.',
      providerTitle: 'Booking Cancelled',
      providerMessage: 'The booking has been cancelled by the customer.',
    },
  };

  const status = statusMessages[newStatus];

  if (status) {
    // Notify customer
    await createNotification(
      customerId,
      'booking',
      status.customerTitle,
      status.customerMessage,
      {
        relatedId: booking._id,
        relatedModel: 'Booking',
        link: '/dashboard',
      }
    );

    // Notify provider if there's a provider message
    if (status.providerTitle && status.providerMessage) {
      await createNotification(
        providerId,
        'booking',
        status.providerTitle,
        status.providerMessage,
        {
          relatedId: booking._id,
          relatedModel: 'Booking',
          link: '/provider-dashboard',
        }
      );
    }
  }
};

// Message notifications
const notifyNewMessage = async (senderId, receiverId, senderName) => {
  await createNotification(
    receiverId,
    'message',
    'New Message',
    `You have a new message from ${senderName}.`,
    {
      relatedId: senderId,
      relatedModel: 'Message',
      link: `/messages/${senderId}`,
    }
  );
};

// Review notifications
const notifyNewReview = async (review, providerId, customerName, rating) => {
  await createNotification(
    providerId,
    'review',
    'New Review Received',
    `${customerName} left a ${rating}-star review for your service.`,
    {
      relatedId: review._id,
      relatedModel: 'Review',
      link: '/provider-dashboard',
    }
  );
};

// Payment notifications
const notifyPaymentReceived = async (booking, providerId) => {
  await createNotification(
    providerId,
    'payment',
    'Payment Released',
    `Payment of ₱${booking.service.price} has been released for your completed service.`,
    {
      relatedId: booking._id,
      relatedModel: 'Booking',
      link: '/provider-dashboard',
    }
  );
};

module.exports = {
  createNotification,
  notifyBookingCreated,
  notifyBookingStatusUpdate,
  notifyNewMessage,
  notifyNewReview,
  notifyPaymentReceived,
};