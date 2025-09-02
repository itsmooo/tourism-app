const express = require('express');
const { createBooking, getUserBookings, getAllBookings, updateBookingStatus, initiateHormuudPayment, handleHormuudCallback, getBookingDetails, cancelBooking } = require('../controllers/bookingController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Tourist routes (admins can also create bookings for testing)
router.post('/', protect, authorizeRoles('tourist', 'admin'), createBooking);
router.get('/my-bookings', protect, authorizeRoles('tourist', 'admin'), getUserBookings);
router.get('/user/:userId', protect, authorizeRoles('tourist', 'admin'), getUserBookings);
router.post('/payment/initiate', protect, authorizeRoles('tourist', 'admin'), initiateHormuudPayment); // Tourist initiates payment

// Admin routes
router.get('/', protect, authorizeRoles('admin'), getAllBookings);
router.get('/:id', protect, authorizeRoles('tourist', 'admin'), getBookingDetails);
router.put('/:id/status', protect, authorizeRoles('admin'), updateBookingStatus);
router.delete('/:id', protect, authorizeRoles('tourist', 'admin'), cancelBooking);

// Public route for payment gateway callback (no auth needed as it's from Hormuud)
router.post('/payment-callback', handleHormuudCallback);

module.exports = router;