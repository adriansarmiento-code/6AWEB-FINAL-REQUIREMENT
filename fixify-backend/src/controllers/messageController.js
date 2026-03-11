const Message = require('../models/Message');
const User = require('../models/User');
const { notifyNewMessage } = require('../utils/notificationService');

// Helper to create conversation ID (always alphabetically sorted)
const createConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
    .populate('sender', 'name email phone profileImage')
    .populate('receiver', 'name email phone profileImage')
      .sort({ createdAt: -1 });

    // Group by conversation and get latest message
    const conversationsMap = new Map();

    messages.forEach((msg) => {
      const convId = msg.conversation;
      
      if (!conversationsMap.has(convId)) {
        const otherUser = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
        
        conversationsMap.set(convId, {
          conversationId: convId,
          otherUser: {
            _id: otherUser._id,
            name: otherUser.name,
            email: otherUser.email, 
            phone: otherUser.phone,
            profileImage: otherUser.profileImage,
          },
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
        });
      }
      
      // Count unread messages
      if (!msg.read && msg.receiver._id.toString() === userId) {
        conversationsMap.get(convId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json({ conversations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:otherUserId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const otherUserId = req.params.otherUserId;

    const conversationId = createConversationId(userId, otherUserId);

    const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name email phone profileImage') 
    .populate('receiver', 'name email phone profileImage') 
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        read: false,
      },
      { read: true }
    );

    res.json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages/:otherUserId
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const otherUserId = req.params.otherUserId;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    // Verify other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const conversationId = createConversationId(userId, otherUserId);

    const newMessage = await Message.create({
      conversation: conversationId,
      sender: userId,
      receiver: otherUserId,
      message: message.trim(),
    });

    await newMessage.populate('sender', 'name profileImage');
    await newMessage.populate('receiver', 'name profileImage');

    await notifyNewMessage(userId, otherUserId, req.user.name);
    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export all functions at once
module.exports = {
  getConversations,
  getMessages,
  sendMessage,
};