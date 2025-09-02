// Simple test to isolate the mongoose error
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Import the models to test if they load properly
console.log('Testing model imports...');

try {
    const Booking = require('./src/models/Booking');
    console.log('✅ Booking model imported successfully');
    
    const Place = require('./src/models/Place');
    console.log('✅ Place model imported successfully');
    
    const User = require('./src/models/User');
    console.log('✅ User model imported successfully');
    
    // Test the controller import
    const bookingController = require('./src/controllers/bookingController');
    console.log('✅ Booking controller imported successfully');
    console.log('📋 Available methods:', Object.keys(bookingController));
    
} catch (error) {
    console.error('❌ Import error:', error.message);
    console.error('Stack:', error.stack);
}
