const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Place = require('../models/Place');
const { processHormuudPayment } = require('./hormuudPaymentHelper');

// Tourist: Create a new booking
exports.createBooking = async (req, res) => {
    const { placeId, bookingDate, numberOfPeople } = req.body;
    const userId = req.user._id; // From auth middleware

    try {
        console.log('Creating booking:', { placeId, bookingDate, numberOfPeople, userId });
        
        const place = await Place.findById(placeId);

        if (!place) {
            console.log('Place not found:', placeId);
            return res.status(404).json({ message: 'Place not found' });
        }

        // Basic availability check (can be more sophisticated)
        const requestedDate = new Date(bookingDate);
        
        // Skip availability check for now (allow all dates for testing)
        console.log('📅 Skipping availability check for testing purposes');

        if (numberOfPeople > place.maxCapacity) {
            return res.status(400).json({ message: `Number of people exceeds maximum capacity of ${place.maxCapacity}.` });
        }

        const totalPrice = place.pricePerPerson * numberOfPeople;

        const bookingData = {
            user: userId,
            place: placeId,
            bookingDate: requestedDate,
            numberOfPeople,
            totalPrice,
            status: 'pending', // Initial status
            paymentStatus: 'pending' // Initial payment status
        };

        console.log('📝 Creating booking with data:', bookingData);
        console.log('🔍 MongoDB connection state:', mongoose.connection.readyState); // 1 = connected
        console.log('🏛️ Database name:', mongoose.connection.name);

        const booking = new Booking(bookingData);
        console.log('📋 Booking model created, attempting save...');

        const createdBooking = await booking.save();
        console.log('✅ Booking saved to database successfully!');
        console.log('🆔 Booking ID:', createdBooking._id);
        console.log('💾 Database document:', createdBooking.toObject());
        
        // Verify the booking was actually saved by querying it back
        const verifyBooking = await Booking.findById(createdBooking._id);
        if (verifyBooking) {
            console.log('✅ Verification: Booking found in database');
        } else {
            console.log('❌ Verification: Booking NOT found in database!');
        }
        
        // Populate the place details for the response
        await createdBooking.populate('place', 'name_eng name_som location pricePerPerson');
        
        // If this request includes payment information, process Hormuud payment
        const { userFullName, userAccountNo, timeSlot } = req.body;
        
        if (userFullName && userAccountNo && timeSlot) {
            console.log('🔄 Processing Hormuud payment for booking:', createdBooking._id);
            
            try {
                // Create payment record and process with Hormuud
                const paymentResult = await processHormuudPayment({
                    booking: createdBooking,
                    place: place,
                    userFullName,
                    userAccountNo,
                    timeSlot,
                    userId: userId.toString()
                });
                
                if (paymentResult.success) {
                    // Update booking status based on payment success
                    createdBooking.status = 'confirmed';
                    createdBooking.paymentStatus = 'paid';
                    await createdBooking.save();
                    
                    console.log('✅ Hormuud payment successful, booking confirmed');
                    
                    res.status(201).json({
                        success: true,
                        message: 'Booking created and payment successful',
                        data: {
                            ...createdBooking.toObject(),
                            paymentData: paymentResult.data,
                            hormuudPayment: true
                        }
                    });
                } else {
                    console.log('❌ Hormuud payment failed, marking as failed');
                    
                    // Update booking status to reflect payment failure
                    createdBooking.status = 'pending';
                    createdBooking.paymentStatus = 'failed';
                    await createdBooking.save();
                    
                    res.status(400).json({
                        success: false,
                        message: 'Payment failed',
                        data: {
                            ...createdBooking.toObject(),
                            paymentError: paymentResult.error,
                            hormuudPayment: false
                        }
                    });
                }
            } catch (paymentError) {
                console.error('Payment processing error:', paymentError);
                
                // Mark booking as failed due to payment error
                createdBooking.status = 'pending';
                createdBooking.paymentStatus = 'failed';
                await createdBooking.save();
                
                res.status(400).json({
                    success: false,
                    message: 'Payment processing failed',
                    data: {
                        ...createdBooking.toObject(),
                        paymentError: paymentError.message,
                        hormuudPayment: false
                    }
                });
            }
        } else {
            // No payment information provided, just return the booking
            res.status(201).json(createdBooking);
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: error.message });
    }
};

