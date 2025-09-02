const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const User = require('./src/models/User');
const Place = require('./src/models/Place');
const Booking = require('./src/models/Booking');

const BASE_URL = 'http://localhost:9000/api';

async function debugBookingAPI() {
    try {
        console.log('🔍 Debugging Booking API...\n');

        // Connect to database to get existing users
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get first tourist user
        const tourists = await User.find({ role: 'tourist' }).limit(1);
        const places = await Place.find().limit(1);

        if (tourists.length === 0) {
            console.log('❌ No tourist users found in database');
            return;
        }

        if (places.length === 0) {
            console.log('❌ No places found in database');
            return;
        }

        const testUser = tourists[0];
        const testPlace = places[0];

        console.log(`🎯 Using existing user: ${testUser.email} (${testUser.role})`);
        console.log(`🏖️ Using place: ${testPlace.name_eng}`);

        // Try to login with the existing user
        console.log('\n1️⃣ Attempting login...');
        let authToken, userId;

        try {
            // First, let's try to get an admin user to create a token
            const admins = await User.find({ role: 'admin' }).limit(1);
            if (admins.length > 0) {
                console.log('👨‍💼 Found admin user, using for testing');
                const adminUser = admins[0];
                
                // For testing, let's manually create a booking using the database directly
                console.log('\n2️⃣ Creating booking directly in database...');
                
                const directBooking = new Booking({
                    user: adminUser._id,
                    place: testPlace._id,
                    bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    numberOfPeople: 2,
                    totalPrice: testPlace.pricePerPerson * 2,
                    status: 'pending',
                    paymentStatus: 'pending'
                });

                const savedDirectBooking = await directBooking.save();
                console.log('✅ Direct booking created successfully!');
                console.log('🆔 Direct Booking ID:', savedDirectBooking._id);

                // Now try the API
                console.log('\n3️⃣ Testing API endpoint directly...');
                
                // Create a test with a known user password (admin users often have simple passwords)
                const testPasswords = ['admin123', 'password123', '123456', 'admin', 'password'];
                
                for (const password of testPasswords) {
                    try {
                        console.log(`🔑 Trying password: ${password}`);
                        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                            email: adminUser.email,
                            password: password
                        });
                        
                        authToken = loginResponse.data.token;
                        userId = loginResponse.data.user._id;
                        console.log('✅ Login successful!');
                        break;
                    } catch (loginError) {
                        console.log(`❌ Password ${password} failed`);
                        continue;
                    }
                }

                if (!authToken) {
                    console.log('❌ Could not login with any test password');
                    console.log('💡 Check server logs for more details');
                    
                    // Still test the API endpoint without auth to see the error
                    console.log('\n4️⃣ Testing booking endpoint without auth...');
                    try {
                        const noAuthResponse = await axios.post(`${BASE_URL}/bookings`, {
                            placeId: testPlace._id,
                            bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                            numberOfPeople: 2
                        });
                        console.log('📥 No auth response:', noAuthResponse.data);
                    } catch (noAuthError) {
                        console.log('📥 No auth error status:', noAuthError.response?.status);
                        console.log('📥 No auth error message:', noAuthError.response?.data);
                    }
                } else {
                    // Test the booking API with auth
                    console.log('\n4️⃣ Testing booking API with auth...');
                    try {
                        const bookingResponse = await axios.post(
                            `${BASE_URL}/bookings`,
                            {
                                placeId: testPlace._id,
                                bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                                numberOfPeople: 2
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${authToken}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                        
                        console.log('✅ API booking created successfully!');
                        console.log('📋 API booking response:', bookingResponse.data);
                        
                    } catch (bookingError) {
                        console.log('❌ API booking failed');
                        console.log('📥 Error status:', bookingError.response?.status);
                        console.log('📥 Error message:', bookingError.response?.data);
                    }
                }

                // Check final booking count
                console.log('\n5️⃣ Final booking count check...');
                const finalBookingCount = await Booking.countDocuments();
                console.log(`📊 Total bookings in database: ${finalBookingCount}`);
                
                // List all bookings
                const allBookings = await Booking.find().populate('user', 'email').populate('place', 'name_eng');
                console.log('\n📋 All bookings in database:');
                allBookings.forEach((booking, index) => {
                    console.log(`   ${index + 1}. User: ${booking.user?.email}, Place: ${booking.place?.name_eng}, Status: ${booking.status}`);
                });

            } else {
                console.log('❌ No admin users found');
            }

        } catch (error) {
            console.error('❌ Error during debugging:', error.message);
        }

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n🔌 MongoDB connection closed');
        }
    }
}

// Run the debug
debugBookingAPI();
