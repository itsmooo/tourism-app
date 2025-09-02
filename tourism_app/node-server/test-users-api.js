const fetch = require('node-fetch');

const API_BASE = 'http://localhost:9000/api';

async function testUsersAPI() {
    console.log('🧪 Testing Users API...\n');

    try {
        // Test 1: Get all users (should fail without auth)
        console.log('1️⃣ Testing GET /users without auth...');
        const response1 = await fetch(`${API_BASE}/users`);
        console.log(`   Status: ${response1.status} ${response1.statusText}`);
        if (response1.status === 401) {
            console.log('   ✅ Correctly requires authentication');
        } else {
            console.log('   ❌ Should require authentication');
        }

        // Test 2: Test auth endpoint
        console.log('\n2️⃣ Testing auth endpoint...');
        const loginData = {
            username: 'admin',
            email: 'admin@tourism.com',
            password: 'admin123'
        };
        
        const authResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        
        if (authResponse.ok) {
            const authData = await authResponse.json();
            console.log('   ✅ Login successful');
            console.log(`   Token: ${authData.token.substring(0, 20)}...`);
            
            // Test 3: Get all users with auth
            console.log('\n3️⃣ Testing GET /users with auth...');
            const usersResponse = await fetch(`${API_BASE}/users`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`
                }
            });
            
            if (usersResponse.ok) {
                const users = await usersResponse.json();
                console.log(`   ✅ Users fetched successfully: ${users.length} users`);
                users.forEach(user => {
                    console.log(`      - ${user.username} (${user.role}) - ${user.email}`);
                });
            } else {
                console.log(`   ❌ Failed to fetch users: ${usersResponse.status}`);
                const error = await usersResponse.text();
                console.log(`   Error: ${error}`);
            }
        } else {
            console.log('   ❌ Login failed');
            const error = await authResponse.text();
            console.log(`   Error: ${error}`);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testUsersAPI();
