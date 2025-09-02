const axios = require('axios');

const BASE_URL = 'http://localhost:9000/api';

async function testFinalBooking() {
    try {
        console.log('🧪 Final Booking Test...\n');

        // Create a test user
        const testUser = {
            username: 'bookingtest',
            email: 'bookingtest@example.com',
            password: 'test123',
            role: 'tourist'
        };

        console.log('1️⃣ Creating test user...');
        try {
            const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
            console.log('✅ Test user created successfully');
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
                console.log('✅ Test user already exists, proceeding with login');
            } else {
                throw error;
            }
        }

        // Login
        console.log('\n2️⃣ Logging in...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });

        const authToken = loginResponse.data.token;
        const userId = loginResponse.data._id;
        console.log('✅ Login successful');
        console.log(`🆔 User ID: ${userId}`);

        // Use a known place ID from our database check
        console.log('\n3️⃣ Using known place...');
        const testPlace = {
            _id: '6888db3d1d62d7b6dac92dd0', // Lido Beach ID from earlier
            name_eng: 'Lido Beach'
        };
        console.log(`🏖️ Using place: ${testPlace.name_eng} (ID: ${testPlace._id})`);

        // Create booking
        console.log('\n4️⃣ Creating booking...');
        const bookingData = {
            placeId: testPlace._id,
            bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            numberOfPeople: 2
        };

        console.log('📤 Booking data:', bookingData);

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

        console.log('✅ Booking created successfully!');
        console.log('📋 Booking response:', bookingResponse.data);

        // Verify booking was saved
        console.log('\n5️⃣ Verifying booking...');
        const userBookingsResponse = await axios.get(
            `${BASE_URL}/bookings/user/${userId}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Booking verification successful!');
        console.log(`📊 User has ${userBookingsResponse.data.length} booking(s)`);
        
        userBookingsResponse.data.forEach((booking, index) => {
            console.log(`   ${index + 1}. ${booking.place?.name_eng || 'Unknown Place'} - ${booking.status} ($${booking.totalPrice})`);
        });

        console.log('\n🎉 All tests passed! Booking system is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.status) {
            console.log(`Status: ${error.response.status}`);
        }
    }
}

// Run the test
testFinalBooking();