// Tourist: Get user's bookings
exports.getUserBookings = async (req, res) => {
    try {
        // Handle both /my-bookings and /user/:userId routes
        const userId = req.params.userId || req.user._id;
        
        // Security check: users can only access their own bookings unless they're admin
        if (req.user.role !== 'admin' && userId !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied. You can only view your own bookings.' });
        }
        
        const bookings = await Booking.find({ user: userId })
            .populate('place', 'name_eng name_som location pricePerPerson maxCapacity');
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        console.log('🔍 Fetching all bookings with population...');
        
        const bookings = await Booking.find({})
            .populate('user', 'username email full_name')
            .populate('place', 'name_eng name_som location pricePerPerson maxCapacity');
        
        console.log(`📊 Found ${bookings.length} bookings`);
        
        // Debug: Check first booking structure
        if (bookings.length > 0) {
            const firstBooking = bookings[0];
            console.log('🔍 First booking structure:');
            console.log('- User:', typeof firstBooking.user, firstBooking.user);
            console.log('- Place:', typeof firstBooking.place, firstBooking.place);
            console.log('- Place name_eng:', firstBooking.place?.name_eng);
        }
        
        res.json(bookings);
    } catch (error) {
        console.error('❌ Error fetching all bookings:', error);
        res.status(500).json({ message: error.message });
    }
};

// Admin: Update booking status
exports.updateBookingStatus = async (req, res) => {
    const { status, paymentStatus } = req.body;

    try {
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            booking.status = status || booking.status;
            booking.paymentStatus = paymentStatus || booking.paymentStatus;

            const updatedBooking = await booking.save();
            res.json(updatedBooking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Placeholder for Hormuud payment initiation
exports.initiateHormuudPayment = async (req, res) => {
    const { bookingId } = req.body;

    try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // --- This is where you would integrate with Hormuud API ---
        // Example: Call Hormuud API with booking.totalPrice and other details
        // const paymentResponse = await axios.post('HORMUUD_API_ENDPOINT', {
        //     amount: booking.totalPrice,
        //     currency: 'USD', // Or SOS
        //     callbackUrl: 'YOUR_CALLBACK_URL',
        //     // ... other required parameters
        // });

        // If payment initiation is successful, update paymentStatus to 'pending' (if not already)
        // and return a payment URL or confirmation.
        // For now, we'll simulate success.
        booking.paymentStatus = 'pending'; // Or 'initiated'
        await booking.save();

        res.json({
            message: 'Hormuud payment initiated successfully (simulated).',
            paymentUrl: 'https://example.com/hormuud-payment-gateway-redirect' // Placeholder URL
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get booking details by ID
exports.getBookingDetails = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('place', 'name_eng name_som location pricePerPerson maxCapacity');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        console.log('🔍 Booking details:', {
            id: booking._id,
            place: booking.place,
            placeType: typeof booking.place,
            placeName: booking.place?.name_eng
        });
        
        res.json(booking);
    } catch (error) {
        console.error('❌ Error fetching booking details:', error);
        res.status(500).json({ message: error.message });
    }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }
        booking.status = 'cancelled';
        await booking.save();
        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Placeholder for Hormuud payment callback/webhook
exports.handleHormuudCallback = async (req, res) => {
    // This endpoint would be called by Hormuud after a payment attempt.
    // You would verify the payment status and update your booking.

    const { transactionId, status, bookingId } = req.body; // Example parameters from Hormuud callback

    try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (status === 'success') {
            booking.paymentStatus = 'paid';
            booking.status = 'confirmed'; // Confirm booking after successful payment
            await booking.save();
            res.status(200).json({ message: 'Payment successful and booking confirmed.' });
        } else {
            booking.paymentStatus = 'failed';
            await booking.save();
            res.status(400).json({ message: 'Payment failed.' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};