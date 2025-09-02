const axios = require('axios');

const BASE_URL = 'http://localhost:9000/api';

// Test data
const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'tourist'
};

const testPlace = {
    name_eng: 'Test Beach',
    name_som: 'Test Beach Som',
    desc_eng: 'A beautiful test beach',
    desc_som: 'Xeeb qurux badan oo tijaabo ah',
    location: 'Test Location',
    category: 'beach',
    image_path: 'test.jpg',
    pricePerPerson: 10.0,
    maxCapacity: 20,
    availableDates: [new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] // 7 days from now
};

let authToken = '';
let userId = '';
let placeId = '';

async function testBookingFlow() {
    try {
        console.log('🧪 Testing Booking Flow...\n');

        // 1. Register or login user
        console.log('1️⃣ Registering/Login user...');
        try {
            const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
            authToken = registerResponse.data.token;
            userId = registerResponse.data.user._id;
            console.log('✅ User registered successfully');
        } catch (error) {
            if (error.response?.status === 400) {
                // User might already exist, try login
                const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                    email: testUser.email,
                    password: testUser.password
                });
                authToken = loginResponse.data.token;
                userId = loginResponse.data.user._id;
                console.log('✅ User logged in successfully');
            } else {
                throw error;
            }
        }

        // 2. Create a test place (if admin endpoints are available)
        console.log('\n2️⃣ Getting available places...');
        const placesResponse = await axios.get(`${BASE_URL}/places`);
        if (placesResponse.data.length > 0) {
            placeId = placesResponse.data[0]._id;
            console.log(`✅ Using existing place: ${placesResponse.data[0].name_eng}`);
        } else {
            console.log('❌ No places available. Please create a place first.');
            return;
        }

        // 3. Create a booking
        console.log('\n3️⃣ Creating booking...');
        const bookingData = {
            placeId: placeId,
            bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            numberOfPeople: 2
        };

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
        console.log('📋 Booking details:', {
            id: bookingResponse.data._id,
            place: bookingResponse.data.place?.name_eng || 'Unknown',
            date: bookingResponse.data.bookingDate,
            people: bookingResponse.data.numberOfPeople,
            totalPrice: bookingResponse.data.totalPrice,
            status: bookingResponse.data.status
        });

        // 4. Get user bookings
        console.log('\n4️⃣ Fetching user bookings...');
        const userBookingsResponse = await axios.get(
            `${BASE_URL}/bookings/user/${userId}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log(`✅ Found ${userBookingsResponse.data.length} booking(s) for user`);
        userBookingsResponse.data.forEach((booking, index) => {
            console.log(`   ${index + 1}. ${booking.place?.name_eng || 'Unknown Place'} - ${booking.status}`);
        });

        console.log('\n🎉 All tests passed! Booking system is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.log('💡 This might be an authentication issue. Check if JWT_SECRET is set in .env');
        }
        if (error.response?.status === 403) {
            console.log('💡 This might be a role authorization issue. Check user roles.');
        }
    }
}

// Run the test
testBookingFlow();
