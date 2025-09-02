const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const Booking = require('./src/models/Booking');
const User = require('./src/models/User');
const Place = require('./src/models/Place');

async function testMongoDBConnection() {
    try {
        console.log('🔄 Testing MongoDB connection...');
        console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set ✅' : 'Not set ❌');
        
        if (!process.env.MONGO_URI) {
            console.log('❌ MONGO_URI is not set in environment variables');
            return;
        }

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully');
        console.log('📍 Database name:', mongoose.connection.name);
        console.log('🔗 Connection host:', mongoose.connection.host);

        // Test database operations
        console.log('\n🧪 Testing database operations...');

        // 1. Check if collections exist
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📂 Available collections:');
        collections.forEach(col => console.log(`   - ${col.name}`));

        // 2. Count documents in each collection
        console.log('\n📊 Document counts:');
        try {
            const userCount = await User.countDocuments();
            console.log(`   - Users: ${userCount}`);
        } catch (err) {
            console.log(`   - Users: Error - ${err.message}`);
        }

        try {
            const placeCount = await Place.countDocuments();
            console.log(`   - Places: ${placeCount}`);
        } catch (err) {
            console.log(`   - Places: Error - ${err.message}`);
        }

        try {
            const bookingCount = await Booking.countDocuments();
            console.log(`   - Bookings: ${bookingCount}`);
        } catch (err) {
            console.log(`   - Bookings: Error - ${err.message}`);
        }

        // 3. Test creating a booking (if we have users and places)
        const users = await User.find().limit(1);
        const places = await Place.find().limit(1);

        if (users.length > 0 && places.length > 0) {
            console.log('\n🎯 Testing booking creation...');
            
            const testBooking = new Booking({
                user: users[0]._id,
                place: places[0]._id,
                bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                numberOfPeople: 2,
                totalPrice: places[0].pricePerPerson * 2,
                status: 'pending',
                paymentStatus: 'pending'
            });

            console.log('📝 Attempting to save test booking...');
            const savedBooking = await testBooking.save();
            console.log('✅ Test booking saved successfully!');
            console.log('🆔 Booking ID:', savedBooking._id);

            // Clean up - delete the test booking
            await Booking.findByIdAndDelete(savedBooking._id);
            console.log('🧹 Test booking cleaned up');
        } else {
            console.log('\n⚠️ Cannot test booking creation - missing users or places');
            console.log(`   Users found: ${users.length}`);
            console.log(`   Places found: ${places.length}`);
        }

        console.log('\n🎉 MongoDB connection test completed successfully!');

    } catch (error) {
        console.error('❌ MongoDB connection test failed:', error.message);
        if (error.code === 8000) {
            console.log('💡 This looks like an authentication error. Check your MongoDB credentials.');
        }
        if (error.code === 'ENOTFOUND') {
            console.log('💡 This looks like a network error. Check your internet connection.');
        }
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('🔌 MongoDB connection closed');
        }
    }
}

// Run the test
testMongoDBConnection();
