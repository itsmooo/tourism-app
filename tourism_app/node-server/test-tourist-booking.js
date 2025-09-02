const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const User = require('./src/models/User');
const Place = require('./src/models/Place');
const Booking = require('./src/models/Booking');

const BASE_URL = 'http://localhost:9000/api';

async function testTouristBooking() {
    try {
        console.log('🧪 Testing Tourist Booking Flow...\n');

        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get a tourist user
        const tourists = await User.find({ role: 'tourist' }).limit(5);
        const places = await Place.find().limit(1);

        if (tourists.length === 0) {
            console.log('❌ No tourist users found in database');
            return;
        }

        if (places.length === 0) {
            console.log('❌ No places found in database');
            return;
        }

        const testPlace = places[0];
        console.log(`🏖️ Using place: ${testPlace.name_eng} (ID: ${testPlace._id})`);
        console.log(`💰 Price per person: $${testPlace.pricePerPerson}`);

        // Try different tourist users
        for (let i = 0; i < Math.min(tourists.length, 3); i++) {
            const tourist = tourists[i];
            console.log(`\n👤 Testing with tourist: ${tourist.email}`);

            // Test common passwords for tourist accounts
            const testPasswords = ['password123', '123456', 'tourist123', 'password', tourist.username];
            let authToken = null;

            for (const password of testPasswords) {
                try {
                    console.log(`🔑 Trying password: ${password}`);
                    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                        email: tourist.email,
                        password: password
                    });
                    
                    authToken = loginResponse.data.token;
                    console.log('✅ Login successful!');
                    console.log(`🎫 Token: ${authToken.substring(0, 20)}...`);
                    break;
                } catch (loginError) {
                    console.log(`❌ Password ${password} failed: ${loginError.response?.data?.message || loginError.message}`);
                    continue;
                }
            }

            if (authToken) {
                // Test the booking creation
                console.log('\n📋 Creating booking via API...');
                
                const bookingData = {
                    placeId: testPlace._id.toString(),
                    bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    numberOfPeople: 2
                };

                console.log('📤 Booking request data:', bookingData);

                try {
                    const bookingResponse = await axios.post(
                        `${BASE_URL}/bookings`,
                        bookingData,
                        {
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    
                    console.log('✅ Booking created successfully via API!');
                    console.log('📋 Response data:', bookingResponse.data);
                    
                    // Verify it was saved in database
                    const savedBooking = await Booking.findById(bookingResponse.data._id);
                    if (savedBooking) {
                        console.log('✅ Booking confirmed in database!');
                        console.log(`🆔 Database booking ID: ${savedBooking._id}`);
                    } else {
                        console.log('❌ Booking not found in database!');
                    }
                    
                    break; // Success, no need to try more users
                    
                } catch (bookingError) {
                    console.log('❌ Booking creation failed');
                    console.log('📥 Error status:', bookingError.response?.status);
                    console.log('📥 Error data:', bookingError.response?.data);
                    console.log('📥 Full error:', bookingError.message);
                }
            } else {
                console.log(`❌ Could not authenticate tourist: ${tourist.email}`);
            }
        }

        // Check final booking count
        console.log('\n📊 Final booking count check...');
        const finalBookingCount = await Booking.countDocuments();
        console.log(`Total bookings in database: ${finalBookingCount}`);

        // Show all recent bookings
        const recentBookings = await Booking.find()
            .populate('user', 'email role')
            .populate('place', 'name_eng')
            .sort({ createdAt: -1 })
            .limit(5);
        
        console.log('\n📋 Recent bookings:');
        recentBookings.forEach((booking, index) => {
            console.log(`   ${index + 1}. ${booking.user?.email} (${booking.user?.role}) -> ${booking.place?.name_eng} (${booking.status})`);
        });

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n🔌 MongoDB connection closed');
        }
    }
}

// Run the test
testTouristBooking();
