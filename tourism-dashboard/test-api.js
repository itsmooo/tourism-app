// Test API endpoints for the tourism dashboard
const API_BASE_URL = 'http://localhost:9000/api';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}`);
    if (response.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server response:', response.status);
    }
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
  }

  try {
    // Test 2: Get all places
    console.log('\n2️⃣ Testing GET /places endpoint...');
    const placesResponse = await fetch(`${API_BASE_URL}/places`);
    if (placesResponse.ok) {
      const placesData = await placesResponse.json();
      console.log('✅ Places endpoint working');
      console.log('📊 Response format:', typeof placesData);
      console.log('📊 Data structure:', Object.keys(placesData));
      if (placesData.data) {
        console.log('📊 Places count:', placesData.data.length);
        if (placesData.data.length > 0) {
          console.log('📊 First place:', {
            id: placesData.data[0]._id,
            name: placesData.data[0].name_eng,
            category: placesData.data[0].category
          });
        }
      } else if (Array.isArray(placesData)) {
        console.log('📊 Places count:', placesData.length);
        if (placesData.length > 0) {
          console.log('📊 First place:', {
            id: placesData[0]._id,
            name: placesData[0].name_eng,
            category: placesData[0].category
          });
        }
      }
    } else {
      console.log('❌ Places endpoint failed:', placesResponse.status);
      const errorText = await placesResponse.text();
      console.log('❌ Error details:', errorText);
    }
  } catch (error) {
    console.log('❌ Places endpoint error:', error.message);
  }

  try {
    // Test 3: Test image upload endpoint
    console.log('\n3️⃣ Testing POST /places/test-upload endpoint...');
    const formData = new FormData();
    formData.append('image', new Blob(['test'], { type: 'image/jpeg' }), 'test.jpg');
    
    const uploadResponse = await fetch(`${API_BASE_URL}/places/test-upload`, {
      method: 'POST',
      body: formData
    });
    
    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log('✅ Image upload test working');
      console.log('📊 Upload response:', uploadData);
    } else {
      console.log('❌ Image upload test failed:', uploadResponse.status);
      const errorText = await uploadResponse.text();
      console.log('❌ Error details:', errorText);
    }
  } catch (error) {
    console.log('❌ Image upload test error:', error.message);
  }

  try {
    // Test 4: Test authentication endpoint
    console.log('\n4️⃣ Testing GET /auth endpoint...');
    const authResponse = await fetch(`${API_BASE_URL}/auth`);
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Auth endpoint working');
      console.log('📊 Auth response:', authData);
    } else {
      console.log('❌ Auth endpoint failed:', authResponse.status);
      const errorText = await authResponse.text();
      console.log('❌ Error details:', errorText);
    }
  } catch (error) {
    console.log('❌ Auth endpoint error:', error.message);
  }

  console.log('\n🏁 API testing completed!');
}

// Run the test
testAPI();
