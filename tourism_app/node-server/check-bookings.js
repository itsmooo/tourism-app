require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./src/models/Booking');
const User = require('./src/models/User');
const Place = require('./src/models/Place');

async function checkBookings() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        const count = await Booking.countDocuments();
        console.log('📊 Total bookings in database:', count);
        
        const bookings = await Booking.find()
            .populate('user', 'email')
            .populate('place', 'name_eng')
            .sort({createdAt: -1});
        
        console.log('\n📋 All bookings:');
        if (bookings.length === 0) {
            console.log('   ❌ No bookings found in database');
        } else {
            bookings.forEach((booking, index) => {
                console.log(`   ${index + 1}. ${booking.user?.email || 'Unknown'} -> ${booking.place?.name_eng || 'Unknown Place'}`);
                console.log(`      Status: ${booking.status}, Price: $${booking.totalPrice}, Date: ${booking.bookingDate}`);
                console.log(`      Created: ${booking.createdAt}`);
                console.log('');
            });
        }
        
        await mongoose.connection.close();
        console.log('🔌 Connection closed');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkBookings();
