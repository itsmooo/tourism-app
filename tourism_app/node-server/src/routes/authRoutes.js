const express = require('express');
const { registerUser, loginUser, verifyToken, refreshToken, updateProfile, updateUserActivity } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify', verifyToken);
router.post('/refresh', refreshToken);
router.put('/profile', updateProfile);
router.put('/activity', protect, updateUserActivity);

module.exports = router;