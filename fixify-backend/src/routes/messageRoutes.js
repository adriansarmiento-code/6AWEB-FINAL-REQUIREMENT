const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getConversations);
router.get('/:otherUserId', protect, getMessages);
router.post('/:otherUserId', protect, sendMessage);

module.exports = router;