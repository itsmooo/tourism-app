const express = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Protected routes - admins and co-workers can view, only admins can modify
router.get('/', protect, authorizeRoles('admin', 'co-worker'), getAllUsers);
router.get('/:id', protect, authorizeRoles('admin', 'co-worker'), getUserById);
router.put('/:id', protect, authorizeRoles('admin'), updateUser);
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);

module.exports = router;
